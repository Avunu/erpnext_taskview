"""Backend API for the ERPNext Task View.

This module exposes **three** whitelisted endpoints consumed by the Vue
frontend:

``get()``
    Returns flat lists of projects and tasks.
    Accepts optional Frappe report-view filters via ``get_form_params()``.

``get_active_timers()``
    Returns all open (``to_time IS NULL``) timesheet details for the
    current user regardless of project filter.  Each row is enriched
    with ``task_subject`` and ``project_name`` so the global timer dock
    can render without additional round-trips.

``save_doc(payload)``
    Accepts a JSON-serialised :class:`SaveDocRequest` and routes the
    enclosed document to the appropriate handler based on its ``doctype``
    discriminator:

    - ``"Project"``  → :func:`_save_project`
    - ``"Task"``     → :func:`_save_task`
    - ``"Timesheet Detail"`` → :func:`_save_timesheet_detail`

    After every mutation the endpoint returns a fresh ``get()`` response
    so the frontend can rebuild the tree with current data.

Design principles
-----------------
- **Flat data, no tree building**: the backend returns raw doc lists;
  the Vue frontend assembles the tree and derives all UI state.
- **Field-driven actions**: timer operations (start / pause / resume /
  stop / manual log) are inferred from the fields present on the
  :class:`TimesheetDetailDoc` payload — no separate action enum.
- **Single round-trip mutations**: every ``save_doc`` call returns a
  complete snapshot, so the frontend never needs a follow-up ``get()``.
"""

import datetime
import json
from typing import Any, cast

import frappe
from erpnext.projects.doctype.timesheet.timesheet import Timesheet
from frappe.desk.reportview import get_form_params
from frappe.query_builder import DocType, Table
from frappe.types.frappedict import _dict
from frappe.utils.data import get_datetime

from .custom.timesheet_detail import TimesheetDetail
from .models import (
	ActiveTimerDoc,
	ActiveTimersResponse,
	GetResponse,
	ProjectDoc,
	SaveDocRequest,
	TaskDoc,
	TimesheetDetailDoc,
)

# ─────────────────────────────────────────────────────────────
#  Helpers
# ─────────────────────────────────────────────────────────────


def _apply_filter(query: Any, table: Table, filter_tuple: list) -> Any:
	"""Apply a single Frappe filter tuple to a PyPika query.

	Frappe list-view filters arrive as four-element tuples::

	[doctype, fieldname, operator, value]

	This function translates the operator string into the corresponding
	PyPika criterion and appends it to the query's ``WHERE`` clause.

	Supported operators: ``=``, ``!=``, ``like``, ``not like``, ``in``,
	``not in``, ``>``, ``<``, ``>=``, ``<=``, ``between``, ``is``
	(set / not set).

	Args:
		query: The in-progress PyPika query builder.
		table: The PyPika table reference to resolve field names against.
		filter_tuple: A ``[doctype, field, op, value]`` list from the
			Frappe report-view params.

	Returns:
		The query with the additional ``WHERE`` clause appended.

	Raises:
		frappe.ValidationError: If the operator is unsupported.
	"""
	_doctype, fieldname, operator, value = filter_tuple
	field = table[fieldname]

	match operator.lower().strip():
		case "=":
			return query.where(field == value)
		case "!=":
			return query.where(field != value)
		case "like":
			return query.where(field.like(value))
		case "not like":
			return query.where(field.not_like(value))
		case "in":
			return query.where(field.isin(value if isinstance(value, (list, tuple, set)) else [value]))
		case "not in":
			return query.where(field.notin(value if isinstance(value, (list, tuple, set)) else [value]))
		case ">":
			return query.where(field > value)
		case "<":
			return query.where(field < value)
		case ">=":
			return query.where(field >= value)
		case "<=":
			return query.where(field <= value)
		case "between":
			return query.where(field.between(value[0], value[1]))
		case "is":
			if value and str(value).lower() == "set":
				return query.where(field.isnotnull())
			return query.where(field.isnull())
		case _:
			frappe.throw(f"Unsupported filter operator: {operator}")

	return query


# ─────────────────────────────────────────────────────────────
#  GET — flat lists of projects, tasks, and timesheet details
# ─────────────────────────────────────────────────────────────


@frappe.whitelist()
@frappe.read_only()
def get(args: str | dict | None = None) -> GetResponse:
	"""Fetch projects and tasks as flat lists.

	Executes two PyPika queries:

	1. **Projects** — all non-cancelled projects, optionally filtered by
		``get_form_params()`` when the list-view doctype is ``"Project"``.
	2. **Tasks** — all non-cancelled tasks belonging to the matched
		projects, ordered by nested-set ``lft`` so the tree can be
		reconstructed via a single parent-key pass.

	Timer state is served separately by :func:`get_active_timers` and
	managed by the global timer store on the frontend.

	Returns:
		A :class:`GetResponse` with two flat lists.
	"""
	if not args:
		args = get_form_params()
	if isinstance(args, str):
		args = json.loads(args)
	if isinstance(args, dict):
		args = _dict(args)

	assert isinstance(args, _dict), "Invalid arguments"

	Projects = cast(Table, DocType("Project"))
	Tasks = cast(Table, DocType("Task"))
	TD = cast(Table, DocType("ToDo"))

	# ── Projects ──────────────────────────────────────────────
	pq = (
		frappe.qb.from_(Projects)
		.select(
			Projects.name,
			Projects.project_name,
			Projects.status,
			Projects.customer,
		)
		.where(Projects.docstatus == 0)
		.orderby(Projects.name)
	)

	if args.doctype == "Project" and args.filters:
		for f in args.filters:
			pq = _apply_filter(pq, Projects, f)

	if args.doctype == "Task" and args.filters:
		for f in args.filters:
			fieldname = f[1] if isinstance(f, (list, tuple)) else f.get("fieldname", "")
			if fieldname == "project":
				pq = _apply_filter(
					pq,
					Projects,
					[
						f[0] if isinstance(f, (list, tuple)) else f.get("doctype", "Project"),
						"name",
						f[2] if isinstance(f, (list, tuple)) else f.get("operator", "="),
						f[3] if isinstance(f, (list, tuple)) else f.get("value", ""),
					],
				)

	projects_raw = pq.run(as_dict=True)
	if not projects_raw:
		return GetResponse(projects=[], tasks=[]).model_dump()

	project_names = [r["name"] for r in projects_raw]
	projects = [ProjectDoc(**r) for r in projects_raw]

	# ── Tasks ─────────────────────────────────────────────────
	# Left-join ToDo to get per-user pin state in a single query.
	# The join is scoped to the current user's open pinned ToDos.
	tq = (
		frappe.qb.from_(Tasks)
		.left_join(TD)
		.on(
			(TD.reference_type == "Task")
			& (TD.reference_name == Tasks.name)
			& (TD.allocated_to == frappe.session.user)
			& (TD.status == "Open")
			& (TD.pin == 1)
		)
		.select(
			Tasks.name,
			Tasks.subject,
			Tasks.project,
			Tasks.parent_task,
			Tasks.status,
			Tasks.is_group,
			Tasks.priority,
			Tasks._assign,
			TD.name.as_("todo_name"),
			TD.idx.as_("pin_idx"),
		)
		.where(Tasks.docstatus == 0)
		.where(Tasks.project.isin(project_names))
		.orderby(Tasks.lft)
	)

	if args.doctype == "Task" and args.filters:
		for f in args.filters:
			tq = _apply_filter(tq, Tasks, f)

	# Hide closed tasks unless the user explicitly filters by status
	has_status_filter = args.doctype == "Task" and any(
		(f[1] if isinstance(f, (list, tuple)) else f.get("fieldname", "")) == "status"
		for f in (args.filters or [])
	)
	if not has_status_filter:
		tq = tq.where(Tasks.status.notin(["Completed", "Cancelled"]))

	tasks = [TaskDoc(**r) for r in tq.run(as_dict=True)]

	return GetResponse(
		projects=projects,
		tasks=tasks,
	).model_dump()


# ─────────────────────────────────────────────────────────────
#  GET_ACTIVE_TIMERS — all open timers for the current user
# ─────────────────────────────────────────────────────────────


@frappe.whitelist()
@frappe.read_only()
def get_active_timers() -> ActiveTimersResponse:
	"""Fetch all open timesheet details for the current user.

	Unlike :func:`get`, this endpoint is not filtered by the list-view's
	project selection — it returns **every** open timer (``to_time IS NULL``)
	owned by the current session user.  Each row is enriched with
	``task_subject`` and ``project_name`` so the floating timer dock can
	display them without additional round-trips.

	Returns:
		An :class:`ActiveTimersResponse` containing enriched timer rows.
	"""
	TD = cast(Table, DocType("Timesheet Detail"))
	Tasks = cast(Table, DocType("Task"))
	Projects = cast(Table, DocType("Project"))

	rows = (
		frappe.qb.from_(TD)
		.left_join(Tasks)
		.on(TD.task == Tasks.name)
		.left_join(Projects)
		.on(TD.project == Projects.name)
		.select(
			TD.name,
			TD.parent,
			TD.project,
			TD.task,
			Tasks.subject.as_("task_subject"),
			Projects.project_name,
			Projects.customer,
			TD.from_time,
			TD.to_time,
			TD.hours,
			TD.paused,
			TD.start_time,
			TD.paused_time_in_seconds,
			TD.description,
		)
		.where(TD.owner == frappe.session.user)
		.where(TD.to_time.isnull())
		.run(as_dict=True)
	)

	timers = [ActiveTimerDoc(**r) for r in rows]
	return ActiveTimersResponse(timers=timers).model_dump()


# ── Project ───────────────────────────────────────────────────


def _save_project(doc: ProjectDoc) -> None:
	"""Insert or update a Project.

	Insert/update is determined by the presence of ``doc.name``:

	- **Has name** → update ``project_name`` and ``status`` via
		``frappe.db.set_value``.
	- **No name** → insert a new Project document.

	Args:
		doc: Validated :class:`ProjectDoc` from the request payload.
	"""
	if doc.name:
		frappe.db.set_value(
			"Project",
			doc.name,
			{
				"project_name": doc.project_name,
				"status": doc.status,
			},
		)
	else:
		frappe.get_doc(
			{
				"doctype": "Project",
				"project_name": doc.project_name,
				"status": doc.status,
			}
		).insert()


def _update_children_project(children: list[TaskDoc], project: str) -> None:
	"""Bulk-update the ``project`` field on descendant tasks.

	Called after a drag-reparent when the dragged task moved to a
	different project.  Each child with a valid ``name`` gets its
	``project`` field set to the new value.

	Args:
		children: Flat list of descendant :class:`TaskDoc` models.
		project: The new project name to assign.
	"""
	for child in children:
		if child.name:
			frappe.db.set_value("Task", child.name, {"project": project})


# ── Task ──────────────────────────────────────────────────────


def _save_task(doc: TaskDoc, children: list[TaskDoc] | None = None) -> None:
	"""Insert or update a Task, with optional descendant reparenting.

	Insert/update is determined by the presence of ``doc.name``.

	When ``children`` is provided (typically during a drag operation) the
	``project`` field on every descendant is bulk-updated via
	:func:`_update_children_project`.

	Side effects:
		- If the Task has a ``parent_task``, that parent's ``is_group``
			flag is set to ``1``.
		- Descendant tasks have their ``project`` field updated when
			``children`` is provided and the project has changed.

	Args:
		doc: Validated :class:`TaskDoc` from the request payload.
		children: Flat list of descendant tasks whose ``project`` field
			should be updated.  ``None`` for non-drag operations.
	"""
	if doc.name:
		update_fields: dict[str, Any] = {}
		for field in ("subject", "project", "parent_task", "status", "is_group", "priority"):
			val = getattr(doc, field)
			if val is not None:
				update_fields[field] = val

		# If reparenting, ensure new parent has is_group=1
		if doc.parent_task:
			frappe.db.set_value("Task", doc.parent_task, {"is_group": 1})

		# If project changed, update descendant tasks
		if children and doc.project:
			_update_children_project(children, doc.project)

		frappe.db.set_value("Task", doc.name, update_fields)
	else:
		new_doc: dict[str, Any] = {
			"doctype": "Task",
			"subject": doc.subject,
			"project": doc.project,
			"status": doc.status,
			"priority": doc.priority,
		}
		if doc.parent_task:
			new_doc["parent_task"] = doc.parent_task
			frappe.db.set_value("Task", doc.parent_task, {"is_group": 1})
		frappe.get_doc(new_doc).insert()


def _get_or_create_timesheet_detail(project: str, task: str, description: str = "") -> TimesheetDetail:
	"""Find an open Timesheet Detail or create a new one.

	Looks for an existing row with ``to_time IS NULL`` for the given
	project/task combination.  If none exists, appends a new row to the
	current user's draft Timesheet (creating the Timesheet itself if
	necessary).

	Args:
		project: The Frappe Project name.
		task: The Frappe Task name.
		description: Optional initial description for the new row.

	Returns:
		A :class:`TimesheetDetail` document ready for field assignment
		and ``save()``.
	"""
	existing = frappe.db.exists("Timesheet Detail", {"project": project, "task": task, "to_time": None})
	if existing:
		return cast(TimesheetDetail, frappe.get_doc("Timesheet Detail", existing))

	employee_name = frappe.db.get_value("Employee", {"user_id": frappe.session.user}, "name")

	existing_timesheet = frappe.db.exists(
		"Timesheet", {"employee": employee_name, "docstatus": 0, "parent_project": project}
	)

	if existing_timesheet:
		timesheet = cast(Timesheet, frappe.get_doc("Timesheet", existing_timesheet))
	else:
		timesheet = cast(Timesheet, frappe.new_doc("Timesheet"))
		timesheet.doctype = "Timesheet"
		timesheet.employee = employee_name
		timesheet.parent_project = project

	timesheet.append(
		"time_logs",
		{
			"project": project,
			"task": task,
			"description": description,
		},
	)

	if existing_timesheet:
		timesheet.save(ignore_permissions=True)
	else:
		timesheet.insert(ignore_permissions=True)

	frappe.db.commit()
	return cast(TimesheetDetail, frappe.get_doc("Timesheet Detail", timesheet.time_logs[-1].name))


# ── Timesheet Detail ─────────────────────────────────────────


def _save_timesheet_detail(doc: TimesheetDetailDoc) -> None:
	"""Handle all timer operations by inspecting the doc fields.

	Instead of an explicit action enum, the backend derives the intended
	operation from the combination of fields present on the incoming
	:class:`TimesheetDetailDoc`:

	+-----------------------+--------------------------------------------+
	| Fields present        | Action                                     |
	+=======================+============================================+
	| No ``name``,          | **Manual time log** — set ``from_time``,   |
	| ``from_time`` +       | ``to_time``, compute ``hours``.            |
	| ``to_time``           |                                            |
	+-----------------------+--------------------------------------------+
	| No ``name``           | **Start** new timer — set ``from_time``    |
	|                       | and ``start_time`` to now.                 |
	+-----------------------+--------------------------------------------+
	| ``name`` + ``to_time``| **Stop** — compute final ``hours`` and     |
	|                       | ``to_time``.                               |
	+-----------------------+--------------------------------------------+
	| ``name`` +            | **Pause** — accumulate elapsed seconds     |
	| ``paused == 1``       | into ``paused_time_in_seconds``.           |
	+-----------------------+--------------------------------------------+
	| ``name`` +            | **Resume** — reset ``start_time`` to now   |
	| ``paused == 0``       | and clear ``paused``.                      |
	+-----------------------+--------------------------------------------+

	Args:
		doc: Validated :class:`TimesheetDetailDoc` from the payload.

	Side effects:
		Creates or mutates a Timesheet Detail row and its parent
		Timesheet via ``frappe.get_doc`` / ``frappe.new_doc``.
	"""
	now = get_datetime()
	assert isinstance(now, datetime.datetime)

	if not doc.name:
		# New timesheet detail — either start timer or log manual entry
		detail = _get_or_create_timesheet_detail(doc.project, doc.task, doc.description)

		if doc.from_time and doc.to_time:
			# Manual time log — user provided both times
			detail.from_time = get_datetime(doc.from_time)
			detail.to_time = get_datetime(doc.to_time)
			assert isinstance(detail.from_time, datetime.datetime)
			assert isinstance(detail.to_time, datetime.datetime)
			detail.hours = (detail.to_time - detail.from_time).total_seconds() / 3600
			if doc.activity_type:
				detail.activity_type = doc.activity_type
			detail.is_billable = bool(doc.is_billable)
			if doc.completed:
				detail.completed = 1
		else:
			# Start new timer
			detail.from_time = now
			detail.start_time = now
			detail.paused = False

		detail.save(ignore_permissions=True)
		return

	# Existing detail — load and apply state transition
	detail = cast(TimesheetDetail, frappe.get_doc("Timesheet Detail", doc.name))

	if doc.delete:
		# Discard — remove the detail row and clean up empty parent
		parent_name = detail.parent
		detail.delete(ignore_permissions=True)
		if parent_name:
			parent_ts = frappe.get_doc("Timesheet", parent_name)
			if not parent_ts.get("time_logs"):
				parent_ts.delete(ignore_permissions=True)
		return

	if doc.update_description:
		# Description-only update — persist without state transition
		detail.description = doc.description
		detail.save(ignore_permissions=True)
		return

	if doc.to_time:
		# Stop — calculate final hours
		from_time = get_datetime(detail.from_time)
		start_time = get_datetime(detail.start_time)
		assert isinstance(from_time, datetime.datetime) and isinstance(start_time, datetime.datetime)

		total_seconds = (now - start_time).total_seconds() + (detail.paused_time_in_seconds or 0)
		detail.hours = total_seconds / 3600
		detail.to_time = datetime.datetime.fromtimestamp(
			from_time.timestamp() + total_seconds, tz=datetime.timezone.utc
		).replace(tzinfo=None)
		detail.description = doc.description or detail.description
		if doc.activity_type:
			detail.activity_type = doc.activity_type
		detail.is_billable = bool(doc.is_billable)
		if doc.completed:
			detail.completed = 1

	elif doc.paused:
		# Pause — accumulate elapsed time
		start_time = get_datetime(detail.start_time)
		assert isinstance(start_time, datetime.datetime), "start_time not set or invalid"
		detail.paused_time_in_seconds = int(
			(detail.paused_time_in_seconds or 0) + (now - start_time).total_seconds()
		)
		detail.paused = True

	else:
		# Resume — reset start_time
		detail.start_time = now
		detail.paused = False

	detail.save(ignore_permissions=True)


# ─────────────────────────────────────────────────────────────
#  SAVE — single endpoint, routes by doctype
# ─────────────────────────────────────────────────────────────


@frappe.whitelist()
def save_doc(payload: str, form_params: str | None = None) -> GetResponse:
	"""Save a document (Project, Task, or Timesheet Detail).

	Accepts a JSON string conforming to :class:`SaveDocRequest`::

	{"doc": {"doctype": "...", ...}, "children": [...]}

	The ``doctype`` field on ``doc`` determines which handler is called:

	- ``"Project"``          → :func:`_save_project`
	- ``"Task"``             → :func:`_save_task`
	- ``"Timesheet Detail"`` → :func:`_save_timesheet_detail`

	After the mutation a ``frappe.db.commit()`` is issued and a fresh
	:func:`get` response is returned so the frontend can rebuild its tree.

	Args:
		payload: JSON-serialised :class:`SaveDocRequest`.
		form_params: Optional JSON-serialised dict of list-view form
			params (doctype, filters, etc.) so the subsequent :func:`get`
			call can apply the user's current filters.

	Returns:
		A fresh :class:`GetResponse` reflecting the post-mutation state.
	"""
	req = SaveDocRequest(**json.loads(payload))

	match req.doc.doctype:
		case "Project":
			_save_project(cast(ProjectDoc, req.doc))
		case "Task":
			_save_task(cast(TaskDoc, req.doc), req.children)
		case "Timesheet Detail":
			_save_timesheet_detail(cast(TimesheetDetailDoc, req.doc))

	frappe.db.commit()
	return get(form_params)


# ─────────────────────────────────────────────────────────────
#  BULK CREATE — quick-entry of multiple tasks at once
# ─────────────────────────────────────────────────────────────


@frappe.whitelist()
def bulk_create_tasks(payload: str, form_params: str | None = None) -> GetResponse:
	"""Create multiple tasks at once from a list of subjects.

	Accepts a JSON string::

	{"subjects": ["Task A", "Task B"], "project": "PROJ-001", "parent_task": "TASK-001"}

	Each non-empty subject becomes a new Task under the given project
	and optional parent_task.  If a parent_task is provided its
	``is_group`` flag is set to ``1``.

	Args:
		payload: JSON string with ``subjects``, ``project``, and
			optional ``parent_task``.

	Returns:
		A fresh :class:`GetResponse` reflecting the post-mutation state.
	"""
	data = json.loads(payload)
	subjects: list[str] = data.get("subjects", [])
	project: str = data.get("project", "")
	parent_task: str | None = data.get("parent_task") or None

	if not subjects or not project:
		frappe.throw("subjects and project are required")

	if parent_task:
		frappe.db.set_value("Task", parent_task, {"is_group": 1})

	for subject in subjects:
		subject = subject.strip()
		if not subject:
			continue
		new_doc: dict[str, Any] = {
			"doctype": "Task",
			"subject": subject,
			"project": project,
			"status": "Open",
			"priority": "Medium",
		}
		if parent_task:
			new_doc["parent_task"] = parent_task
		frappe.get_doc(new_doc).insert()

	frappe.db.commit()
	return get(form_params)


# ─────────────────────────────────────────────────────────────
#  ASSIGN / UNASSIGN — manage task assignments via ToDo
# ─────────────────────────────────────────────────────────────


@frappe.whitelist()
def assign_task(task: str, user: str, form_params: str | None = None) -> GetResponse:
	"""Assign a user to a Task via Frappe's ToDo mechanism.

	Uses ``frappe.desk.form.assign_to.add`` which creates a ToDo and
	updates the Task's ``_assign`` field.

	Args:
		task: Task document name.
		user: Email of the user to assign.
		form_params: Optional list-view form params forwarded to ``get()``.

	Returns:
		A fresh :class:`GetResponse`.
	"""
	from frappe.desk.form.assign_to import add as assign_add

	assign_add(
		{
			"doctype": "Task",
			"name": task,
			"assign_to": json.dumps([user]),
		}
	)
	frappe.db.commit()
	return get(form_params)


@frappe.whitelist()
def unassign_task(task: str, user: str, form_params: str | None = None) -> GetResponse:
	"""Remove a user's assignment from a Task.

	Uses ``frappe.desk.form.assign_to.remove`` which cancels the ToDo
	and updates the Task's ``_assign`` field.

	Args:
		task: Task document name.
		user: Email of the user to unassign.
		form_params: Optional list-view form params forwarded to ``get()``.

	Returns:
		A fresh :class:`GetResponse`.
	"""
	from frappe.desk.form.assign_to import remove as assign_remove

	assign_remove("Task", task, user)
	frappe.db.commit()
	return get(form_params)


# ─────────────────────────────────────────────────────────────
#  PIN / UNPIN — manage pinned tasks via ToDo with pin=1
# ─────────────────────────────────────────────────────────────


@frappe.whitelist()
def pin_task(task: str, form_params: str | None = None) -> GetResponse:
	"""Pin a task for the current user.

	Creates (or reuses) a ToDo with ``pin=1`` for the current user.
	Pinning implies self-assignment — if no open ToDo exists for this
	user+task, one is created.  If an existing open ToDo exists, its
	``pin`` flag is set to ``1``.

	The new pin gets ``idx`` = max existing idx + 1 so it appears at
	the bottom of the user's pinned list.

	Args:
		task: Task document name.
		form_params: Optional list-view form params forwarded to ``get()``.

	Returns:
		A fresh :class:`GetResponse`.
	"""
	user = frappe.session.user

	# Check for existing open ToDo for this user+task
	existing = frappe.db.get_value(
		"ToDo",
		{"reference_type": "Task", "reference_name": task, "allocated_to": user, "status": "Open"},
		"name",
	)

	if existing:
		frappe.db.set_value("ToDo", existing, {"pin": 1})
	else:
		# Create via assign_to so _assign is properly maintained
		from frappe.desk.form.assign_to import add as assign_add

		assign_add(
			{
				"doctype": "Task",
				"name": task,
				"assign_to": json.dumps([user]),
			}
		)
		# Now set pin on the new ToDo
		new_todo = frappe.db.get_value(
			"ToDo",
			{"reference_type": "Task", "reference_name": task, "allocated_to": user, "status": "Open"},
			"name",
		)
		if new_todo:
			# Set idx to max + 1
			max_idx = (
				frappe.db.get_value(
					doctype="ToDo",
					filters={"allocated_to": user, "pin": 1, "status": "Open"},
					fieldname=[{"MAX": "idx", "as": "max_idx"}],
				)
				or 0
			)
			frappe.db.set_value("ToDo", new_todo, {"pin": 1, "idx": int(max_idx) + 1})

	frappe.db.commit()
	return get(form_params)


@frappe.whitelist()
def unpin_task(task: str, form_params: str | None = None) -> GetResponse:
	"""Unpin a task for the current user.

	Sets ``pin=0`` on the user's open ToDo for this task.  Does **not**
	remove the assignment — the user remains assigned.

	Args:
		task: Task document name.
		form_params: Optional list-view form params forwarded to ``get()``.

	Returns:
		A fresh :class:`GetResponse`.
	"""
	user = frappe.session.user
	existing = frappe.db.get_value(
		"ToDo",
		{"reference_type": "Task", "reference_name": task, "allocated_to": user, "status": "Open", "pin": 1},
		"name",
	)
	if existing:
		frappe.db.set_value("ToDo", existing, {"pin": 0})

	frappe.db.commit()
	return get(form_params)


@frappe.whitelist()
def reorder_pinned_tasks(order: str, form_params: str | None = None) -> GetResponse:
	"""Update the sort order of pinned tasks for the current user.

	Accepts a JSON array of ToDo names in the desired order.  Each
	ToDo's ``idx`` field is set to its position in the array (1-based).

	Args:
		order: JSON array of ToDo document names, e.g. ``'["TD-001","TD-002"]'``.
		form_params: Optional list-view form params forwarded to ``get()``.

	Returns:
		A fresh :class:`GetResponse`.
	"""
	user = frappe.session.user
	todo_names: list[str] = json.loads(order)

	for idx, todo_name in enumerate(todo_names, start=1):
		# Verify ownership before updating
		owner = frappe.db.get_value("ToDo", todo_name, "allocated_to")
		if owner == user:
			frappe.db.set_value("ToDo", todo_name, {"idx": idx})

	frappe.db.commit()
	return get(form_params)
