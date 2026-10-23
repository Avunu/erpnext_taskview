# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""Who may change Projects and Tasks through the Project and Task routes of ``save_doc``.

Both routes update existing documents with ``frappe.db.set_value``, which
checks no permission, so they check the user's write permission first.
Without that, marking a task Completed through the Task route would be
open to any desk user, which the Timesheet Detail route already refuses.
"""

import json
from typing import Any

import frappe
from frappe.share import add_docshare
from frappe.tests import IntegrationTestCase, set_user

from erpnext_taskview.erpnext_taskview import api

from .fixtures import make_project, make_staff_user, make_task


def save(doc: dict[str, Any], **request: Any) -> dict[str, Any]:
	return api.save_doc(json.dumps({"doc": doc, **request}))


def task_fields(task: str) -> tuple[Any, ...]:
	return tuple(frappe.db.get_value("Task", task, ["status", "subject", "project", "is_group"]))


class TestSavePermissions(IntegrationTestCase):
	@classmethod
	def setUpClass(cls):
		super().setUpClass()
		cls.project = make_project()
		cls.staff, _ = make_staff_user("Projects User")
		# Employee only: reads the Project through a share, but may not write Tasks.
		cls.reader, _ = make_staff_user("Employee")
		add_docshare("Project", cls.project, cls.reader, read=1, flags={"ignore_share_permission": True})

	def setUp(self):
		frappe.db.savepoint("taskview_save_permissions")

	def tearDown(self):
		frappe.set_user("Administrator")
		frappe.db.rollback(save_point="taskview_save_permissions")

	def test_a_task_needs_write_to_change(self):
		task = make_task(self.project)
		before = task_fields(task)
		with set_user(self.reader):
			for change in ({"status": "Completed"}, {"subject": "Renamed"}):
				with self.assertRaises(frappe.PermissionError):
					save({"doctype": "Task", "name": task, "project": self.project, **change})
		self.assertEqual(task_fields(task), before)

	def test_a_project_needs_write_to_change(self):
		with set_user(self.reader), self.assertRaises(frappe.PermissionError):
			save({"doctype": "Project", "name": self.project, "project_name": "Renamed", "status": "Completed"})
		self.assertEqual(frappe.db.get_value("Project", self.project, "status"), "Open")

	def test_every_task_a_drag_writes_needs_write(self):
		"""The dragged task, its new parent and the children the request names."""
		mine = make_task(self.project)
		add_docshare("Task", mine, self.reader, read=1, write=1, flags={"ignore_share_permission": True})
		theirs = make_task(self.project)
		other = make_project()
		add_docshare("Project", other, self.reader, read=1, flags={"ignore_share_permission": True})
		before = task_fields(theirs)

		with set_user(self.reader):
			with self.assertRaises(frappe.PermissionError):
				save({"doctype": "Task", "name": mine, "project": self.project, "parent_task": theirs, "idx": 1})
			with self.assertRaises(frappe.PermissionError):
				save(
					{"doctype": "Task", "name": mine, "project": other, "idx": 1},
					children=[{"doctype": "Task", "name": theirs, "project": other}],
				)
		self.assertEqual(task_fields(theirs), before)
		self.assertEqual(frappe.db.get_value("Task", mine, "project"), self.project)

	def test_a_task_moves_only_to_a_readable_project(self):
		mine = make_task(self.project)
		add_docshare("Task", mine, self.reader, read=1, write=1, flags={"ignore_share_permission": True})
		hidden = make_project()
		with set_user(self.reader), self.assertRaises(frappe.PermissionError):
			save({"doctype": "Task", "name": mine, "project": hidden, "idx": 1})
		self.assertEqual(frappe.db.get_value("Task", mine, "project"), self.project)

	def test_a_new_subtask_needs_write_on_its_parent(self):
		parent = make_task(self.project)
		with set_user(self.reader):
			with self.assertRaises(frappe.PermissionError):
				save({"doctype": "Task", "subject": "Child", "project": self.project, "parent_task": parent})
			with self.assertRaises(frappe.PermissionError):
				api.bulk_create_tasks(
					json.dumps({"subjects": ["Child"], "project": self.project, "parent_task": parent})
				)
		self.assertEqual(frappe.db.get_value("Task", parent, "is_group"), 0)

	def test_a_permitted_user_keeps_working(self):
		task = make_task(self.project)
		parent = make_task(self.project)
		other = make_project()
		with set_user(self.staff):
			save({"doctype": "Task", "name": task, "project": self.project, "status": "Completed"})
			save({"doctype": "Project", "name": other, "project_name": "Renamed", "status": "Open"})
			save({"doctype": "Task", "subject": "Child", "project": self.project, "parent_task": parent})
		self.assertEqual(frappe.db.get_value("Task", task, "status"), "Completed")
		self.assertEqual(frappe.db.get_value("Task", parent, "is_group"), 1)
		self.assertEqual(frappe.db.get_value("Project", other, "project_name"), "Renamed")
