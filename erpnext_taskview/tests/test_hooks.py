# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""The install hook and the Task controller extension's permission bypass."""

from datetime import date, datetime, time, timedelta

import frappe
from frappe.tests import IntegrationTestCase
from frappe.utils import getdate

from erpnext_taskview.install import ensure_notification_type
from erpnext_taskview.portal.notify import NOTIFICATION_TYPE

from .fixtures import get_task, make_project, make_task


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


class TestTaskPermissionBypass(IntegrationTestCase):
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
		doc.save(ignore_permissions=True)

		dependent.reload()
		# Moved to the day after the blocker ends, keeping its two-day length.
		self.assertEqual(getdate(dependent.exp_start_date), (start + timedelta(days=6)).date())
		self.assertEqual(getdate(dependent.exp_end_date), (start + timedelta(days=8)).date())

	def test_a_completed_task_without_permissions_closes_its_assignments(self):
		project = make_project()
		parent = make_task(project, is_group=1)
		task = get_task(make_task(project, parent=parent))
		frappe.get_doc(
			{
				"doctype": "ToDo",
				"description": "Review",
				"allocated_to": "Administrator",
				"reference_type": "Task",
				"reference_name": task.name,
			}
		).insert()

		task.status = "Completed"
		task.save(ignore_permissions=True)

		self.assertFalse(
			frappe.db.exists(
				"ToDo", {"reference_type": "Task", "reference_name": task.name, "status": "Open"}
			)
		)
		self.assertIn(task.name, [d.task for d in get_task(parent).depends_on])
