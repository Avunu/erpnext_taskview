# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""Tell the project team when a customer does something on the portal."""

import json
from typing import Literal, cast

import frappe
from frappe import _
from frappe.desk.doctype.notification_log.notification_log import enqueue_create_notification
from frappe.query_builder import DocType, Table
from frappe.utils import strip_html

NOTIFICATION_TYPE = "Client Portal"

PortalEvent = Literal["created", "comment", "status", "attachment"]


def _assignees(*values: str | None) -> list[str]:
	users: list[str] = []
	for value in values:
		if value:
			try:
				users.extend(json.loads(value))
			except ValueError:
				continue
	return users


def get_recipients(task: str, actor: str | None = None) -> list[str]:
	"""Email addresses of the staff who should hear about activity on ``task``.

	The task's assignees; failing that, its parent phase's; failing that, the
	project team — the project owner, anyone assigned to the project, its
	staff users, and staff assigned to the project's open tasks.  Only enabled
	System Users, never the person who acted.
	"""
	row = frappe.db.get_value("Task", task, ["project", "parent_task", "_assign"], as_dict=True)
	if not row:
		return []

	candidates = _assignees(row._assign)
	if not candidates and row.parent_task:
		candidates = _assignees(frappe.db.get_value("Task", row.parent_task, "_assign"))
	if not candidates and row.project:
		project = frappe.db.get_value("Project", row.project, ["owner", "_assign"], as_dict=True) or {}
		candidates = [project.get("owner"), *_assignees(project.get("_assign"))]
		candidates += frappe.get_all(
			"Project User", filters={"parent": row.project, "parenttype": "Project"}, pluck="user"
		)
		Tasks = cast(Table, DocType("Task"))
		open_assignments = (
			frappe.qb.from_(Tasks)
			.select(Tasks._assign)
			.where(Tasks.project == row.project)
			.where(Tasks.status.notin(["Completed", "Cancelled", "Template"]))
			.where(Tasks._assign.isnotnull())
		).run(pluck=True)
		candidates += _assignees(*open_assignments)

	candidates = [u for u in dict.fromkeys(candidates) if u and u != actor]
	if not candidates:
		return []
	return frappe.get_all(
		"User",
		filters={"name": ("in", candidates), "enabled": 1, "user_type": "System User"},
		pluck="email",
	)


def notify_team(task: str, event: PortalEvent, content: str | None = None) -> None:
	"""In-app notification (and email, per the recipient's settings) about portal activity on ``task``."""
	actor = frappe.session.user
	recipients = get_recipients(task, actor)
	if not recipients:
		return

	subject = frappe.db.get_value("Task", task, "subject") or task
	who = frappe.utils.get_fullname(actor)
	messages = {
		"created": _("{0} added a task on the client portal: {1}"),
		"comment": _("{0} commented on {1} from the client portal"),
		"status": _("{0} moved {1} on the client portal"),
		"attachment": _("{0} attached a file to {1} on the client portal"),
	}
	enqueue_create_notification(
		recipients,
		{
			"type": NOTIFICATION_TYPE,
			"document_type": "Task",
			"document_name": task,
			"subject": messages[event].format(frappe.bold(who), frappe.bold(strip_html(subject))),
			"email_content": content or "",
			"from_user": actor,
		},
	)
