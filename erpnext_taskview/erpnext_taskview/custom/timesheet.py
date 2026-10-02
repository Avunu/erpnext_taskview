# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

import frappe
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


def forward_status(current: str | None, target: str) -> str:
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
	"""

	def update_task_and_project(self) -> None:
		tasks: list[str] = []
		projects: list[str] = []

		for data in self.time_logs:
			if data.task and data.task not in tasks:
				task = frappe.get_doc("Task", data.task)
				task.update_time_and_costing()
				time_logs_completed = all(tl.completed for tl in self.time_logs if tl.task == task.name)
				task.status = forward_status(task.status, "Completed" if time_logs_completed else "Working")
				task.save(ignore_permissions=True)
				tasks.append(data.task)

			if data.project and data.project not in projects:
				projects.append(data.project)

		for project in projects:
			project_doc = frappe.get_doc("Project", project)
			project_doc.update_project()
			project_doc.save(ignore_permissions=True)
