# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

import frappe
from frappe.tests import IntegrationTestCase

from erpnext_taskview.erpnext_taskview.custom.timesheet import forward_status

from .fixtures import log_time, make_project, make_task


class TestTimesheetGuard(IntegrationTestCase):
	def test_forward_status(self):
		self.assertEqual(forward_status("Open", "Working"), "Working")
		self.assertEqual(forward_status("Overdue", "Working"), "Working")
		self.assertEqual(forward_status("Pending Review", "Working"), "Pending Review")
		self.assertEqual(forward_status("Pending Review", "Completed"), "Completed")
		self.assertEqual(forward_status("Completed", "Working"), "Completed")
		self.assertEqual(forward_status("Cancelled", "Completed"), "Cancelled")
		self.assertEqual(forward_status("Template", "Working"), "Template")

	def test_submit_never_moves_tasks_backwards(self):
		project = make_project()
		open_task = make_task(project)
		in_review = make_task(project)
		approved = make_task(project)
		frappe.db.set_value("Task", in_review, "status", "Pending Review")
		frappe.db.set_value("Task", approved, "status", "Completed")

		for task in (open_task, in_review, approved):
			log_time(project, task, 1, submit=True)

		self.assertEqual(frappe.db.get_value("Task", open_task, "status"), "Working")
		self.assertEqual(frappe.db.get_value("Task", in_review, "status"), "Pending Review")
		self.assertEqual(frappe.db.get_value("Task", approved, "status"), "Completed")
		# Time and costing are still refreshed from the submitted log.
		self.assertEqual(frappe.db.get_value("Task", approved, "actual_time"), 1)
