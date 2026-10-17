# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

from typing import cast

import frappe
from erpnext.projects.doctype.task.task import Task as BaseTask
from frappe import _
from frappe.desk.form.assign_to import clear, close_all_assignments
from frappe.query_builder import DocType, Table
from frappe.utils import add_to_date, date_diff, get_datetime


class TaskviewTask(BaseTask):
	"""Carry ``ignore_permissions`` into ERPNext's nested Task writes.

	The customer portal saves Tasks on behalf of website users, who hold no
	Task permissions, with ``save(ignore_permissions=True)``.  That flag only
	covers the document being saved; ERPNext's Task controller then performs
	further writes that check permissions on their own:

	- ``validate_status`` / ``unassign_todo`` close the task's assignments
		(ToDo writes) when it is completed or cancelled;
	- ``populate_depends_on`` saves the parent task after a child is inserted;
	- ``reschedule_dependent_tasks`` saves dependent tasks.

	When — and only when — the outer save ignores permissions, these
	overrides make the nested writes do the same.  Every other save takes the
	stock ERPNext path untouched.
	"""

	def validate_status(self) -> None:
		if (
			self.flags.ignore_permissions
			and self.status == "Completed"
			and self.status != self.get_db_value("status")
		):
			# ERPNext checks the dependencies and then closes assignments
			# without ignore_permissions.  Close them first (once the same
			# dependency check passes) so its own call finds nothing left to do.
			for d in self.depends_on:
				if frappe.db.get_value("Task", d.task, "status") not in ("Completed", "Cancelled"):
					frappe.throw(
						_(
							"Cannot complete task {0} as its dependant task {1} are not completed / cancelled."
						).format(frappe.bold(self.name or ""), frappe.bold(d.task or ""))
					)
			close_all_assignments(self.doctype, self.name, ignore_permissions=True)
		super().validate_status()

	def unassign_todo(self) -> None:
		if not self.flags.ignore_permissions:
			return super().unassign_todo()
		if self.status == "Completed":
			close_all_assignments(self.doctype, self.name, ignore_permissions=True)
		if self.status == "Cancelled":
			clear(self.doctype, self.name, ignore_permissions=True)

	def populate_depends_on(self) -> None:
		if not self.flags.ignore_permissions:
			return super().populate_depends_on()
		if not self.parent_task:
			return
		parent = cast(BaseTask, frappe.get_doc("Task", self.parent_task))
		if self.name not in [row.task for row in parent.depends_on]:
			parent.append(
				"depends_on", {"doctype": "Task Depends On", "task": self.name, "subject": self.subject}
			)
			parent.save(ignore_permissions=True)

	def reschedule_dependent_tasks(self) -> None:
		if not self.flags.ignore_permissions:
			return super().reschedule_dependent_tasks()
		end = self.exp_end_date or self.act_end_date
		if not end:
			return
		end_date = get_datetime(end)

		Tasks = cast(Table, DocType("Task"))
		DependsOn = cast(Table, DocType("Task Depends On"))
		dependents = (
			frappe.qb.from_(Tasks)
			.join(DependsOn)
			.on(DependsOn.parent == Tasks.name)
			.select(Tasks.name)
			.distinct()
			.where(Tasks.project == self.project)
			.where(DependsOn.parenttype == "Task")
			.where(DependsOn.task == self.name)
			.where(DependsOn.project == self.project)
		).run(pluck=True)

		for name in dependents:
			task = cast(BaseTask, frappe.get_doc("Task", name))
			start = get_datetime(task.exp_start_date) if task.exp_start_date else None
			finish = task.exp_end_date
			if start and finish and end_date and start < end_date and task.status == "Open":
				task_duration = date_diff(finish, start)
				task.exp_start_date = add_to_date(end_date, days=1, as_datetime=True)
				task.exp_end_date = add_to_date(task.exp_start_date, days=task_duration, as_datetime=True)
				task.flags.ignore_recursion_check = True
				task.save(ignore_permissions=True)
