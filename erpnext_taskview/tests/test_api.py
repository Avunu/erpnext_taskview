# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""The desk Task View's endpoints: reads, filters, and every save_doc route."""

import json
from datetime import UTC, datetime, timedelta
from inspect import isfunction
from types import SimpleNamespace
from typing import Any
from unittest.mock import patch

import frappe
from frappe.handler import execute_cmd, is_valid_http_method
from frappe.tests import IntegrationTestCase
from frappe.utils import now_datetime

from erpnext_taskview.erpnext_taskview import api
from erpnext_taskview.erpnext_taskview.budget import get_budget_summary

from .fixtures import COMPANY, get_task, insert, log_time, make_customer, make_project, make_task, start_timer


def project_filter(*filters: list) -> dict[str, Any]:
	return {"doctype": "Project", "filters": [["Project", *f] for f in filters]}


def save(doc: dict[str, Any], form_params: str | None = None, **request: Any) -> dict[str, Any]:
	return api.save_doc(json.dumps({"doc": doc, **request}), form_params)


def detail_of(timesheet_detail: str) -> Any:
	return frappe.db.get_value(
		"Timesheet Detail",
		timesheet_detail,
		["from_time", "to_time", "hours", "paused", "start_time", "paused_time_in_seconds", "description"],
		as_dict=True,
	)


def open_timer(task: str) -> str:
	"""The current user's open Timesheet Detail on ``task``."""
	name = frappe.db.get_value("Timesheet Detail", {"task": task, "to_time": ["is", "not set"]}, "name")
	assert name
	return str(name)


class TestGet(IntegrationTestCase):
	@classmethod
	def setUpClass(cls):
		super().setUpClass()
		cls.customer = make_customer()
		cls.project = make_project(cls.customer)
		cls.other = make_project()
		cls.task = make_task(cls.project)
		cls.done = make_task(cls.project, status="Completed")

	def names(self, args: dict[str, Any], key: str = "projects") -> list[str]:
		return [d["name"] for d in api.get(json.dumps(args))[key]]

	def test_project_filters(self):
		self.assertEqual(self.names(project_filter(["name", "=", self.project])), [self.project])
		self.assertNotIn(self.project, self.names(project_filter(["name", "!=", self.project])))
		self.assertEqual(self.names(project_filter(["name", "in", self.project])), [self.project])
		both = self.names(project_filter(["name", "in", [self.project, self.other]]))
		self.assertEqual(sorted(both), sorted([self.project, self.other]))
		self.assertNotIn(self.project, self.names(project_filter(["name", "not in", [self.project]])))
		self.assertNotIn(self.project, self.names(project_filter(["name", "not in", self.project])))
		self.assertIn(self.project, self.names(project_filter(["customer", "like", self.customer])))
		self.assertNotIn(self.project, self.names(project_filter(["customer", "not like", self.customer])))
		self.assertIn(self.project, self.names(project_filter(["customer", "is", "set"])))
		self.assertNotIn(self.project, self.names(project_filter(["customer", "is", "not set"])))
		self.assertIn(self.project, self.names(project_filter(["percent_complete", ">=", 0])))
		self.assertIn(self.project, self.names(project_filter(["percent_complete", "<=", 100])))
		self.assertNotIn(self.project, self.names(project_filter(["percent_complete", ">", 100])))
		self.assertNotIn(self.project, self.names(project_filter(["percent_complete", "<", 0])))
		self.assertIn(self.project, self.names(project_filter(["percent_complete", "between", [0, 100]])))
		with self.assertRaises(frappe.ValidationError):
			self.names(project_filter(["name", "regexp", "x"]))

	def test_task_filters_and_closed_tasks(self):
		by_project = {"doctype": "Task", "filters": [["Task", "project", "=", self.project]]}
		result = api.get(by_project)
		self.assertEqual([p["name"] for p in result["projects"]], [self.project])
		tasks = [t["name"] for t in result["tasks"]]
		self.assertIn(self.task, tasks)
		self.assertNotIn(self.done, tasks)  # closed tasks are hidden by default

		# A status filter shows them.
		with_status = {
			"doctype": "Task",
			"filters": [["Task", "project", "=", self.project], ["Task", "status", "=", "Completed"]],
		}
		self.assertEqual(self.names(with_status, "tasks"), [self.done])

	def test_sorting(self):
		desc = self.names({"doctype": "Project", "sort_by": "creation", "sort_order": "desc"})
		self.assertLess(desc.index(self.other), desc.index(self.project))
		order_by = self.names({"doctype": "Project", "order_by": "`tabProject`.`creation` desc"})
		self.assertLess(order_by.index(self.other), order_by.index(self.project))
		# An unknown field falls back to the manual order instead of failing.
		self.assertIn(self.project, self.names({"doctype": "Project", "sort_by": "no_such_field"}))
		self.assertEqual(api._parse_sort(frappe._dict(order_by="  ")), ("idx", api.Order.asc))

	def test_active_timers(self):
		timer = start_timer(self.project, self.task)
		timers = api.get_active_timers()["timers"]
		row = next(t for t in timers if t["parent"] == timer.name)
		self.assertEqual(row["task"], self.task)
		self.assertEqual(row["customer"], self.customer)
		self.assertEqual(row["task_subject"], frappe.db.get_value("Task", self.task, "subject"))

	def test_budget_summary(self):
		task = make_task(self.project, expected_time=3)
		log_time(self.project, task, 1)
		summary = get_budget_summary(json.dumps([self.project]))
		self.assertEqual(summary["tasks"][task]["logged_hours"], 1)
		self.assertEqual(get_budget_summary([]), {"projects": {}, "tasks": {}})


class TestSaveProjectAndTask(IntegrationTestCase):
	def test_project_rename_and_reorder(self):
		a, b, c = make_project(), make_project(), make_project()
		save({"doctype": "Project", "name": b, "project_name": "Renamed", "status": "Open", "idx": 1})
		self.assertEqual(frappe.db.get_value("Project", b, ["project_name", "idx"]), ("Renamed", 1))

		save(
			{"doctype": "Project", "name": c, "project_name": "C", "status": "Open"},
			sibling_order=[c, a, b],
		)
		idx = {p: frappe.db.get_value("Project", p, "idx") for p in (a, b, c)}
		self.assertLess(idx[c], idx[a])
		self.assertLess(idx[a], idx[b])

	def test_new_project_takes_the_filtered_customer(self):
		customer = make_customer()
		form_params = json.dumps(project_filter(["customer", "=", customer]))
		# A new Project takes its company from the defaults, as a site's setup wizard sets them.
		previous = frappe.db.get_default("company")
		frappe.db.set_default("company", COMPANY)
		try:
			result = save({"doctype": "Project", "project_name": "From the list"}, form_params=form_params)
		finally:
			frappe.db.set_default("company", previous)
		project = frappe.db.get_value("Project", {"project_name": "From the list"}, ["name", "customer"])
		assert project
		self.assertEqual(project[1], customer)
		self.assertIn(project[0], [p["name"] for p in result["projects"]])

	def test_new_task_under_parent_assigned_to_me(self):
		project = make_project()
		parent = make_task(project)
		save(
			{"doctype": "Task", "subject": "Child", "project": project, "parent_task": parent, "idx": 3},
			assign_to_me=True,
		)
		child = frappe.db.get_value("Task", {"parent_task": parent}, ["name", "idx", "_assign"], as_dict=True)
		assert child
		self.assertEqual(child.idx, 3)
		self.assertIn("Administrator", json.loads(child._assign))
		self.assertEqual(frappe.db.get_value("Task", parent, "is_group"), 1)

	def test_drag_task_to_another_parent_and_project(self):
		source, target = make_project(), make_project()
		moved = make_task(source, is_group=1)
		grandchild = make_task(source, parent=moved)
		new_parent = make_task(target, is_group=1)
		sibling = make_task(target, parent=new_parent)
		doc = {
			"doctype": "Task",
			"name": moved,
			"subject": "Moved",
			"project": target,
			"parent_task": new_parent,
			"idx": 1,
		}
		children = [{"doctype": "Task", "name": grandchild, "subject": "Grandchild", "project": source}]
		save(doc, children=children, sibling_order=[moved, sibling])

		self.assertEqual(frappe.db.get_value("Task", moved, ["project", "parent_task"]), (target, new_parent))
		self.assertEqual(frappe.db.get_value("Task", grandchild, "project"), target)
		self.assertEqual(frappe.db.get_value("Task", new_parent, "is_group"), 1)
		self.assertLess(
			frappe.db.get_value("Task", moved, "idx"), frappe.db.get_value("Task", sibling, "idx")
		)

	def test_reorder_without_an_explicit_order(self):
		project = make_project()
		first, second, third = make_task(project), make_task(project), make_task(project)
		unindexed = make_task(project)
		for i, name in enumerate((first, second, third), start=1):
			frappe.db.set_value("Task", name, "idx", i)
		frappe.db.set_value("Task", unindexed, "idx", 0)

		save({"doctype": "Task", "name": third, "subject": "Third", "project": project, "idx": 1})

		order = sorted((first, second, third, unindexed), key=lambda t: frappe.db.get_value("Task", t, "idx"))
		self.assertEqual(order, [third, first, second, unindexed])

	def test_hidden_siblings_keep_their_place(self):
		project = make_project()
		a, hidden, b = make_task(project), make_task(project, status="Completed"), make_task(project)
		for i, name in enumerate((a, hidden, b), start=1):
			frappe.db.set_value("Task", name, "idx", i)
		save(
			{"doctype": "Task", "name": b, "subject": "B", "project": project, "idx": 1},
			sibling_order=[b, a, "stale-name"],
		)
		order = sorted((a, hidden, b), key=lambda t: frappe.db.get_value("Task", t, "idx"))
		self.assertEqual(order, [b, a, hidden])


class TestTaskEndpoints(IntegrationTestCase):
	def test_bulk_create(self):
		project = make_project()
		parent = make_task(project)
		result = api.bulk_create_tasks(
			json.dumps(
				{
					"subjects": ["One", "  ", " Two "],
					"project": project,
					"parent_task": parent,
					"assign_to_me": 1,
				}
			)
		)
		created = frappe.get_all("Task", filters={"parent_task": parent}, pluck="subject")
		self.assertEqual(sorted(created), ["One", "Two"])
		self.assertEqual(frappe.db.get_value("Task", parent, "is_group"), 1)
		self.assertTrue(any(t["subject"] == "One" for t in result["tasks"]))
		with self.assertRaises(frappe.ValidationError):
			api.bulk_create_tasks(json.dumps({"subjects": [], "project": project}))

	def test_delete_task_with_a_parent(self):
		project = make_project()
		parent = make_task(project, is_group=1)
		child = make_task(project, parent=parent)
		self.assertIn(child, [d.task for d in get_task(parent).depends_on])

		result = api.delete_task(child, json.dumps({"doctype": "Task"}))

		self.assertFalse(frappe.db.exists("Task", child))
		self.assertFalse(frappe.db.exists("Task Depends On", {"task": child}))
		self.assertNotIn(child, [t["name"] for t in result["tasks"]])

	def test_assign_and_unassign(self):
		project = make_project()
		task = make_task(project)
		api.assign_task(task, "Administrator")
		self.assertIn("Administrator", json.loads(get_task(task).get("_assign")))
		api.unassign_task(task, "Administrator")
		self.assertNotIn("Administrator", json.loads(get_task(task).get("_assign") or "[]"))

	def test_reorder_pinned_skips_other_users_todos(self):
		project = make_project()
		a, b = make_task(project), make_task(project)
		api.pin_task(a)
		api.pin_task(b)
		todo_a = api._pin_for_current_user(a)
		todo_b = api._pin_for_current_user(b)
		foreign = insert({"doctype": "ToDo", "description": "Not mine", "allocated_to": "Guest"})

		api.reorder_pinned_tasks(json.dumps([todo_b, todo_a, foreign]))

		self.assertEqual(frappe.db.get_value("ToDo", todo_b, "idx"), 1)
		self.assertEqual(frappe.db.get_value("ToDo", todo_a, "idx"), 2)
		self.assertNotEqual(frappe.db.get_value("ToDo", foreign, "idx"), 3)


class TestRequestContract(IntegrationTestCase):
	"""Mutating endpoints take POST only; reads take any method."""

	MUTATING = frozenset(
		{
			"assign_task",
			"bulk_create_tasks",
			"create_pinned_task",
			"delete_task",
			"pin_task",
			"reorder_pinned_tasks",
			"save_doc",
			"set_task_project",
			"unassign_task",
			"unpin_task",
		}
	)
	READS = frozenset({"get", "get_active_timers", "get_task_descriptions"})

	def setUp(self):
		self.endpoints = {
			name: fn for name, fn in vars(api).items() if isfunction(fn) and fn in frappe.whitelisted
		}
		frappe.local.request = SimpleNamespace(method="GET")
		self.addCleanup(delattr, frappe.local, "request")

	def test_every_endpoint_is_classified(self):
		self.assertEqual(set(self.endpoints), self.MUTATING | self.READS)
		for name in self.MUTATING:
			self.assertEqual(
				frappe.allowed_http_methods_for_whitelisted_func[self.endpoints[name]], ["POST"], name
			)

	def test_mutating_endpoints_refuse_get(self):
		for name in sorted(self.MUTATING):
			with self.subTest(name), self.assertRaises(frappe.PermissionError):
				execute_cmd(f"{api.__name__}.{name}")

	def test_reads_accept_get(self):
		for name in sorted(self.READS):
			is_valid_http_method(self.endpoints[name])


class TestTimers(IntegrationTestCase):
	@classmethod
	def setUpClass(cls):
		super().setUpClass()
		cls.project = make_project(make_customer())

	def setUp(self):
		# Each test's time logs are its own: ERPNext refuses a user's overlapping logs.
		frappe.db.savepoint("taskview_timer_test")

	def tearDown(self):
		frappe.db.rollback(save_point="taskview_timer_test")

	def test_start_pause_resume_stop(self):
		task = make_task(self.project)
		other = make_task(self.project)

		save({"doctype": "Timesheet Detail", "project": self.project, "task": other})
		other_timer = open_timer(other)
		save({"doctype": "Timesheet Detail", "project": self.project, "task": task, "description": "Work"})
		timer = open_timer(task)
		# Starting a timer pauses the one that was running.
		self.assertEqual(detail_of(other_timer).paused, 1)
		self.assertEqual(detail_of(timer).paused, 0)
		# Both rows went into one draft timesheet for the project.
		self.assertEqual(
			frappe.db.get_value("Timesheet Detail", timer, "parent"),
			frappe.db.get_value("Timesheet Detail", other_timer, "parent"),
		)

		save({"doctype": "Timesheet Detail", "name": timer, "paused": 1})
		self.assertEqual(detail_of(timer).paused, 1)

		save({"doctype": "Timesheet Detail", "name": other_timer, "paused": 0})
		self.assertEqual(detail_of(other_timer).paused, 0)

		save({"doctype": "Timesheet Detail", "name": timer, "description": "Notes", "update_description": 1})
		self.assertEqual(detail_of(timer).description, "Notes")

		result = save(
			{
				"doctype": "Timesheet Detail",
				"name": timer,
				"task": other,
				"to_time": now_datetime().isoformat(),
				"hours": 1.5,
				"is_billable": 1,
				"billing_hours": 1,
				"activity_type": "",
			}
		)
		stopped = detail_of(timer)
		self.assertEqual(stopped.hours, 1.5)
		self.assertEqual(stopped.to_time, stopped.from_time + timedelta(hours=1.5))
		self.assertEqual(frappe.db.get_value("Timesheet Detail", timer, "task"), other)
		self.assertEqual(result["alert"], "Logged 1.50 hrs")

	def test_a_failed_request_keeps_none_of_its_writes(self):
		task = make_task(self.project)
		other = make_task(self.project)
		save({"doctype": "Timesheet Detail", "project": self.project, "task": other})
		running = open_timer(other)

		frappe.db.savepoint("taskview_request")
		with (
			# No endpoint commits on its own; frappe commits a successful request.
			patch.object(frappe.local.db, "commit", side_effect=AssertionError("committed mid-request")),
			# Fail once the new timer is started and the running one paused.
			patch.object(api, "_snapshot", side_effect=frappe.ValidationError("snapshot failed")),
			self.assertRaises(frappe.ValidationError),
		):
			save({"doctype": "Timesheet Detail", "project": self.project, "task": task})
		self.assertEqual(detail_of(running).paused, 1)
		self.assertTrue(frappe.db.exists("Timesheet Detail", {"task": task}))

		# What frappe does with a failed request: roll its transaction back.
		frappe.db.rollback(save_point="taskview_request")
		self.assertEqual(detail_of(running).paused, 0)
		self.assertFalse(frappe.db.exists("Timesheet Detail", {"task": task}))

	def test_stop_from_elapsed_time_and_complete(self):
		project = make_project()
		parent = make_task(project, is_group=1)
		child = make_task(project, parent=parent)

		save({"doctype": "Timesheet Detail", "project": project, "task": parent})
		timer = open_timer(parent)
		stop = {
			"doctype": "Timesheet Detail",
			"name": timer,
			"to_time": now_datetime().isoformat(),
			"completed": 1,
		}
		result = save(stop)
		self.assertIn("1 open subtask", result["notice"])
		self.assertNotEqual(frappe.db.get_value("Task", parent, "status"), "Completed")

		frappe.db.set_value("Task", child, "status", "Completed")
		save({"doctype": "Timesheet Detail", "project": project, "task": child})
		child_timer = open_timer(child)
		result = save({**stop, "name": child_timer})
		self.assertIsNone(result["notice"])
		self.assertEqual(frappe.db.get_value("Timesheet Detail", child_timer, "completed"), 1)

	def manual_log(self, project: str, task: str, span: float, **fields: Any) -> dict[str, Any]:
		"""Log ``span`` hours ending 40 days ago, as the Log Time dialog does: UTC ISO strings."""
		end = datetime.now(UTC) - timedelta(days=40)
		return save(
			{
				"doctype": "Timesheet Detail",
				"project": project,
				"task": task,
				"from_time": (end - timedelta(hours=span)).isoformat().replace("+00:00", "Z"),
				"to_time": end.isoformat().replace("+00:00", "Z"),
				"hours": span,
				**fields,
			}
		)

	def test_manual_log(self):
		project = make_project()
		task = make_task(project)
		result = self.manual_log(project, task, 2, is_billable=1, billing_hours=1.5, completed=1)
		row = frappe.db.get_value(
			"Timesheet Detail", {"task": task}, ["hours", "billing_hours", "completed"], as_dict=True
		)
		assert row
		self.assertEqual((row.hours, row.billing_hours, row.completed), (2, 1.5, 1))
		self.assertEqual(result["alert"], "Logged 2.00 hrs")
		self.assertIsNone(result["notice"])
		# Completed completes the task, as it does when a timer is stopped.
		self.assertEqual(frappe.db.get_value("Task", task, "status"), "Completed")

	def test_manual_log_hours_come_from_from_and_to_time(self):
		project = make_project()
		task = make_task(project)
		self.manual_log(project, task, 1.25, hours=0)
		self.assertEqual(frappe.db.get_value("Timesheet Detail", {"task": task}, "hours"), 1.25)

	def test_manual_log_stores_system_time(self):
		"""The dialog sends UTC; the row holds the same instant in the system time zone."""
		project = make_project()
		task = make_task(project)
		with patch("frappe.utils.data.get_system_timezone", return_value="America/New_York"):
			save(
				{
					"doctype": "Timesheet Detail",
					"project": project,
					"task": task,
					"from_time": "2026-01-15T15:00:00.000Z",
					"to_time": "2026-01-15T16:30:00.000Z",
					"hours": 1.5,
				}
			)
		row = frappe.db.get_value("Timesheet Detail", {"task": task}, ["from_time", "to_time"], as_dict=True)
		assert row
		# New York is UTC-5 in January.
		self.assertEqual(row.from_time, datetime(2026, 1, 15, 10, 0))
		self.assertEqual(row.to_time, datetime(2026, 1, 15, 11, 30))

	def test_manual_log_leaves_an_open_timer_alone(self):
		project = make_project()
		task = make_task(project)
		save({"doctype": "Timesheet Detail", "project": project, "task": task})
		timer = open_timer(task)

		self.manual_log(project, task, 1, description="Call with the client")

		self.assertEqual(open_timer(task), timer)
		self.assertIsNone(detail_of(timer).to_time)
		logged = frappe.get_all(
			"Timesheet Detail",
			filters={"task": task, "to_time": ["is", "set"]},
			fields=["name", "hours", "description", "parent"],
		)
		self.assertEqual(len(logged), 1)
		self.assertNotEqual(logged[0].name, timer)
		self.assertEqual((logged[0].hours, logged[0].description), (1, "Call with the client"))
		# Both rows go to the same draft Timesheet.
		self.assertEqual(logged[0].parent, frappe.db.get_value("Timesheet Detail", timer, "parent"))

	def test_manual_log_needs_hours(self):
		project = make_project()
		task = make_task(project)
		moment = (datetime.now(UTC) - timedelta(days=40)).isoformat()
		with self.assertRaises(frappe.ValidationError):
			save(
				{
					"doctype": "Timesheet Detail",
					"project": project,
					"task": task,
					"from_time": moment,
					"to_time": moment,
				}
			)
		self.assertFalse(frappe.db.exists("Timesheet Detail", {"task": task}))

	def test_manual_log_needs_a_project(self):
		task = make_task(make_project())
		with self.assertRaises(frappe.ValidationError):
			self.manual_log("", task, 1)

	def test_manual_log_completed_waits_for_subtasks(self):
		project = make_project()
		parent = make_task(project, is_group=1)
		make_task(project, parent=parent)

		result = self.manual_log(project, parent, 1, completed=1)

		self.assertIn("1 open subtask", result["notice"])
		self.assertEqual(frappe.db.get_value("Timesheet Detail", {"task": parent}, "completed"), 0)
		self.assertNotEqual(frappe.db.get_value("Task", parent, "status"), "Completed")

	def test_manual_log_counts_and_submits(self):
		project = make_project()
		task = make_task(project, expected_time=10)
		self.manual_log(project, task, 3)

		budget = get_budget_summary(json.dumps([project]))
		self.assertEqual(budget["tasks"][task]["logged_hours"], 3)

		name = frappe.db.get_value("Timesheet Detail", {"task": task}, "parent")
		frappe.get_doc("Timesheet", name).submit()
		self.assertEqual(frappe.db.get_value("Timesheet", name, ["docstatus", "total_hours"]), (1, 3))

	def test_discard_removes_an_empty_timesheet(self):
		task = make_task(make_project())
		project = frappe.db.get_value("Task", task, "project")
		save({"doctype": "Timesheet Detail", "project": project, "task": task})
		timer = open_timer(task)
		timesheet = frappe.db.get_value("Timesheet Detail", timer, "parent")

		result = save({"doctype": "Timesheet Detail", "name": timer, "delete": 1})

		self.assertFalse(frappe.db.exists("Timesheet Detail", timer))
		self.assertFalse(frappe.db.exists("Timesheet", timesheet))
		self.assertEqual(result["alert"], f"Deleted timer for task {task}")

	def test_find_timesheet_hook(self):
		project = make_project()
		task = make_task(project)
		chosen = log_time(project, task, 1).name
		original = frappe.get_hooks

		def get_hooks(hook: str | None = None, *args: Any, **kwargs: Any) -> Any:
			if hook == "taskview_find_timesheet":
				return ["erpnext_taskview.tests.test_api.choose_timesheet"]
			return original(hook, *args, **kwargs)

		frappe.flags.taskview_test_timesheet = chosen
		try:
			with patch.object(frappe, "get_hooks", get_hooks):
				save({"doctype": "Timesheet Detail", "project": project, "task": task})
		finally:
			frappe.flags.taskview_test_timesheet = None
		self.assertEqual(frappe.db.get_value("Timesheet Detail", open_timer(task), "parent"), chosen)


def choose_timesheet(employee: str | None, project: str) -> str | None:
	"""A ``taskview_find_timesheet`` hook for the test above."""
	return frappe.flags.taskview_test_timesheet
