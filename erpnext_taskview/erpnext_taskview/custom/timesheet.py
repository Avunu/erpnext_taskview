# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

from typing import cast

import frappe
from erpnext.projects.doctype.project.project import Project
from erpnext.projects.doctype.task.task import Task
from erpnext.projects.doctype.timesheet.timesheet import Timesheet as BaseTimesheet

# Position of each status along a task's lifecycle.  Overdue is set by a
# daily job from the expected end date, so it ranks with Open.  Cancelled and
# Template are deliberately absent: a timesheet never touches them.
_STATUS_RANK = {
	"Open": 0,
	"Overdue": 0,
	"Working": 1,
	"Pending Review": 2,
	"Completed": 3,
}


def forward_status[S: str](current: S | None, target: S) -> S:
	"""The status a timesheet should leave a task in: ``target`` only if it moves forward."""
	if current not in _STATUS_RANK:
		return current or target
	return target if _STATUS_RANK[target] > _STATUS_RANK[current] else current


class TaskviewTimesheet(BaseTimesheet):
	"""Submitting a timesheet only ever moves its tasks *forward*.

	ERPNext's ``update_task_and_project`` (run on submit, cancel and update
	after submit) overwrites every task on the timesheet with ``Working`` — or
	``Completed`` when all of that task's logs are ticked complete.  Timesheets
	here are submitted weekly, so a task the customer approved on the portal
	(Completed) or that is waiting on them (Pending Review) would silently
	flip back to Working.  This keeps ERPNext's time/costing refresh and
	project update, but never moves a status backwards.

	``update_task_and_project`` **fully replaces** ERPNext's method: it does
	not call ``super()``.  It repeats core's loop (each task's
	``update_time_and_costing`` and save, then each project's
	``update_project`` and save) with only the status rule swapped for
	:func:`forward_status`, so a later change to that loop in ERPNext is not
	picked up here; compare the two on each ERPNext upgrade.  Since v16.51,
	core's own rule (``get_task_status``) also keeps Completed and Cancelled,
	but it still moves Pending Review back to Working.

	It composes with hrms, which replaces the Timesheet class with
	``EmployeeTimesheet`` through ``override_doctype_class``: that class only
	overrides ``set_status``, and this extension is built on whichever class
	is in place (the composition check builds both app orders).
	"""

	def update_task_and_project(self) -> None:
		tasks: list[str] = []
		projects: list[str] = []

		for data in self.time_logs:
			if data.task and data.task not in tasks:
				task = cast(Task, frappe.get_doc("Task", data.task))
				task.update_time_and_costing()
				time_logs_completed = all(tl.completed for tl in self.time_logs if tl.task == task.name)
				task.status = forward_status(task.status, "Completed" if time_logs_completed else "Working")
				task.save(ignore_permissions=True)
				tasks.append(data.task)

			if data.project and data.project not in projects:
				projects.append(data.project)

		for project in projects:
			project_doc = cast(Project, frappe.get_doc("Project", project))
			project_doc.update_project()
			project_doc.save(ignore_permissions=True)
