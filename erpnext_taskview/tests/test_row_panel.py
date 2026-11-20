# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""The row panel endpoints: ``get_row_detail`` and ``update_row``."""

import json
from typing import Any

import frappe
from frappe.share import add_docshare
from frappe.tests import IntegrationTestCase, set_user

from erpnext_taskview.erpnext_taskview import api

from .fixtures import make_project, make_staff_user, make_task


def task_budget(response: dict[str, Any], task: str) -> float:
	return next(t["budget_hours"] for t in response["tasks"] if t["name"] == task)


class TestRowPanel(IntegrationTestCase):
	@classmethod
	def setUpClass(cls):
		super().setUpClass()
		cls.project = make_project(budgeted_hours=40)
		cls.staff, _ = make_staff_user("Projects User")
		# Employee only: reads the Project through a share, but no Task of their own.
		cls.reader, _ = make_staff_user("Employee")
		add_docshare("Project", cls.project, cls.reader, read=1, flags={"ignore_share_permission": True})

	def setUp(self):
		frappe.db.savepoint("taskview_row_panel")

	def tearDown(self):
		frappe.set_user("Administrator")
		frappe.db.rollback(save_point="taskview_row_panel")

	def test_task_detail(self):
		task = make_task(self.project, expected_time=3)
		frappe.db.set_value(
			"Task",
			task,
			{
				"description": "<p>Check the <strong>gutters</strong></p>",
				"exp_start_date": "2026-03-02 00:00:00",
				"exp_end_date": "2026-03-06 00:00:00",
				"priority": "High",
				"progress": 25,
			},
		)
		detail = api.get_row_detail("Task", task)
		self.assertEqual(
			detail,
			{
				"doctype": "Task",
				"name": task,
				"description": "<p>Check the <strong>gutters</strong></p>",
				"start_date": "2026-03-02",
				"end_date": "2026-03-06",
				"expected_hours": 3.0,
				"priority": "High",
				"progress": 25.0,
				"can_write": True,
			},
		)

	def test_project_detail(self):
		frappe.db.set_value(
			"Project",
			self.project,
			{"notes": "<p>Scope</p>", "expected_start_date": "2026-01-05", "expected_end_date": "2026-02-27"},
		)
		detail = api.get_row_detail("Project", self.project)
		self.assertEqual(detail["doctype"], "Project")
		self.assertEqual(detail["description"], "<p>Scope</p>")
		self.assertEqual((detail["start_date"], detail["end_date"]), ("2026-01-05", "2026-02-27"))
		self.assertEqual(detail["expected_hours"], 40.0)
		self.assertIsNone(detail["priority"])
		self.assertIsNotNone(detail["progress"])
		self.assertTrue(detail["can_write"])

	def test_empty_task_detail(self):
		detail = api.get_row_detail("Task", make_task(self.project))
		self.assertIsNone(detail["description"])
		self.assertIsNone(detail["start_date"])
		self.assertIsNone(detail["end_date"])

	def test_only_tasks_and_projects(self):
		with self.assertRaises(frappe.ValidationError):
			api.get_row_detail("ToDo", "anything")
		with self.assertRaises(frappe.ValidationError):
			api.update_row("Customer", "anything", {"description": "x"})

	def test_reading_needs_read_permission(self):
		task = make_task(self.project)
		with set_user(self.reader), self.assertRaises(frappe.PermissionError):
			api.get_row_detail("Task", task)

	def test_read_only_user_sees_can_write_false(self):
		task = make_task(self.project)
		add_docshare("Task", task, self.reader, read=1, flags={"ignore_share_permission": True})
		with set_user(self.reader):
			self.assertFalse(api.get_row_detail("Task", task)["can_write"])
			self.assertFalse(api.get_row_detail("Project", self.project)["can_write"])

	def test_writing_needs_write_permission(self):
		task = make_task(self.project, expected_time=2)
		add_docshare("Task", task, self.reader, read=1, flags={"ignore_share_permission": True})
		with set_user(self.reader):
			with self.assertRaises(frappe.PermissionError):
				api.update_row("Task", task, {"expected_hours": 9})
			with self.assertRaises(frappe.PermissionError):
				api.update_row("Project", self.project, {"description": "<p>No</p>"})
		self.assertEqual(frappe.db.get_value("Task", task, "expected_time"), 2)
		self.assertIsNone(frappe.db.get_value("Project", self.project, "notes"))

	def test_unknown_keys_are_refused(self):
		task = make_task(self.project)
		for values in ({"subject": "Renamed"}, {"status": "Completed"}):
			with self.subTest(values), self.assertRaises(frappe.ValidationError):
				api.update_row("Task", task, values)
		with self.assertRaises(frappe.ValidationError):
			api.update_row("Project", self.project, {"priority": "High"})
		self.assertEqual(frappe.db.get_value("Task", task, "status"), "Open")

	def test_task_fields_persist(self):
		parent = make_task(self.project, is_group=1)
		task = make_task(self.project, parent=parent, expected_time=1)
		with set_user(self.staff):
			response = api.update_row(
				"Task",
				task,
				json.dumps(
					{
						"start_date": "2026-04-01",
						"end_date": "2026-04-03",
						"expected_hours": 6.5,
						"priority": "Urgent",
						"description": "<p>Notes</p>",
					}
				),
			)
		self.assertEqual(
			response["detail"],
			{
				"doctype": "Task",
				"name": task,
				"description": "<p>Notes</p>",
				"start_date": "2026-04-01",
				"end_date": "2026-04-03",
				"expected_hours": 6.5,
				"priority": "Urgent",
				"progress": 0.0,
				"can_write": True,
			},
		)
		self.assertEqual(task_budget(response, task), 6.5)
		self.assertEqual(task_budget(response, parent), 6.5)
		self.assertEqual(
			str(frappe.db.get_value("Task", task, "exp_start_date")),
			"2026-04-01 00:00:00",
		)

	def test_clearing_a_field(self):
		task = make_task(self.project, expected_time=4)
		api.update_row("Task", task, {"start_date": "2026-05-01", "description": "<p>Gone soon</p>"})
		detail = api.update_row("Task", task, {"start_date": "", "description": None})["detail"]
		self.assertIsNone(detail["start_date"])
		self.assertIsNone(detail["description"])
		self.assertIsNone(frappe.db.get_value("Task", task, "exp_start_date"))
		detail = api.update_row("Task", task, {"expected_hours": ""})["detail"]
		self.assertFalse(detail["expected_hours"])

	def test_cleared_task_end_date_is_derived_again(self):
		# ERPNext's Task.set_default_end_date_if_missing: with a start and an
		# estimate, an empty end date becomes start + expected hours on save.
		task = make_task(self.project, expected_time=6)
		api.update_row("Task", task, {"start_date": "2026-04-01", "end_date": "2026-04-03"})
		detail = api.update_row("Task", task, {"end_date": None})["detail"]
		self.assertEqual(detail["end_date"], "2026-04-01")
		self.assertEqual(api.get_row_detail("Task", task)["end_date"], "2026-04-01")
		# Without a start date there is nothing to derive from, so the clear holds.
		detail = api.update_row("Task", task, {"start_date": None, "end_date": None})["detail"]
		self.assertIsNone(detail["end_date"])

	def test_project_fields_round_trip(self):
		response = api.update_row(
			"Project",
			self.project,
			{
				"description": "<p>Phase one</p>",
				"start_date": "2026-06-01",
				"end_date": "2026-06-30",
				"expected_hours": 12,
			},
		)
		detail = response["detail"]
		self.assertEqual(detail["description"], "<p>Phase one</p>")
		self.assertEqual((detail["start_date"], detail["end_date"]), ("2026-06-01", "2026-06-30"))
		self.assertEqual(detail["expected_hours"], 12.0)
		self.assertEqual(frappe.db.get_value("Project", self.project, "notes"), "<p>Phase one</p>")
		self.assertEqual(frappe.db.get_value("Project", self.project, "budgeted_hours"), 12)
		self.assertEqual(api.get_row_detail("Project", self.project), detail)

	def test_start_after_end_is_refused(self):
		task = make_task(self.project)
		with self.assertRaises(frappe.ValidationError):
			api.update_row("Task", task, {"start_date": "2026-07-10", "end_date": "2026-07-01"})
		self.assertIsNone(frappe.db.get_value("Task", task, "exp_start_date"))
		with self.assertRaises(frappe.ValidationError):
			api.update_row("Project", self.project, {"start_date": "2026-07-10", "end_date": "2026-07-01"})
