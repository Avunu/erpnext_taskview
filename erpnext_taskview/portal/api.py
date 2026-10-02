# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""Customer project portal API (served to the ``/projects`` SPA).

Every endpoint passes through :mod:`erpnext_taskview.portal.access` first and
only then reads or writes with ``ignore_permissions`` — customers hold no
Project / Task permissions of their own.  Staff previewing the portal write
with their normal permissions.
"""

import json
import os
from collections import defaultdict
from datetime import datetime
from mimetypes import guess_type
from typing import Any, cast

import frappe
from frappe import _
from frappe.handler import ALLOWED_MIMETYPES
from frappe.query_builder import DocType, Order, Table
from frappe.query_builder.functions import Count, Max
from frappe.rate_limiter import rate_limit
from frappe.utils import cint, flt, get_fullname, now_datetime, strip_html, today

from erpnext_taskview.erpnext_taskview.budget import compute_budgets
from erpnext_taskview.erpnext_taskview.models import Budget, BudgetSet

from .access import assert_project_access, assert_task_access, get_accessible_projects, is_staff
from .html import clean_customer_html, is_blank_html, render_staff_html
from .models import (
	BOARD_COLUMNS,
	BoardColumn,
	PortalActivity,
	PortalAttachment,
	PortalComment,
	PortalPhase,
	PortalProject,
	PortalProjectDetail,
	PortalTaskCard,
	PortalTaskDetail,
	PortalTimeLog,
)
from .notify import notify_team

PRIORITIES = ("Low", "Medium", "High", "Urgent")
CLOSED_PROJECT_STATUSES = ("Completed", "Cancelled")
# File types a browser may render in place; everything else downloads.
_INLINE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".pdf"}
_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".webp"}

_TASK_FIELDS = (
	"name",
	"subject",
	"status",
	"priority",
	"parent_task",
	"is_group",
	"exp_end_date",
	"owner",
	"creation",
	"modified",
	"_assign",
)


# ─────────────────────────────────────────────────────────────
#  Helpers
# ─────────────────────────────────────────────────────────────


def board_column(status: str, logged_hours: float) -> BoardColumn:
	"""Kanban column for a task status.

	ERPNext's daily job overwrites a late task's status with Overdue (losing
	the previous one), so Overdue tasks are placed by whether work has started.
	"""
	if status in BOARD_COLUMNS:
		return cast(BoardColumn, status)
	if status == "Overdue":
		return "Working" if logged_hours > 0 else "Open"
	return "Open"


def _is_overdue(status: str, exp_end_date: datetime | None) -> bool:
	if status == "Overdue":
		return True
	return bool(exp_end_date) and status not in ("Completed", "Cancelled") and exp_end_date < now_datetime()


def _load_project_tasks(project: str, *, include_cancelled: bool = False) -> dict[str, frappe._dict]:
	"""Non-template tasks of ``project`` in sibling order, keyed by name."""
	Tasks = cast(Table, DocType("Task"))
	q = (
		frappe.qb.from_(Tasks)
		.select(*(Tasks[f] for f in _TASK_FIELDS))
		.where(Tasks.project == project)
		.where(Tasks.is_template == 0)
		.orderby(Tasks.idx)
		.orderby(Tasks.creation)
	)
	if not include_cancelled:
		q = q.where(Tasks.status != "Cancelled")
	return {r.name: r for r in q.run(as_dict=True)}


def _assignee_names(assign: str | None) -> list[str]:
	if not assign:
		return []
	try:
		users = json.loads(assign)
	except ValueError:
		return []
	return [get_fullname(u) for u in users]


def _count_by_task(doctype: str, link_field: str, names: list[str], **filters: Any) -> dict[str, int]:
	if not names:
		return {}
	Table_ = cast(Table, DocType(doctype))
	q = (
		frappe.qb.from_(Table_)
		.select(Table_[link_field], Count("*").as_("n"))
		.where(Table_[link_field].isin(names))
		.groupby(Table_[link_field])
	)
	for field, value in filters.items():
		q = q.where(Table_[field] == value)
	return {r[0]: cint(r[1]) for r in q.run()}


def _phase_of(task: frappe._dict, tasks: dict[str, frappe._dict]) -> frappe._dict | None:
	"""The top-level group task (phase) ``task`` sits under, if any."""
	root, seen = None, {task.name}
	parent = tasks.get(task.parent_task) if task.parent_task else None
	while parent and parent.name not in seen:
		root = parent
		seen.add(parent.name)
		parent = tasks.get(parent.parent_task) if parent.parent_task else None
	return root if root and root.is_group else None


def _make_card(
	t: frappe._dict,
	tasks: dict[str, frappe._dict],
	budgets: BudgetSet,
	comment_counts: dict[str, int],
	attachment_counts: dict[str, int],
) -> PortalTaskCard:
	budget = budgets.tasks.get(t.name) or Budget()
	parent = tasks.get(t.parent_task) if t.parent_task else None
	phase = _phase_of(t, tasks)
	return PortalTaskCard(
		name=t.name,
		subject=t.subject,
		status=t.status,
		column=board_column(t.status, budget.logged_hours),
		priority=t.priority,
		parent_task=t.parent_task,
		parent_subject=parent.subject if parent else None,
		phase=phase.name if phase else None,
		phase_subject=phase.subject if phase else None,
		is_group=bool(t.is_group),
		is_overdue=_is_overdue(t.status, t.exp_end_date),
		exp_end_date=t.exp_end_date,
		budget=budget,
		assignees=_assignee_names(t._assign),
		comment_count=comment_counts.get(t.name, 0),
		attachment_count=attachment_counts.get(t.name, 0),
		is_mine=t.owner == frappe.session.user,
		creation=t.creation,
		modified=t.modified,
	)


def _column_counts(cards: list[PortalTaskCard]) -> dict[str, int]:
	counts = dict.fromkeys(BOARD_COLUMNS, 0)
	for c in cards:
		if not c.is_group:
			counts[c.column] += 1
	return counts


def _project_row(project: str) -> frappe._dict:
	return frappe.db.get_value(
		"Project",
		project,
		["name", "project_name", "status", "customer", "expected_end_date", "percent_complete", "modified"],
		as_dict=True,
	)


def _portal_project(row: frappe._dict, budgets: BudgetSet, counts: dict[str, int]) -> PortalProject:
	return PortalProject(
		name=row.name,
		title=row.project_name or row.name,
		status=row.status,
		customer=row.customer,
		expected_end_date=row.expected_end_date,
		percent_complete=flt(row.percent_complete),
		modified=row.modified,
		budget=budgets.projects.get(row.name) or Budget(),
		counts=counts,
	)


def _recent_activity(project: str, tasks: dict[str, frappe._dict], limit: int = 20) -> list[PortalActivity]:
	"""Latest comments, attachments, status changes, time entries and new tasks on the project."""
	names = list(tasks)
	items: list[PortalActivity] = []

	if names:
		Comment = cast(Table, DocType("Comment"))
		for c in (
			frappe.qb.from_(Comment)
			.select(
				Comment.reference_name,
				Comment.comment_type,
				Comment.content,
				Comment.comment_by,
				Comment.owner,
				Comment.creation,
			)
			.where(Comment.reference_doctype == "Task")
			.where(Comment.reference_name.isin(names))
			.where(Comment.comment_type.isin(["Comment", "Attachment"]))
			.orderby(Comment.creation, order=Order.desc)
			.limit(limit)
		).run(as_dict=True):
			is_attachment = c.comment_type == "Attachment"
			items.append(
				PortalActivity(
					kind="attachment" if is_attachment else "comment",
					task=c.reference_name,
					task_subject=tasks[c.reference_name].subject,
					by=c.comment_by or get_fullname(c.owner),
					at=c.creation,
					text="" if is_attachment else strip_html(c.content or "")[:200],
				)
			)

		Version = cast(Table, DocType("Version"))
		for v in (
			frappe.qb.from_(Version)
			.select(Version.docname, Version.data, Version.owner, Version.creation)
			.where(Version.ref_doctype == "Task")
			.where(Version.docname.isin(names))
			.orderby(Version.creation, order=Order.desc)
			.limit(limit * 2)
		).run(as_dict=True):
			try:
				changed = json.loads(v.data or "{}").get("changed") or []
			except ValueError:
				continue
			for field, old, new in changed:
				if field == "status" and old != new:
					items.append(
						PortalActivity(
							kind="status",
							task=v.docname,
							task_subject=tasks[v.docname].subject,
							by=get_fullname(v.owner),
							at=v.creation,
							text=f"{old or '—'} → {new}",
						)
					)

	TD = cast(Table, DocType("Timesheet Detail"))
	TS = cast(Table, DocType("Timesheet"))
	for r in (
		frappe.qb.from_(TD)
		.join(TS)
		.on(TD.parent == TS.name)
		.select(TD.task, TD.hours, TD.description, TD.from_time, TD.creation, TS.employee_name, TS.owner)
		.where(TD.parenttype == "Timesheet")
		.where(TD.docstatus < 2)
		.where(TD.project == project)
		.where(TD.to_time.isnotnull())
		.orderby(TD.from_time, order=Order.desc)
		.limit(limit)
	).run(as_dict=True):
		hours = flt(r.hours, 2)
		desc = strip_html(r.description or "")[:160]
		task = tasks.get(r.task) if r.task else None
		items.append(
			PortalActivity(
				kind="time",
				task=task.name if task else None,
				task_subject=task.subject if task else None,
				by=r.employee_name or get_fullname(r.owner),
				at=r.from_time or r.creation,
				text=f"{hours:g} h" + (f" — {desc}" if desc else ""),
			)
		)

	for t in sorted(tasks.values(), key=lambda t: t.creation, reverse=True)[:limit]:
		items.append(
			PortalActivity(
				kind="created", task=t.name, task_subject=t.subject, by=get_fullname(t.owner), at=t.creation
			)
		)

	items.sort(key=lambda a: a.at, reverse=True)
	return items[:limit]


# ─────────────────────────────────────────────────────────────
#  Reads
# ─────────────────────────────────────────────────────────────


@frappe.whitelist()
def get_projects() -> list[dict]:
	"""Projects the user can open, with budgets and per-column task counts."""
	names = get_accessible_projects()
	if not names:
		return []

	Projects = cast(Table, DocType("Project"))
	rows = (
		frappe.qb.from_(Projects)
		.select(
			Projects.name,
			Projects.project_name,
			Projects.status,
			Projects.customer,
			Projects.expected_end_date,
			Projects.percent_complete,
			Projects.modified,
		)
		.where(Projects.name.isin(names))
		.orderby(Projects.modified, order=Order.desc)
	).run(as_dict=True)

	budgets = compute_budgets(names)

	Tasks = cast(Table, DocType("Task"))
	counts: dict[str, dict[str, int]] = defaultdict(lambda: dict.fromkeys(BOARD_COLUMNS, 0))
	for t in (
		frappe.qb.from_(Tasks)
		.select(Tasks.name, Tasks.project, Tasks.status)
		.where(Tasks.project.isin(names))
		.where(Tasks.is_template == 0)
		.where(Tasks.is_group == 0)
		.where(Tasks.status != "Cancelled")
	).run(as_dict=True):
		logged = (budgets.tasks.get(t.name) or Budget()).logged_hours
		counts[t.project][board_column(t.status, logged)] += 1

	return [_portal_project(r, budgets, counts[r.name]).model_dump() for r in rows]


@frappe.whitelist()
def get_project(project: str) -> dict:
	"""Everything the project overview, task list and board need, in one call."""
	assert_project_access(project)
	row = _project_row(project)
	budgets = compute_budgets([project])
	tasks = _load_project_tasks(project)
	names = list(tasks)

	comment_counts = _count_by_task(
		"Comment", "reference_name", names, reference_doctype="Task", comment_type="Comment"
	)
	attachment_counts = _count_by_task(
		"File", "attached_to_name", names, attached_to_doctype="Task", is_folder=0
	)
	cards = [_make_card(t, tasks, budgets, comment_counts, attachment_counts) for t in tasks.values()]

	leaves_by_phase: dict[str, list[PortalTaskCard]] = defaultdict(list)
	for c in cards:
		if c.phase and not c.is_group:
			leaves_by_phase[c.phase].append(c)
	phases = [
		PortalPhase(
			name=t.name,
			subject=t.subject,
			status=t.status,
			budget=budgets.tasks.get(t.name) or Budget(),
			task_count=len(leaves_by_phase[t.name]),
			completed_count=sum(1 for c in leaves_by_phase[t.name] if c.status == "Completed"),
		)
		for t in tasks.values()
		if t.is_group and not t.parent_task
	]

	return PortalProjectDetail(
		project=_portal_project(row, budgets, _column_counts(cards)),
		phases=phases,
		tasks=cards,
		activity=_recent_activity(project, tasks),
		can_create=row.status not in CLOSED_PROJECT_STATUSES,
	).model_dump()


@frappe.whitelist()
def get_task(task: str) -> dict:
	"""Task drawer: description, ancestors, comments, time log and attachments."""
	ref = assert_task_access(task)
	project = ref.project
	tasks = _load_project_tasks(project, include_cancelled=True)
	budgets = compute_budgets([project])
	t = tasks[task]

	comment_counts = _count_by_task(
		"Comment", "reference_name", [task], reference_doctype="Task", comment_type="Comment"
	)
	attachment_counts = _count_by_task(
		"File", "attached_to_name", [task], attached_to_doctype="Task", is_folder=0
	)
	card = _make_card(t, tasks, budgets, comment_counts, attachment_counts)

	ancestors: list[dict[str, str]] = []
	seen = {task}
	parent = tasks.get(t.parent_task) if t.parent_task else None
	while parent and parent.name not in seen:
		ancestors.insert(0, {"name": parent.name, "subject": parent.subject})
		seen.add(parent.name)
		parent = tasks.get(parent.parent_task) if parent.parent_task else None

	# Comments — every comment on the task is visible to the customer.
	Comment = cast(Table, DocType("Comment"))
	comment_rows = (
		frappe.qb.from_(Comment)
		.select(Comment.name, Comment.content, Comment.comment_by, Comment.owner, Comment.creation)
		.where(Comment.reference_doctype == "Task")
		.where(Comment.reference_name == task)
		.where(Comment.comment_type == "Comment")
		.orderby(Comment.creation)
	).run(as_dict=True)
	owners = {c.owner for c in comment_rows}
	users = (
		{
			u.name: u
			for u in frappe.get_all(
				"User", filters={"name": ("in", list(owners))}, fields=["name", "user_type", "user_image"]
			)
		}
		if owners
		else {}
	)
	comments = [
		PortalComment(
			name=c.name,
			content=render_staff_html(c.content),
			by=c.comment_by or get_fullname(c.owner),
			by_image=(users.get(c.owner) or {}).get("user_image"),
			is_mine=c.owner == frappe.session.user,
			is_staff=(users.get(c.owner) or {}).get("user_type") == "System User",
			creation=c.creation,
		)
		for c in comment_rows
	]

	# Time log — this task and all of its subtasks.
	children: dict[str, list[str]] = defaultdict(list)
	for other in tasks.values():
		if other.parent_task:
			children[other.parent_task].append(other.name)
	subtree, stack = [], [task]
	while stack:
		name = stack.pop()
		if name in subtree:
			continue
		subtree.append(name)
		stack.extend(children.get(name, ()))

	TD = cast(Table, DocType("Timesheet Detail"))
	TS = cast(Table, DocType("Timesheet"))
	now = now_datetime()
	time_logs: list[PortalTimeLog] = []
	for r in (
		frappe.qb.from_(TD)
		.join(TS)
		.on(TD.parent == TS.name)
		.select(
			TD.name,
			TD.task,
			TD.from_time,
			TD.to_time,
			TD.hours,
			TD.description,
			TD.is_billable,
			TD.activity_type,
			TD.start_time,
			TD.paused,
			TD.paused_time_in_seconds,
			TS.employee_name,
			TS.owner,
		)
		.where(TD.parenttype == "Timesheet")
		.where(TD.docstatus < 2)
		.where(TD.task.isin(subtree))
		.orderby(TD.from_time, order=Order.desc)
	).run(as_dict=True):
		running = r.to_time is None and r.start_time is not None
		hours = flt(r.hours)
		if running:
			seconds = flt(r.paused_time_in_seconds)
			if not r.paused:
				seconds += max(0.0, (now - r.start_time).total_seconds())
			hours = seconds / 3600
		time_logs.append(
			PortalTimeLog(
				name=r.name,
				task=r.task,
				task_subject=tasks[r.task].subject if r.task in tasks else None,
				date=(r.from_time or r.start_time).date() if (r.from_time or r.start_time) else None,
				staff=r.employee_name or get_fullname(r.owner),
				hours=round(hours, 2),
				description=strip_html(r.description or ""),
				activity_type=r.activity_type,
				not_billed=not r.is_billable,
				running=running and not r.paused,
			)
		)

	# Attachments
	attachments = [
		_attachment(f)
		for f in frappe.get_all(
			"File",
			filters={"attached_to_doctype": "Task", "attached_to_name": task, "is_folder": 0},
			fields=["name", "file_name", "file_size", "owner", "creation"],
			order_by="creation desc",
		)
	]

	return PortalTaskDetail(
		task=card,
		description=render_staff_html(frappe.db.get_value("Task", task, "description")),
		ancestors=ancestors,
		comments=comments,
		time_logs=time_logs,
		attachments=attachments,
		total_hours=round(sum(tl.hours for tl in time_logs), 2),
		not_billed_hours=round(sum(tl.hours for tl in time_logs if tl.not_billed), 2),
		project_title=frappe.db.get_value("Project", project, "project_name") or project,
	).model_dump()


def _attachment(f: frappe._dict) -> PortalAttachment:
	ext = os.path.splitext(f.file_name or "")[1].lower()
	return PortalAttachment(
		name=f.name,
		file_name=f.file_name or f.name,
		url=f"/api/method/erpnext_taskview.portal.api.download_file?name={f.name}",
		file_size=cint(f.file_size),
		is_image=ext in _IMAGE_EXTENSIONS,
		by=get_fullname(f.owner),
		creation=f.creation,
	)


# ─────────────────────────────────────────────────────────────
#  Writes
# ─────────────────────────────────────────────────────────────


@frappe.whitelist(methods=["POST"])
def set_task_status(task: str, status: str) -> dict:
	"""Move a task between board columns (customers may move any leaf task)."""
	ref = assert_task_access(task)
	if status not in BOARD_COLUMNS:
		frappe.throw(_("Tasks can only be moved to {0}.").format(", ".join(BOARD_COLUMNS)))
	if ref.is_group:
		frappe.throw(_("Phases move with their tasks and can't be dragged."))

	doc = frappe.get_doc("Task", task, for_update=True)
	if doc.status == status:
		return {"name": doc.name, "status": doc.status}

	old = doc.status
	if status == "Completed":
		doc.completed_on = today()
		doc.completed_by = frappe.session.user
	elif old == "Completed":
		doc.completed_on = None
		doc.completed_by = None
	doc.status = status

	staff = is_staff()
	doc.save(ignore_permissions=not staff)
	if not staff:
		notify_team(task, "status", f"{old} → {status}")
	return {"name": doc.name, "status": doc.status}


@frappe.whitelist(methods=["POST"])
@rate_limit(limit=60, seconds=60 * 60)
def create_task(
	project: str,
	subject: str,
	description: str | None = None,
	parent_task: str | None = None,
	priority: str | None = None,
) -> dict:
	"""Add a task to a project, optionally under one of its phases (open group tasks)."""
	assert_project_access(project)
	if frappe.db.get_value("Project", project, "status") in CLOSED_PROJECT_STATUSES:
		frappe.throw(_("This project is closed to new tasks."))

	subject = (subject or "").strip()
	if not subject:
		frappe.throw(_("Please give the task a title."))

	if parent_task:
		parent = frappe.db.get_value(
			"Task", parent_task, ["project", "is_group", "is_template", "status"], as_dict=True
		)
		if (
			not parent
			or parent.project != project
			or not parent.is_group
			or parent.is_template
			or parent.status in ("Completed", "Cancelled")
		):
			frappe.throw(_("Tasks can only be added under an open phase of this project."))

	# Append after the existing siblings so the desk's manual order is kept.
	Tasks = cast(Table, DocType("Task"))
	siblings = frappe.qb.from_(Tasks).select(Max(Tasks.idx)).where(Tasks.project == project)
	siblings = (
		siblings.where(Tasks.parent_task == parent_task)
		if parent_task
		else siblings.where(Tasks.parent_task.isnull() | (Tasks.parent_task == ""))
	)
	max_idx = cint((siblings.run() or [[0]])[0][0])

	description = clean_customer_html(description)
	doc = frappe.get_doc(
		{
			"doctype": "Task",
			"subject": subject,
			"project": project,
			"parent_task": parent_task or None,
			"priority": priority if priority in PRIORITIES else "Medium",
			"description": None if is_blank_html(description) else description,
			"status": "Open",
			"idx": max_idx + 1,
		}
	)
	staff = is_staff()
	doc.insert(ignore_permissions=not staff)
	if not staff:
		notify_team(doc.name, "created", doc.description)
	return {"name": doc.name}


@frappe.whitelist(methods=["POST"])
@rate_limit(limit=60, seconds=60 * 60)
def add_comment(task: str, content: str) -> dict:
	"""Comment on a task as the current user."""
	assert_task_access(task)
	html = clean_customer_html(content)
	if is_blank_html(html):
		frappe.throw(_("Please write a comment first."))

	user = frappe.session.user
	comment = frappe.get_doc("Task", task).add_comment(
		"Comment", text=html, comment_email=user, comment_by=get_fullname(user)
	)
	if not is_staff():
		notify_team(task, "comment", html)

	image = frappe.db.get_value("User", user, "user_image")
	return PortalComment(
		name=comment.name,
		content=render_staff_html(comment.content),
		by=comment.comment_by or get_fullname(user),
		by_image=image,
		is_mine=True,
		is_staff=is_staff(),
		creation=comment.creation,
	).model_dump()


def save_attachment(task: str, filename: str, content: bytes) -> PortalAttachment:
	"""Attach ``content`` to ``task`` as a private File (caller has checked access)."""
	if not is_staff() and guess_type(filename)[0] not in ALLOWED_MIMETYPES:
		frappe.throw(_("You can only upload JPG, PNG, GIF, PDF, TXT, CSV or Microsoft documents."))

	file = frappe.get_doc(
		{
			"doctype": "File",
			"attached_to_doctype": "Task",
			"attached_to_name": task,
			"folder": "Home/Attachments",
			"file_name": filename,
			"is_private": 1,
			"content": content,
		}
	)
	file.save(ignore_permissions=True)
	return _attachment(
		frappe._dict(
			name=file.name,
			file_name=file.file_name,
			file_size=file.file_size,
			owner=file.owner,
			creation=file.creation,
		)
	)


@frappe.whitelist(methods=["POST"])
@rate_limit(limit=60, seconds=60 * 60)
def upload_attachment() -> dict:
	"""Multipart upload from frappe-ui's FileUploader (``file`` + ``docname`` = task)."""
	task = frappe.form_dict.get("docname") or frappe.form_dict.get("task")
	assert_task_access(task)

	upload = frappe.request.files.get("file") if frappe.request else None
	if not upload or not upload.filename:
		frappe.throw(_("No file was uploaded."))

	attachment = save_attachment(task, upload.filename, upload.stream.read())
	if not is_staff():
		notify_team(task, "attachment", attachment.file_name)
	return attachment.model_dump()


def _check_file_access(file: frappe._dict) -> bool:
	try:
		if file.attached_to_doctype == "Task":
			assert_task_access(file.attached_to_name)
			return True
		if file.attached_to_doctype == "Project":
			assert_project_access(file.attached_to_name)
			return True
	except frappe.PermissionError:
		frappe.clear_last_message()
	return False


@frappe.whitelist(methods=["GET"])
def download_file(name: str | None = None, file_url: str | None = None) -> None:
	"""Serve a file attached to a task / project the user can open.

	Customers can't use ``/private/files`` (or cloud_storage's ``retrieve``)
	directly: both require read permission on the attached Task.  ``file_url``
	is used for images embedded in descriptions and comments.
	"""
	fields = ["name", "attached_to_doctype", "attached_to_name", "is_folder"]
	if name:
		candidates = frappe.get_all("File", filters={"name": name}, fields=fields)
	elif file_url:
		candidates = frappe.get_all("File", filters={"file_url": file_url}, fields=fields)
	else:
		candidates = []

	match = next((f for f in candidates if not f.is_folder and _check_file_access(f)), None)
	if not match:
		frappe.throw(_("You do not have access to this file."), frappe.PermissionError)

	file = frappe.get_doc("File", match.name)
	ext = os.path.splitext(file.file_name or "")[1].lower()
	frappe.local.response.filename = file.file_name
	frappe.local.response.filecontent = file.get_content()
	frappe.local.response.type = "download"
	frappe.local.response.display_content_as = "inline" if ext in _INLINE_EXTENSIONS else "attachment"
