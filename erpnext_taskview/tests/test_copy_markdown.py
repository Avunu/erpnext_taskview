# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

import json

import frappe
from frappe.tests import IntegrationTestCase, set_user
from frappe.utils import get_url

from erpnext_taskview.erpnext_taskview.api import get_task_descriptions

from .fixtures import make_portal_user, make_project, make_task

LONG_SENTENCE = " ".join(["Every word of this sentence stays on one line when copied."] * 4)


class TestTaskDescriptions(IntegrationTestCase):
	@classmethod
	def setUpClass(cls):
		super().setUpClass()
		cls.project = make_project()

	def task_with(self, description: str | None) -> str:
		task = make_task(self.project)
		frappe.db.set_value("Task", task, "description", description)
		return task

	def descriptions(self, *tasks: str) -> dict[str, str]:
		return get_task_descriptions(json.dumps(list(tasks)))["descriptions"]

	def test_html_becomes_markdown(self):
		task = self.task_with(
			'<div class="ql-editor read-mode"><p>Use the <strong>brand</strong> colours.</p>'
			'<ul><li>Logo</li><li>Fonts</li></ul><p><a href="https://example.com/guide">Guide</a></p></div>'
		)
		md = self.descriptions(task)[task]
		self.assertIn("Use the **brand** colours.", md)
		self.assertIn("* Logo", md)
		self.assertIn("[Guide](https://example.com/guide)", md)
		self.assertNotIn("\n\n\n", md)
		self.assertEqual(md, md.strip())

	def test_long_lines_are_not_wrapped(self):
		task = self.task_with(f"<p>{LONG_SENTENCE}</p>")
		self.assertEqual(self.descriptions(task)[task], LONG_SENTENCE)

	def test_relative_urls_become_absolute(self):
		task = self.task_with('<p><img src="/files/sketch.png"> <a href="/files/brief.pdf">Brief</a></p>')
		md = self.descriptions(task)[task]
		self.assertIn(f"{get_url()}/files/sketch.png", md)
		self.assertIn(f"({get_url()}/files/brief.pdf)", md)

	def test_empty_descriptions_are_left_out(self):
		blank = self.task_with('<div class="ql-editor read-mode"><p><br></p></div>')
		none = self.task_with(None)
		self.assertEqual(self.descriptions(blank, none), {})

	def test_only_requested_tasks(self):
		wanted = self.task_with("<p>Wanted</p>")
		self.task_with("<p>Not asked for</p>")
		self.assertEqual(self.descriptions(wanted, "TASK-DOES-NOT-EXIST"), {wanted: "Wanted"})

	def test_no_row_limit(self):
		# A whole project can be copied at once; get_list must not cap it at a page.
		tasks = [self.task_with(f"<p>Note {i}</p>") for i in range(25)]
		self.assertEqual(len(self.descriptions(*tasks)), 25)

	def test_accepts_a_list(self):
		task = self.task_with("<p>As a list</p>")
		self.assertEqual(get_task_descriptions([task])["descriptions"], {task: "As a list"})

	def test_no_tasks(self):
		self.assertEqual(self.descriptions(), {})

	def test_needs_task_read_permission(self):
		task = self.task_with("<p>Internal notes</p>")
		with set_user(make_portal_user()), self.assertRaises(frappe.PermissionError):
			self.descriptions(task)
