# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

from datetime import timedelta

import frappe
from frappe.tests import IntegrationTestCase

from erpnext_taskview.erpnext_taskview.api import get
from erpnext_taskview.erpnext_taskview.budget import compute_budgets

from .fixtures import log_time, make_customer, make_project, make_task, start_timer


class TestBudget(IntegrationTestCase):
	def test_leaf_and_group_rollup(self):
		project = make_project(make_customer())
		phase = make_task(project, is_group=1)
		a = make_task(project, parent=phase, expected_time=4)
		b = make_task(project, parent=phase, expected_time=6)
		cancelled = make_task(project, parent=phase, expected_time=5)
		frappe.db.set_value("Task", cancelled, "status", "Cancelled")
		log_time(project, a, 1.5)  # draft counts
		log_time(project, b, 2, submit=True)
		log_time(project, cancelled, 1)

		budgets = compute_budgets([project])

		self.assertEqual(
			budgets.tasks[a].model_dump(), {"budget_hours": 4, "logged_hours": 1.5, "source": "own"}
		)
		self.assertEqual(budgets.tasks[b].budget_hours, 6)
		self.assertEqual(budgets.tasks[b].logged_hours, 2)
		# A cancelled task adds no budget, but its time still counts.
		self.assertEqual(budgets.tasks[cancelled].budget_hours, 0)
		self.assertIsNone(budgets.tasks[cancelled].source)
		self.assertEqual(budgets.tasks[cancelled].logged_hours, 1)
		self.assertEqual(
			budgets.tasks[phase].model_dump(), {"budget_hours": 10, "logged_hours": 4.5, "source": "rollup"}
		)
		self.assertEqual(
			budgets.projects[project].model_dump(),
			{"budget_hours": 10, "logged_hours": 4.5, "source": "rollup"},
		)

	def test_own_estimate_wins_over_children(self):
		project = make_project(budgeted_hours=50)
		phase = make_task(project, is_group=1, expected_time=20)
		child = make_task(project, parent=phase, expected_time=4)
		log_time(project, phase, 3)  # time logged on the group itself
		log_time(project, child, 1)

		budgets = compute_budgets([project])

		self.assertEqual(budgets.tasks[phase].budget_hours, 20)
		self.assertEqual(budgets.tasks[phase].source, "own")
		self.assertEqual(budgets.tasks[phase].logged_hours, 4)
		self.assertEqual(
			budgets.projects[project].model_dump(), {"budget_hours": 50, "logged_hours": 4, "source": "own"}
		)

	def test_cancelled_timesheets_and_taskless_rows(self):
		project = make_project()
		task = make_task(project, expected_time=8)
		log_time(project, task, 2, submit=True).cancel()
		log_time(project, None, 1.25)  # project time with no task

		budgets = compute_budgets([project])

		self.assertEqual(budgets.tasks[task].logged_hours, 0)
		self.assertEqual(budgets.projects[project].logged_hours, 1.25)
		self.assertEqual(budgets.projects[project].budget_hours, 8)

	def test_open_timers(self):
		project = make_project()
		task = make_task(project, expected_time=10)
		start_timer(project, task, elapsed=timedelta(hours=1))

		counted = compute_budgets([project])
		self.assertAlmostEqual(counted.tasks[task].logged_hours, 1, delta=0.05)
		self.assertAlmostEqual(counted.projects[project].logged_hours, 1, delta=0.05)

		# The desk adds the user's own timers live, so the server leaves them out.
		excluded = compute_budgets([project], exclude_open_owner=frappe.session.user)
		self.assertEqual(excluded.tasks[task].logged_hours, 0)

	def test_rollup_follows_parent_task_not_nested_set(self):
		project = make_project()
		old_phase = make_task(project, is_group=1)
		new_phase = make_task(project, is_group=1)
		task = make_task(project, parent=old_phase, expected_time=3)
		log_time(project, task, 2)
		# The TaskView re-parents with db.set_value, leaving lft/rgt stale.
		frappe.db.set_value("Task", task, "parent_task", new_phase)

		budgets = compute_budgets([project])

		self.assertEqual(budgets.tasks[new_phase].budget_hours, 3)
		self.assertEqual(budgets.tasks[new_phase].logged_hours, 2)
		self.assertEqual(budgets.tasks[old_phase].budget_hours, 0)

	def test_parent_cycle_does_not_hang(self):
		project = make_project()
		a = make_task(project, is_group=1, expected_time=1)
		b = make_task(project, parent=a, is_group=1, expected_time=2)
		frappe.db.set_value("Task", a, "parent_task", b)

		budgets = compute_budgets([project])

		self.assertIn(a, budgets.tasks)
		self.assertIn(b, budgets.tasks)

	def test_get_includes_hidden_completed_children(self):
		project = make_project()
		phase = make_task(project, is_group=1)
		done = make_task(project, parent=phase, expected_time=5)
		log_time(project, done, 4)
		frappe.db.set_value("Task", done, "status", "Completed")

		response = get({"doctype": "Project", "filters": [["Project", "name", "=", project]]})

		self.assertNotIn(done, [t["name"] for t in response["tasks"]])
		phase_doc = next(t for t in response["tasks"] if t["name"] == phase)
		self.assertEqual((phase_doc["budget_hours"], phase_doc["logged_hours"]), (5, 4))
		project_doc = response["projects"][0]
		self.assertEqual((project_doc["budget_hours"], project_doc["logged_hours"]), (5, 4))
