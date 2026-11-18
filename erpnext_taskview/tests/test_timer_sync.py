# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""The realtime event that tells a user's open desk sessions their timers changed."""

import json
from collections import Counter
from collections.abc import Generator
from contextlib import contextmanager
from typing import Any, cast
from unittest.mock import patch

import frappe
from erpnext.projects.doctype.timesheet.timesheet import Timesheet
from frappe.tests import IntegrationTestCase, set_user

from erpnext_taskview.erpnext_taskview import api
from erpnext_taskview.erpnext_taskview.timer_sync import TIMERS_EVENT, notify_timers_changed

from .fixtures import make_customer, make_project, make_staff_user, make_task, start_timer


def save(doc: dict[str, Any]) -> dict[str, Any]:
	return api.save_doc(json.dumps({"doc": {"doctype": "Timesheet Detail", **doc}}))


@contextmanager
def published() -> Generator[Counter[str]]:
	"""The users TIMERS_EVENT was addressed to, with how many times, while the block runs.

	Every message is checked to be addressed to a named user: one with no user or room goes to
	every connected session.
	"""
	users: Counter[str] = Counter()

	def publish_realtime(
		event: str | None = None, message: Any = None, *, user: str | None = None, **kw: Any
	):
		if event == TIMERS_EVENT:
			assert user, "the timers event must name its user"
			assert not kw.get("room")
			users[user] += 1

	with patch("frappe.publish_realtime", publish_realtime):
		yield users


def timesheet_of(task: str) -> Timesheet:
	"""The draft Timesheet holding the time log on ``task``."""
	return cast(
		Timesheet,
		frappe.get_doc("Timesheet", frappe.db.get_value("Timesheet Detail", {"task": task}, "parent")),
	)


class TestTimerSync(IntegrationTestCase):
	@classmethod
	def setUpClass(cls):
		super().setUpClass()
		cls.project = make_project(make_customer())
		# Projects User: ERPNext's role for staff who work on projects.
		cls.staff, cls.staff_employee = make_staff_user("Projects User")
		cls.colleague, cls.colleague_employee = make_staff_user("Projects User")

	def setUp(self):
		frappe.db.savepoint("taskview_timer_sync")

	def tearDown(self):
		frappe.set_user("Administrator")
		frappe.db.rollback(save_point="taskview_timer_sync")

	def test_every_timer_action_tells_the_owner(self):
		task = make_task(self.project)
		for action in ("start", "pause", "resume", "stop"):
			with self.subTest(action), set_user(self.staff), published() as users:
				match action:
					case "start":
						save({"project": self.project, "task": task})
						self.row = frappe.db.get_value("Timesheet Detail", {"task": task}, "name")
					case "pause":
						save({"name": self.row, "paused": 1})
					case "resume":
						save({"name": self.row, "paused": 0})
					case "stop":
						save({"name": self.row, "to_time": frappe.utils.now(), "hours": 1})
			self.assertEqual(set(users), {self.staff})

	def test_a_description_edit_and_a_discard_tell_the_owner(self):
		task = make_task(self.project)
		with set_user(self.staff):
			save({"project": self.project, "task": task})
			row = frappe.db.get_value("Timesheet Detail", {"task": task}, "name")
			with published() as users:
				save({"name": row, "description": "Draft", "update_description": 1})
			self.assertEqual(set(users), {self.staff})
			with published() as users:
				save({"name": row, "delete": 1})
			self.assertEqual(set(users), {self.staff})

	def test_the_timer_that_is_auto_paused_tells_its_owner_too(self):
		first, second = make_task(self.project), make_task(self.project)
		with set_user(self.staff):
			save({"project": self.project, "task": first})
			with published() as users:
				save({"project": self.project, "task": second})
		# Starting the second pauses the first, in the same transaction.
		self.assertEqual(set(users), {self.staff})
		self.assertEqual(frappe.db.count("Timesheet Detail", {"task": first, "paused": 1}), 1)

	def test_only_the_owner_is_told(self):
		task = make_task(self.project)
		with set_user(self.staff), published() as users:
			save({"project": self.project, "task": task})
		self.assertNotIn(self.colleague, users)
		self.assertNotIn("Administrator", users)

	def test_the_timesheet_form_tells_the_owner_of_the_logs(self):
		task = make_task(self.project)
		with set_user(self.staff):
			save({"project": self.project, "task": task})
		timesheet = timesheet_of(task)

		# Saved whole, as the Timesheet form does: its logs run no hooks of their own.
		with published() as users:
			timesheet.note = "edited on the form"
			timesheet.save(ignore_permissions=True)
		self.assertEqual(set(users), {self.staff})

		with published() as users:
			timesheet.delete(ignore_permissions=True)
		self.assertEqual(set(users), {self.staff})

	def test_a_row_removed_on_the_form_still_tells_its_owner(self):
		task = make_task(self.project)
		with set_user(self.staff):
			save({"project": self.project, "task": task})
		timesheet = timesheet_of(task)
		# Another row, owned by someone else, so the Timesheet survives the removal.
		timesheet.append("time_logs", {"project": self.project, "task": make_task(self.project), "hours": 1})
		timesheet.save(ignore_permissions=True)
		timesheet.reload()
		(timer,) = [row for row in timesheet.time_logs if row.task == task]

		with published() as users:
			timesheet.remove(timer)
			timesheet.save(ignore_permissions=True)
		self.assertIn(self.staff, users)

	def test_a_direct_write_to_the_timesheet_tells_the_owner_of_its_logs(self):
		timesheet = start_timer(self.project, make_task(self.project))
		with published() as users:
			timesheet.db_set("note", "set directly")
		# The fixture, run as Administrator, made the row.
		self.assertEqual(set(users), {"Administrator"})

	def test_notify_names_each_user_once_and_skips_the_blank(self):
		with published() as users:
			notify_timers_changed(["a@example.com", "b@example.com", "a@example.com", None, ""])
		self.assertEqual(users, Counter({"a@example.com": 1, "b@example.com": 1}))

		with published() as users:
			notify_timers_changed([None, ""])
		self.assertEqual(users, Counter())

	def test_the_event_is_published_after_commit_with_no_data(self):
		with patch("frappe.publish_realtime") as publish:
			notify_timers_changed(["a@example.com"])
		publish.assert_called_once_with(TIMERS_EVENT, {}, user="a@example.com", after_commit=True)
