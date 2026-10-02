# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""Test data builders shared by the erpnext_taskview test modules."""

from datetime import timedelta

import frappe
from frappe.utils import now_datetime

COMPANY = "_Test Company"


def unique(prefix: str) -> str:
	return f"{prefix} {frappe.generate_hash(length=8)}"


def make_customer() -> str:
	return (
		frappe.get_doc(
			{
				"doctype": "Customer",
				"customer_name": unique("_TV Customer"),
				"customer_type": "Company",
				"customer_group": "_Test Customer Group",
				"territory": "_Test Territory",
			}
		)
		.insert()
		.name
	)


def make_project(customer: str | None = None, budgeted_hours: float = 0, users: tuple[str, ...] = ()) -> str:
	return (
		frappe.get_doc(
			{
				"doctype": "Project",
				"project_name": unique("_TV Project"),
				"company": COMPANY,
				"customer": customer,
				"budgeted_hours": budgeted_hours,
				"users": [{"user": u, "welcome_email_sent": 1} for u in users],
			}
		)
		.insert()
		.name
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
	return (
		frappe.get_doc(
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
		.insert()
		.name
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
	"""A timesheet with one closed time log (draft unless ``submit``)."""
	ts = frappe.get_doc(
		{
			"doctype": "Timesheet",
			"company": COMPANY,
			"time_logs": [
				{
					"project": project,
					"task": task,
					"from_time": now_datetime() - timedelta(days=2),
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


def start_timer(project: str, task: str, *, elapsed: timedelta = timedelta(hours=1)):
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
