# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""Test data builders shared by the erpnext_taskview test modules."""

from datetime import timedelta
from itertools import count
from typing import Any, cast

import frappe
from erpnext.projects.doctype.task.task import Task
from erpnext.projects.doctype.timesheet.timesheet import Timesheet
from frappe.desk.doctype.todo.todo import ToDo
from frappe.utils import now_datetime

COMPANY = "_Test Company"

# Days back for the next log_time() window.  ERPNext checks a user's
# timesheets for overlapping time, so every log gets a day of its own.
_log_days_back = count(2)


def unique(prefix: str) -> str:
	return f"{prefix} {frappe.generate_hash(length=8)}"


def insert(values: dict[str, Any]) -> str:
	"""Insert a document and return its name."""
	doc = frappe.get_doc(values).insert()
	assert doc.name
	return doc.name


def get_task(name: str) -> Task:
	return cast(Task, frappe.get_doc("Task", name))


def get_todo(name: str) -> ToDo:
	return cast(ToDo, frappe.get_doc("ToDo", name))


def make_customer() -> str:
	return insert(
		{
			"doctype": "Customer",
			"customer_name": unique("_TV Customer"),
			"customer_type": "Company",
			"customer_group": "_Test Customer Group",
			"territory": "_Test Territory",
		}
	)


def make_project(customer: str | None = None, budgeted_hours: float = 0, users: tuple[str, ...] = ()) -> str:
	return insert(
		{
			"doctype": "Project",
			"project_name": unique("_TV Project"),
			"company": COMPANY,
			"customer": customer,
			"budgeted_hours": budgeted_hours,
			"users": [{"user": u, "welcome_email_sent": 1} for u in users],
		}
	)


def make_task(
	project: str,
	*,
	parent: str | None = None,
	is_group: int = 0,
	expected_time: float = 0,
	status: str = "Open",
	is_template: int = 0,
) -> str:
	return insert(
		{
			"doctype": "Task",
			"subject": unique("_TV Task"),
			"project": project,
			"parent_task": parent,
			"is_group": is_group,
			"expected_time": expected_time,
			"status": status,
			"is_template": is_template,
		}
	)


def log_time(
	project: str,
	task: str | None,
	hours: float,
	*,
	submit: bool = False,
	is_billable: int = 1,
	completed: int = 0,
):
	"""A timesheet with one closed time log (draft unless ``submit``), on a day no other log uses."""
	ts = frappe.get_doc(
		{
			"doctype": "Timesheet",
			"company": COMPANY,
			"time_logs": [
				{
					"project": project,
					"task": task,
					"from_time": now_datetime() - timedelta(days=next(_log_days_back)),
					"hours": hours,
					"is_billable": is_billable,
					"completed": completed,
				}
			],
		}
	).insert()
	if submit:
		ts.submit()
	return ts


def start_timer(project: str, task: str, *, elapsed: timedelta = timedelta(hours=1)) -> Timesheet:
	"""A running TaskView timer: open row (no ``to_time``) started ``elapsed`` ago."""
	started = now_datetime() - elapsed
	ts = frappe.get_doc(
		{
			"doctype": "Timesheet",
			"company": COMPANY,
			"time_logs": [
				{
					"project": project,
					"task": task,
					"from_time": started,
					"start_time": started,
					"paused": 0,
					"paused_time_in_seconds": 0,
				}
			],
		}
	).insert()
	ts = cast(Timesheet, ts)
	# The timesheet controller derives to_time from hours; keep the row open.
	frappe.db.set_value("Timesheet Detail", ts.time_logs[0].name, {"to_time": None, "hours": 0})
	return ts


def make_portal_user(customer: str | None = None, *, via: str = "contact") -> str:
	"""A Website User with the Customer role, linked to ``customer`` via a Contact or ``portal_users``."""
	email = f"tv-{frappe.generate_hash(length=10)}@example.com"
	frappe.get_doc(
		{
			"doctype": "User",
			"email": email,
			"first_name": "Portal",
			"last_name": email.split("@")[0],
			"send_welcome_email": 0,
			"user_type": "Website User",
			"roles": [{"role": "Customer"}],
		}
	).insert(ignore_permissions=True)

	if customer and via == "contact":
		frappe.get_doc(
			{
				"doctype": "Contact",
				"first_name": "Portal",
				"last_name": email.split("@")[0],
				"email_ids": [{"email_id": email, "is_primary": 1}],
				"links": [{"link_doctype": "Customer", "link_name": customer}],
			}
		).insert(ignore_permissions=True)
	elif customer and via == "portal_user":
		doc = frappe.get_doc("Customer", customer)
		doc.append("portal_users", {"user": email})
		doc.save()
	return email


def make_staff_user(*roles: str) -> tuple[str, str]:
	"""A System User with ``roles`` and an Employee whose User ID is them; returns ``(user, employee)``.

	ERPNext gives the new user a User Permission on their own Employee (and its
	Company), as it does on a real site, so Timesheets of other Employees are
	out of their reach.
	"""
	email = f"tv-staff-{frappe.generate_hash(length=10)}@example.com"
	frappe.get_doc(
		{
			"doctype": "User",
			"email": email,
			"first_name": "Staff",
			"last_name": email.split("@")[0],
			"send_welcome_email": 0,
			"user_type": "System User",
			"roles": [{"role": role} for role in roles],
		}
	).insert(ignore_permissions=True)
	employee = insert(
		{
			"doctype": "Employee",
			"first_name": "Staff",
			"last_name": email.split("@")[0],
			"company": COMPANY,
			"user_id": email,
			"gender": "Female",
			"date_of_birth": "1990-05-08",
			"date_of_joining": "2013-01-01",
			"status": "Active",
		}
	)
	return email, employee
