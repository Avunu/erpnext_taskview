# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""Demo data for frappe-demo and the screenshots in docs/screenshots/.

Two customers with three projects, each a tree of phases and tasks with hour
budgets, a draft Timesheet of logged hours per project, two paused timers,
two colleagues to assign work to, and a pinned list for the
Administrator, who runs the demo. Timers and pins go through the app's own
code, so they are stored the way the desk stores them.
"""

import datetime
from typing import Any

import frappe
from frappe.desk.form.assign_to import add as assign_add
from frappe.utils import add_days

from erpnext_taskview.erpnext_taskview.api import (
	_pin_for_current_user,
	_place_pin,
	_save_timesheet_detail,
)
from erpnext_taskview.erpnext_taskview.models import TimesheetDetailDoc

ME = "Administrator"
STAFF = (
	("maya.chen@example.com", "Maya", "Chen"),
	("jonas.weber@example.com", "Jonas", "Weber"),
)

# A task: (subject, expected hours, status, hours logged on past days, assignees by index into STAFF).
# A phase is a group task: (subject, [tasks]).
Task = tuple[str, float, str, tuple[float, ...], tuple[int, ...]]
Phase = tuple[str, list[Task]]

PROJECTS: list[dict[str, Any]] = [
	{
		"project_name": "Website Relaunch",
		"customer": "Bluefin Dental Group",
		"budgeted_hours": 80,
		"phases": [
			(
				"Discovery",
				[
					("Stakeholder interviews", 6, "Completed", (3, 2.5), (0,)),
					("Content inventory", 4, "Completed", (3.5,), (1,)),
				],
			),
			(
				"Design",
				[
					("Home page wireframes", 8, "Working", (2.5, 3.5), (0,)),
					("Visual design system", 12, "Working", (3.5,), (0,)),
					("Service page templates", 10, "Open", (), (0,)),
				],
			),
			(
				"Build",
				[
					("Online booking form", 6, "Pending Review", (4, 3.25), (1,)),
					("Theme development", 16, "Open", (), (1,)),
					("Migrate blog posts", 4, "Open", (), ()),
				],
			),
		],
	},
	{
		"project_name": "Monthly SEO Retainer",
		"customer": "Bluefin Dental Group",
		"budgeted_hours": 20,
		"phases": [
			(
				"Reporting",
				[
					("Keyword ranking report", 3, "Working", (1.5,), ()),
					("Local listings cleanup", 4, "Working", (2, 1.5), (1,)),
				],
			),
			("Fixes", [("Fix crawl errors", 2, "Open", (), (1,))]),
		],
	},
	{
		"project_name": "ERPNext Rollout",
		"customer": "Copperline Fabrication",
		"budgeted_hours": 120,
		"phases": [
			(
				"Setup",
				[
					("Chart of accounts review", 6, "Completed", (2.5, 3), (0,)),
					("Import items and BOMs", 10, "Working", (4,), (1,)),
					("Train the purchasing team", 8, "Open", (), (0,)),
				],
			),
		],
	},
]

# (project, task) to pin for the Administrator, in order, and one pinned task with no project yet.
PINS = (
	("Website Relaunch", "Home page wireframes"),
	("Monthly SEO Retainer", "Keyword ranking report"),
	("ERPNext Rollout", "Import items and BOMs"),
	("Website Relaunch", "Online booking form"),
)
UNFILED = "Draft the phase 2 proposal for Copperline"


def _start_timer(project_name: str, task: str) -> None:
	project = frappe.db.get_value("Project", {"project_name": project_name}, "name")
	_save_timesheet_detail(TimesheetDetailDoc(project=str(project), task=task))


def _insert(values: dict[str, Any]) -> str:
	doc = frappe.get_doc(values).insert(ignore_permissions=True)
	assert doc.name
	return str(doc.name)


def _leaf(doctype: str) -> str:
	"""A non-group node of a tree such as Customer Group: a customer may not name a group."""
	name = frappe.db.get_value(doctype, {"is_group": 0}, "name", order_by="lft asc")
	if not name:
		frappe.throw(f"The demo needs a {doctype} that is not a group")
	return str(name)


def _customer(name: str) -> str:
	if frappe.db.exists("Customer", name):
		return name
	return _insert(
		{
			"doctype": "Customer",
			"customer_name": name,
			"customer_type": "Company",
			"customer_group": _leaf("Customer Group"),
			"territory": _leaf("Territory"),
		}
	)


def _staff_user(email: str, first_name: str, last_name: str) -> str:
	if not frappe.db.exists("User", email):
		user = frappe.get_doc(
			{
				"doctype": "User",
				"email": email,
				"first_name": first_name,
				"last_name": last_name,
				"user_type": "System User",
				"send_welcome_email": 0,
				"roles": [{"role": "Projects User"}],
			}
		)
		user.flags.no_welcome_mail = True
		user.insert(ignore_permissions=True)
	return email


def _employee(company: str, today: datetime.date) -> str:
	"""The Employee whose User ID is the Administrator: timers log time for it."""
	existing = frappe.db.get_value("Employee", {"user_id": ME}, "name")
	if existing:
		return str(existing)
	gender = frappe.db.get_value("Gender", {}, "name") or _insert({"doctype": "Gender", "gender": "Female"})
	return _insert(
		{
			"doctype": "Employee",
			"first_name": "Alex",
			"last_name": "Rivera",
			"gender": gender,
			"date_of_birth": add_days(today, -365 * 34),
			"date_of_joining": add_days(today, -365 * 3),
			"company": company,
			"user_id": ME,
			"status": "Active",
		}
	)


def setup(ctx: dict[str, Any]) -> None:
	"""Create the demo once; every date comes from `ctx["today"]`."""
	if frappe.db.exists("Project", {"project_name": PROJECTS[0]["project_name"]}):
		return
	today: datetime.date = ctx["today"]
	company: str = ctx["company"]  # the setup wizard's company: the app requires erpnext

	# Task View's timers overlap by design (docs/install.md, "Allow overlapping time logs").
	frappe.db.set_single_value(
		"Projects Settings", {"ignore_user_time_overlap": 1, "ignore_employee_time_overlap": 1}
	)

	staff = [_staff_user(*row) for row in STAFF]
	employee = _employee(company, today)

	tasks: dict[tuple[str, str], str] = {}
	day = 1
	for spec in PROJECTS:
		project = _insert(
			{
				"doctype": "Project",
				"project_name": spec["project_name"],
				"customer": _customer(spec["customer"]),
				"company": company,
				"budgeted_hours": spec["budgeted_hours"],
				"expected_start_date": add_days(today, -21),
				"expected_end_date": add_days(today, 45),
			}
		)
		logs: list[dict[str, Any]] = []
		for phase_subject, phase_tasks in spec["phases"]:
			phase = _insert(
				{
					"doctype": "Task",
					"subject": phase_subject,
					"project": project,
					"is_group": 1,
					"status": "Open",
				}
			)
			for subject, expected, status, hours, assignees in phase_tasks:
				task = _insert(
					{
						"doctype": "Task",
						"subject": subject,
						"project": project,
						"parent_task": phase,
						"expected_time": expected,
						"status": "Open",
					}
				)
				tasks[(spec["project_name"], subject)] = task
				for h in hours:
					start = datetime.datetime.combine(today - datetime.timedelta(days=day), datetime.time(9))
					logs.append(
						{"project": project, "task": task, "from_time": start, "hours": h, "is_billable": 1}
					)
					day += 1
				if assignees:
					assign_add({"doctype": "Task", "name": task, "assign_to": [staff[i] for i in assignees]})
				if status != "Open":
					frappe.db.set_value("Task", task, "status", status)
		_insert(
			{
				"doctype": "Timesheet",
				"company": company,
				"employee": employee,
				"parent_project": project,
				"customer": frappe.db.get_value("Project", project, "customer"),
				"time_logs": logs,
			}
		)

	for key in PINS:
		_place_pin(_pin_for_current_user(tasks[key]))
	unfiled = _insert({"doctype": "Task", "subject": UNFILED, "status": "Open", "priority": "Medium"})
	_place_pin(_pin_for_current_user(unfiled))

	# Two paused timers from the morning of the demo day, with fixed elapsed times. A running one
	# would be measured against the server's real clock, not the demo day, and show months.
	_start_timer("Monthly SEO Retainer", tasks[("Monthly SEO Retainer", "Keyword ranking report")])
	_start_timer("Website Relaunch", tasks[("Website Relaunch", "Home page wireframes")])
	morning = datetime.datetime.combine(today, datetime.time(9))
	for task, minutes, description in (
		(tasks[("Monthly SEO Retainer", "Keyword ranking report")], 47, ""),
		(tasks[("Website Relaunch", "Home page wireframes")], 72, "Mobile layouts"),
	):
		row = frappe.db.get_value("Timesheet Detail", {"task": task, "to_time": ["is", "not set"]}, "name")
		values = {
			"paused": 1,
			"paused_time_in_seconds": minutes * 60,
			"from_time": morning,
			"start_time": morning,
			"description": description,
		}
		frappe.db.set_value("Timesheet Detail", str(row), values, update_modified=False)
