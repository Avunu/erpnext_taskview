# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""Who may log time, run timers and complete tasks through ``save_doc``.

The Timesheet Detail route writes its rows with ``ignore_permissions``, so
these tests hold it to the user's own Project, Task and Timesheet permissions.
"""

import json
from datetime import UTC, datetime, timedelta
from typing import Any
from unittest.mock import patch

import frappe
from frappe.permissions import add_user_permission
from frappe.share import add_docshare
from frappe.tests import IntegrationTestCase, set_user
from frappe.utils import now_datetime

from erpnext_taskview.erpnext_taskview import api

from .fixtures import (
	insert,
	log_time,
	make_customer,
	make_portal_user,
	make_project,
	make_staff_user,
	make_task,
	start_timer,
)


def save(doc: dict[str, Any]) -> dict[str, Any]:
	return api.save_doc(json.dumps({"doc": {"doctype": "Timesheet Detail", **doc}}))


def manual_log(project: str, task: str, hours: float = 1, **fields: Any) -> dict[str, Any]:
	"""A Log Time entry ending 40 days ago, as the dialog sends it."""
	end = datetime.now(UTC) - timedelta(days=40)
	return save(
		{
			"project": project,
			"task": task,
			"from_time": (end - timedelta(hours=hours)).isoformat(),
			"to_time": end.isoformat(),
			"hours": hours,
			**fields,
		}
	)


def stop(timer: str, **fields: Any) -> dict[str, Any]:
	return save({"name": timer, "to_time": now_datetime().isoformat(), "hours": 1, **fields})


def timer_of(user: str, employee: str, project: str, task: str) -> str:
	"""A running timer on ``task`` in a draft Timesheet that belongs to ``user`` and ``employee``."""
	timesheet = start_timer(project, task)
	frappe.db.set_value("Timesheet", timesheet.name, {"owner": user, "employee": employee})
	name = timesheet.time_logs[0].name
	assert name
	return name


def rows_on(task: str) -> list[Any]:
	return frappe.get_all(
		"Timesheet Detail", filters={"task": task}, fields=["name", "to_time", "paused", "completed"]
	)


class TestTimerPermissions(IntegrationTestCase):
	@classmethod
	def setUpClass(cls):
		super().setUpClass()
		cls.customer = make_customer()
		cls.project = make_project(cls.customer)
		# Projects User: ERPNext's role for staff who work on projects.
		cls.staff, cls.staff_employee = make_staff_user("Projects User")
		cls.colleague, cls.colleague_employee = make_staff_user("Projects User")
		# Employee only: may create and write Timesheets, but only select Tasks.
		cls.employee_only, cls.employee_only_employee = make_staff_user("Employee")
		# Shared with them, so the Project is readable and only Task write is missing.
		add_docshare(
			"Project", cls.project, cls.employee_only, read=1, flags={"ignore_share_permission": True}
		)

	def setUp(self):
		frappe.db.savepoint("taskview_timer_permissions")

	def tearDown(self):
		frappe.set_user("Administrator")
		frappe.db.rollback(save_point="taskview_timer_permissions")

	# ── refused without Task write ───────────────────────────

	def test_the_fixture_user_cannot_write_tasks(self):
		with set_user(self.employee_only):
			self.assertTrue(frappe.has_permission("Timesheet", "create"))
			self.assertTrue(frappe.has_permission("Project", "read", self.project))
			self.assertFalse(frappe.has_permission("Task", "write"))

	def test_start_needs_task_write(self):
		task = make_task(self.project)
		with set_user(self.employee_only), self.assertRaises(frappe.PermissionError):
			save({"project": self.project, "task": task})
		self.assertEqual(rows_on(task), [])

	def test_log_needs_task_write(self):
		task = make_task(self.project)
		with set_user(self.employee_only), self.assertRaises(frappe.PermissionError):
			manual_log(self.project, task, completed=1)
		self.assertEqual(rows_on(task), [])
		self.assertEqual(frappe.db.get_value("Task", task, "status"), "Open")

	def test_stop_needs_task_write(self):
		task = make_task(self.project)
		timer = timer_of(self.employee_only, self.employee_only_employee, self.project, task)
		with set_user(self.employee_only), self.assertRaises(frappe.PermissionError):
			stop(timer)
		self.assertIsNone(frappe.db.get_value("Timesheet Detail", timer, "to_time"))

	def test_complete_needs_task_write(self):
		task = make_task(self.project)
		timer = timer_of(self.employee_only, self.employee_only_employee, self.project, task)
		with set_user(self.employee_only), self.assertRaises(frappe.PermissionError):
			stop(timer, completed=1)
		self.assertEqual(frappe.db.get_value("Task", task, "status"), "Open")
		self.assertEqual(frappe.db.get_value("Timesheet Detail", timer, "completed"), 0)

	def test_pause_resume_and_discard_need_task_write(self):
		task = make_task(self.project)
		timer = timer_of(self.employee_only, self.employee_only_employee, self.project, task)
		with set_user(self.employee_only):
			for change in ({"paused": 1}, {"paused": 0}, {"delete": 1}):
				with self.assertRaises(frappe.PermissionError):
					save({"name": timer, **change})
		self.assertTrue(frappe.db.exists("Timesheet Detail", timer))
		self.assertEqual(frappe.db.get_value("Timesheet Detail", timer, "paused"), 0)

	def test_portal_users_cannot_log_time(self):
		"""The portal shows time logs but has no timers: its users hold no Task permission."""
		task = make_task(self.project)
		portal_user = make_portal_user(self.customer)
		with set_user(portal_user):
			with self.assertRaises(frappe.PermissionError):
				save({"project": self.project, "task": task})
			with self.assertRaises(frappe.PermissionError):
				manual_log(self.project, task, completed=1)
		self.assertEqual(rows_on(task), [])
		self.assertEqual(frappe.db.get_value("Task", task, "status"), "Open")

	# ── a permitted user keeps working ───────────────────────

	def test_staff_start_pause_stop_and_complete(self):
		task = make_task(self.project)
		with set_user(self.staff):
			save({"project": self.project, "task": task})
			(row,) = rows_on(task)
			save({"name": row.name, "paused": 1})
			save({"name": row.name, "paused": 0})
			result = stop(row.name, completed=1)
		self.assertIsNone(result["notice"])
		self.assertEqual(result["alert"], "Logged 1.00 hrs")
		timesheet = frappe.db.get_value("Timesheet Detail", row.name, "parent")
		self.assertEqual(
			frappe.db.get_value("Timesheet", timesheet, ["employee", "owner"]),
			(self.staff_employee, self.staff),
		)
		self.assertEqual(frappe.db.get_value("Timesheet Detail", row.name, "completed"), 1)
		# Completed through the Task document: ERPNext's validation filled these in.
		completed = frappe.db.get_value("Task", task, ["status", "progress", "completed_on"], as_dict=True)
		assert completed
		self.assertEqual((completed.status, completed.progress), ("Completed", 100))
		self.assertIsNotNone(completed.completed_on)

	def test_staff_log_time_and_discard(self):
		task = make_task(self.project)
		with set_user(self.staff):
			result = manual_log(self.project, task, 2, completed=1)
			save({"project": self.project, "task": make_task(self.project)})
		self.assertEqual(result["alert"], "Logged 2.00 hrs")
		self.assertEqual(frappe.db.get_value("Task", task, "status"), "Completed")

		task = make_task(self.project)
		with set_user(self.staff):
			save({"project": self.project, "task": task})
			(row,) = rows_on(task)
			save({"name": row.name, "delete": 1})
		self.assertEqual(rows_on(task), [])

	def test_completion_runs_task_validation(self):
		"""A dependency that is still open keeps the task open; the time is logged anyway."""
		blocker = make_task(self.project)
		task = insert(
			{
				"doctype": "Task",
				"subject": "Waits for the blocker",
				"project": self.project,
				"depends_on": [{"task": blocker}],
			}
		)
		with set_user(self.staff):
			result = manual_log(self.project, task, completed=1)
		self.assertIn("could not be marked as Completed", result["notice"])
		self.assertIn(blocker, result["notice"])
		self.assertEqual(frappe.db.get_value("Task", task, "status"), "Open")
		(row,) = rows_on(task)
		self.assertIsNotNone(row.to_time)
		self.assertEqual(row.completed, 0)

	# ── the Timesheet must be the user's to write ───────────

	def test_another_persons_timer_is_refused(self):
		task = make_task(self.project)
		timer = timer_of(self.colleague, self.colleague_employee, self.project, task)
		with set_user(self.staff):
			for change in (
				{"paused": 1},
				{"delete": 1},
				{"to_time": now_datetime().isoformat(), "completed": 1},
			):
				with self.assertRaises(frappe.PermissionError):
					save({"name": timer, **change})
		self.assertTrue(frappe.db.exists("Timesheet Detail", timer))
		self.assertEqual(frappe.db.get_value("Timesheet Detail", timer, "paused"), 0)
		self.assertEqual(frappe.db.get_value("Task", task, "status"), "Open")

	def test_a_hook_cannot_hand_over_another_persons_timesheet(self):
		task = make_task(self.project)
		theirs = log_time(self.project, task, 1).name
		frappe.db.set_value(
			"Timesheet", theirs, {"owner": self.colleague, "employee": self.colleague_employee}
		)

		with (
			patch.object(api, "_find_existing_timesheet", return_value=theirs),
			set_user(self.staff),
			self.assertRaises(frappe.PermissionError),
		):
			save({"project": self.project, "task": task})
		self.assertEqual(len(rows_on(task)), 1)

	# ── Project read and the reassigned task ─────────────────

	def test_project_and_reassigned_task_follow_user_permissions(self):
		user, employee = make_staff_user("Projects User")
		other_project = make_project()
		add_user_permission("Project", self.project, user, ignore_permissions=True)
		task = make_task(self.project)
		elsewhere = make_task(other_project)

		with set_user(user):
			self.assertFalse(frappe.has_permission("Project", "read", other_project))
			with self.assertRaises(frappe.PermissionError):
				save({"project": other_project, "task": elsewhere})
			# The task must be writable too, even under a project the user can read.
			with self.assertRaises(frappe.PermissionError):
				save({"project": self.project, "task": elsewhere})

			save({"project": self.project, "task": task})
			(row,) = rows_on(task)
			with self.assertRaises(frappe.PermissionError):
				stop(row.name, task=elsewhere)
		self.assertEqual(frappe.db.get_value("Timesheet Detail", row.name, "task"), task)
		self.assertEqual(
			frappe.db.get_value("Timesheet", {"employee": employee}, "parent_project"), self.project
		)

	# ── the Task must belong to the Project ──────────────────

	def test_a_new_row_needs_its_task_in_the_project(self):
		"""Project read and Task write are checked apart, so the pair must match."""
		elsewhere = make_task(make_project())
		no_project = insert({"doctype": "Task", "subject": "Not in any project"})
		with set_user(self.staff):
			for task in (elsewhere, no_project):
				for log in (
					lambda task=task: save({"project": self.project, "task": task}),
					lambda task=task: manual_log(self.project, task),
				):
					with self.assertRaisesRegex(frappe.ValidationError, "does not belong to Project"):
						log()
		self.assertEqual(rows_on(elsewhere) + rows_on(no_project), [])

	def test_a_stopped_timer_moves_only_to_a_task_of_its_project(self):
		task = make_task(self.project)
		sibling = make_task(self.project)
		elsewhere = make_task(make_project())
		no_project = insert({"doctype": "Task", "subject": "Not in any project"})
		with set_user(self.staff):
			save({"project": self.project, "task": task})
			(row,) = rows_on(task)
			for other in (elsewhere, no_project):
				with self.assertRaisesRegex(frappe.ValidationError, "does not belong to Project"):
					stop(row.name, task=other)
			self.assertIsNone(frappe.db.get_value("Timesheet Detail", row.name, "to_time"))
			stop(row.name, task=sibling)
		self.assertEqual(
			frappe.db.get_value("Timesheet Detail", row.name, ["project", "task"]), (self.project, sibling)
		)

	def test_a_timer_keeps_working_after_its_task_moves(self):
		"""A row keeps the project it was logged on; only a new pair must match."""
		task = make_task(self.project)
		with set_user(self.staff):
			save({"project": self.project, "task": task})
			(row,) = rows_on(task)
		frappe.db.set_value("Task", task, "project", make_project())
		with set_user(self.staff):
			save({"name": row.name, "paused": 1})
			save({"name": row.name, "delete": 1})
		self.assertEqual(rows_on(task), [])

	# ── only a draft Timesheet ───────────────────────────────

	def test_a_cancelled_timesheet_is_refused(self):
		task = make_task(self.project)
		timesheet = log_time(self.project, task, 1, submit=True)
		timesheet.cancel()
		frappe.db.set_value(
			"Timesheet", timesheet.name, {"owner": self.staff, "employee": self.staff_employee}
		)
		row = timesheet.time_logs[0].name
		with set_user(self.staff):
			for change in ({"delete": 1}, {"update_description": 1, "description": "changed"}):
				with self.assertRaisesRegex(frappe.ValidationError, "is not a draft"):
					save({"name": row, **change})
		self.assertTrue(frappe.db.exists("Timesheet Detail", row))
		self.assertTrue(frappe.db.exists("Timesheet", timesheet.name))
