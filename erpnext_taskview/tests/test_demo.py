# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""The demo hook frappe-demo calls (`erpnext_taskview.demo.setup`)."""

import datetime

import frappe
from frappe.tests import IntegrationTestCase

from erpnext_taskview import demo

from .fixtures import COMPANY

CTX = {"today": datetime.date(2026, 1, 15), "seed": 1, "company": COMPANY, "erpnext_demo": False}


class TestDemo(IntegrationTestCase):
	def test_setup_builds_projects_timers_and_pins(self):
		demo.setup(CTX)
		project = frappe.db.get_value("Project", {"project_name": "Website Relaunch"}, "name")
		assert isinstance(project, str)
		self.assertEqual(frappe.db.get_value("Project", project, "budgeted_hours"), 80)
		self.assertEqual(frappe.db.count("Task", {"project": project, "is_group": 1}), 3)
		self.assertEqual(frappe.db.count("Task", {"project": project, "is_group": 0}), 8)

		for subject, minutes in (("Home page wireframes", 72), ("Keyword ranking report", 47)):
			task = frappe.db.get_value("Task", {"subject": subject}, "name")
			timer = frappe.db.get_value(
				"Timesheet Detail",
				{"task": task, "to_time": ["is", "not set"]},
				["paused", "paused_time_in_seconds", "start_time"],
				as_dict=True,
			)
			assert timer is not None
			self.assertEqual((timer.paused, timer.paused_time_in_seconds), (1, minutes * 60))
			self.assertEqual(timer.start_time, datetime.datetime(2026, 1, 15, 9, 0))

		pins = frappe.get_all(
			"ToDo",
			filters={"allocated_to": "Administrator", "pin": 1, "status": "Open", "reference_type": "Task"},
			pluck="reference_name",
			order_by="idx asc",
		)
		self.assertEqual(len(pins), len(demo.PINS) + 1)
		self.assertEqual(frappe.db.get_value("Task", pins[-1], "subject"), demo.UNFILED)
		self.assertFalse(frappe.db.get_value("Task", pins[-1], "project"))

	def test_setup_is_idempotent(self):
		demo.setup(CTX)
		demo.setup(CTX)
		self.assertEqual(frappe.db.count("Project", {"project_name": "Website Relaunch"}), 1)
		self.assertEqual(frappe.db.count("Task", {"subject": demo.UNFILED}), 1)
