# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

import json

import frappe
from frappe.tests import IntegrationTestCase, set_user

from erpnext_taskview.erpnext_taskview.api import (
	create_pinned_task,
	get,
	pin_task,
	save_doc,
	set_task_project,
	unpin_task,
)

from .fixtures import COMPANY, make_customer, make_project, make_task, start_timer

# Matches no project, so get() returns only the user's tasks that have no project.
NO_PROJECTS = {"doctype": "Project", "filters": [["Project", "name", "=", "_TV no such project"]]}


def make_staff_user() -> str:
	"""A fresh System User, so every test starts with an empty pinned list."""
	email = f"tv-staff-{frappe.generate_hash(length=10)}@example.com"
	frappe.get_doc(
		{
			"doctype": "User",
			"email": email,
			"first_name": "Staff",
			"send_welcome_email": 0,
			"user_type": "System User",
			"roles": [{"role": "Projects User"}, {"role": "Projects Manager"}],
		}
	).insert(ignore_permissions=True)
	return email


def pinned_order(user: str) -> list[tuple[str, int]]:
	"""The user's pinned list as ``(task, idx)`` in display order."""
	rows = frappe.get_all(
		"ToDo",
		filters={"allocated_to": user, "status": "Open", "pin": 1, "reference_type": "Task"},
		fields=["reference_name", "idx"],
		order_by="idx asc, creation asc",
	)
	return [(r.reference_name, r.idx) for r in rows]


class TestPinnedQuickEntry(IntegrationTestCase):
	def setUp(self):
		self.user = make_staff_user()

	def create(self, subject: str, after: str | None = None) -> dict:
		with set_user(self.user):
			return create_pinned_task(subject, after)

	def test_create_pins_and_assigns_without_project(self):
		res = self.create("  Call the printer  ")

		task = frappe.get_doc("Task", res["task"])
		self.assertEqual(task.subject, "Call the printer")
		self.assertFalse(task.project)
		self.assertIn(self.user, json.loads(task._assign))
		todo = frappe.get_doc("ToDo", res["todo_name"])
		self.assertEqual((todo.allocated_to, todo.status, todo.pin), (self.user, "Open", 1))

		returned = next(t for t in res["tasks"] if t["name"] == res["task"])
		self.assertEqual(returned["project"], "")
		self.assertEqual(returned["todo_name"], res["todo_name"])

	def test_create_places_after_anchor(self):
		a = self.create("A")
		b = self.create("B")
		c = self.create("C")
		d = self.create("D", after=a["todo_name"])
		e = self.create("E", after="no-such-todo")  # unknown anchor → end

		self.assertEqual(
			pinned_order(self.user),
			[(a["task"], 1), (d["task"], 2), (b["task"], 3), (c["task"], 4), (e["task"], 5)],
		)

	def test_empty_subject_is_refused(self):
		with self.assertRaises(frappe.ValidationError):
			self.create("   ")

	def test_get_includes_only_own_pinned_tasks_without_project(self):
		mine = self.create("Mine")["task"]
		with set_user(make_staff_user()):
			theirs = create_pinned_task("Theirs")["task"]
		unpinned = frappe.get_doc({"doctype": "Task", "subject": "Loose"}).insert().name

		with set_user(self.user):
			names = [t["name"] for t in get(NO_PROJECTS)["tasks"]]

		self.assertIn(mine, names)
		self.assertNotIn(theirs, names)
		self.assertNotIn(unpinned, names)

	def test_no_project_blocks_unpin_and_timers(self):
		res = self.create("No project yet")
		with set_user(self.user):
			with self.assertRaises(frappe.ValidationError):
				unpin_task(res["task"])
			with self.assertRaises(frappe.ValidationError):
				save_doc(json.dumps({"doc": {"doctype": "Timesheet Detail", "task": res["task"]}}))

	def test_set_task_project_files_task_and_subtasks(self):
		project = make_project(make_customer())
		existing_root = make_task(project)
		frappe.db.set_value("Task", existing_root, "idx", 7)
		parent = self.create("Parent")["task"]
		frappe.db.set_value("Task", parent, "is_group", 1)
		child = frappe.get_doc({"doctype": "Task", "subject": "Child", "parent_task": parent}).insert().name

		with set_user(self.user):
			set_task_project(parent, project)

		parent_doc = frappe.get_doc("Task", parent)
		self.assertEqual((parent_doc.project, parent_doc.company, parent_doc.idx), (project, COMPANY, 8))
		self.assertEqual(frappe.db.get_value("Task", child, ["project", "company"]), (project, COMPANY))

		# Filed, it can be unpinned again.
		with set_user(self.user):
			unpin_task(parent)

	def test_set_task_project_refuses_subtasks_and_running_timers(self):
		project = make_project()
		other = make_project()
		phase = make_task(project, is_group=1)
		subtask = make_task(project, parent=phase)
		with self.assertRaises(frappe.ValidationError):
			set_task_project(subtask, other)

		timed = make_task(project)
		start_timer(project, timed)
		with self.assertRaises(frappe.ValidationError):
			set_task_project(timed, other)

	def test_repin_goes_to_bottom(self):
		project = make_project()
		x = make_task(project)
		y = make_task(project)
		with set_user(self.user):
			pin_task(x)
			pin_task(y)
			unpin_task(x)
			pin_task(x)

		self.assertEqual(pinned_order(self.user), [(y, 1), (x, 2)])
