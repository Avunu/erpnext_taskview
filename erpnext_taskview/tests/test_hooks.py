# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""The install hook and the Task controller extension's permission bypass."""

from collections.abc import Generator
from contextlib import contextmanager
from datetime import date, datetime, time, timedelta
from typing import Any
from unittest.mock import patch

import frappe
from frappe.desk.form.assign_to import close_all_assignments
from frappe.tests import IntegrationTestCase, set_user
from frappe.utils import getdate

from erpnext_taskview.install import ensure_notification_type
from erpnext_taskview.portal.notify import NOTIFICATION_TYPE

from .fixtures import get_task, insert, make_project, make_task


class TestInstall(IntegrationTestCase):
	def test_notification_type_is_created_once(self):
		frappe.delete_doc("Notification Type", NOTIFICATION_TYPE, force=True, ignore_missing=True)
		ensure_notification_type()
		self.assertTrue(frappe.db.get_value("Notification Type", NOTIFICATION_TYPE, "enabled"))
		ensure_notification_type()  # after_migrate runs it again: nothing to do
		self.assertEqual(frappe.db.count("Notification Type", {"name": NOTIFICATION_TYPE}), 1)

	def test_hooks_are_registered(self):
		self.assertIn("erpnext", frappe.get_hooks("required_apps", app_name="erpnext_taskview"))
		self.assertEqual(
			frappe.get_hooks("after_install", app_name="erpnext_taskview"),
			["erpnext_taskview.install.ensure_notification_type"],
		)
		self.assertEqual(
			frappe.get_hooks("after_migrate", app_name="erpnext_taskview"),
			["erpnext_taskview.install.ensure_notification_type"],
		)


@contextmanager
def _old_core() -> Generator[None]:
	"""Hold ERPNext's Task controller to its pre-16.51 behaviour.

	Before 16.51.1 core closed and cleared assignments and saved dependent
	tasks without carrying ``ignore_permissions``.  Its ``validate_status``
	(which the extension extends rather than replaces) gets that behaviour back,
	and the three methods the extension replaces under ``ignore_permissions``
	fail outright if they are reached.
	"""
	core = "erpnext.projects.doctype.task.task"

	def close_checking_permissions(doctype: str, name: str, ignore_permissions: bool = False) -> bool:
		return close_all_assignments(doctype, name)

	def unreachable(method: str):
		def fail(self: Any) -> None:
			raise AssertionError(f"core Task.{method} ran under ignore_permissions")

		return fail

	with (
		patch(f"{core}.close_all_assignments", close_checking_permissions),
		patch(f"{core}.Task.unassign_todo", unreachable("unassign_todo")),
		patch(f"{core}.Task.populate_depends_on", unreachable("populate_depends_on")),
		patch(f"{core}.Task.reschedule_dependent_tasks", unreachable("reschedule_dependent_tasks")),
	):
		yield


class TestTaskPermissionBypass(IntegrationTestCase):
	"""Portal saves (``save(ignore_permissions=True)`` by a user with no Task or ToDo rights).

	Every test saves as a Website User that holds no role at all, so a nested
	write that checks permissions raises.  ERPNext >= 16.51.1 carries the flag
	into most of those writes itself, while the app supports every v16; so
	each test also holds core to its pre-16.51 behaviour (see ``_old_core``)
	and proves the extension does the nested write on its own.
	"""

	@classmethod
	def setUpClass(cls):
		super().setUpClass()
		cls.user = f"tv-noperm-{frappe.generate_hash(length=10)}@example.com"
		frappe.get_doc(
			{
				"doctype": "User",
				"email": cls.user,
				"first_name": "No Permissions",
				"send_welcome_email": 0,
				"user_type": "Website User",
			}
		).insert(ignore_permissions=True)

	def setUp(self):
		with set_user(self.user):
			self.assertFalse(frappe.has_permission("Task", "write"))

	def assign(self, task: str) -> str:
		"""An open ToDo on ``task`` that the saving user may not write."""
		todo = insert(
			{
				"doctype": "ToDo",
				"description": "Review",
				"allocated_to": "Administrator",
				"reference_type": "Task",
				"reference_name": task,
			}
		)
		with set_user(self.user):
			self.assertFalse(frappe.has_permission("ToDo", "write", doc=todo))
		return todo

	def test_rescheduling_dependents_without_permissions(self):
		project = make_project()
		start = datetime.combine(date.today(), time())
		blocker = make_task(project)
		dependent = get_task(make_task(project))
		dependent.exp_start_date = start
		dependent.exp_end_date = start + timedelta(days=2)
		# The extension finds dependents through the row's `project`, which ERPNext only
		# fills in when it creates tasks from a project template.
		dependent.append("depends_on", {"task": blocker, "project": project})
		dependent.save()

		doc = get_task(blocker)
		doc.exp_start_date = start
		doc.exp_end_date = start + timedelta(days=5)
		with set_user(self.user), _old_core():
			doc.save(ignore_permissions=True)

		dependent.reload()
		# Moved to the day after the blocker ends, keeping its two-day length.
		self.assertEqual(getdate(dependent.exp_start_date), (start + timedelta(days=6)).date())
		self.assertEqual(getdate(dependent.exp_end_date), (start + timedelta(days=8)).date())

	def test_a_completed_task_without_permissions_closes_its_assignments(self):
		name = make_task(make_project())
		todo = self.assign(name)
		task = get_task(name)

		task.status = "Completed"
		with set_user(self.user), _old_core():
			task.save(ignore_permissions=True)

		self.assertEqual(frappe.db.get_value("ToDo", todo, "status"), "Closed")

	def test_a_cancelled_task_without_permissions_cancels_its_assignments(self):
		name = make_task(make_project())
		todo = self.assign(name)
		task = get_task(name)

		task.status = "Cancelled"
		with set_user(self.user), _old_core():
			task.save(ignore_permissions=True)

		self.assertEqual(frappe.db.get_value("ToDo", todo, "status"), "Cancelled")

	def test_a_new_subtask_without_permissions_is_added_to_its_parents_dependencies(self):
		project = make_project()
		parent = make_task(project, is_group=1)
		child = frappe.get_doc(
			{"doctype": "Task", "subject": "Portal subtask", "project": project, "parent_task": parent}
		)

		with set_user(self.user), _old_core():
			child.insert(ignore_permissions=True)

		self.assertIn(child.name, [d.task for d in get_task(parent).depends_on])

	def test_a_completed_task_must_wait_for_its_dependencies(self):
		project = make_project()
		blocker = make_task(project)
		task = get_task(make_task(project))
		task.append("depends_on", {"task": blocker})
		task.save()

		task.status = "Completed"
		with set_user(self.user), _old_core(), self.assertRaises(frappe.ValidationError):
			task.save(ignore_permissions=True)

	def test_ordinary_saves_take_the_core_path(self):
		project = make_project()
		parent = make_task(project, is_group=1)
		child = frappe.get_doc(
			{"doctype": "Task", "subject": "Desk subtask", "project": project, "parent_task": parent}
		)
		core = "erpnext.projects.doctype.task.task.Task"
		with (
			patch(f"{core}.unassign_todo") as unassign_todo,
			patch(f"{core}.populate_depends_on") as populate_depends_on,
			patch(f"{core}.reschedule_dependent_tasks") as reschedule_dependent_tasks,
		):
			child.insert()
		unassign_todo.assert_called_once_with()
		populate_depends_on.assert_called_once_with()
		reschedule_dependent_tasks.assert_called_once_with()
