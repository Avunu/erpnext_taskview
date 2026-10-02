# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

import frappe
from frappe.desk.form.assign_to import add as assign
from frappe.tests import IntegrationTestCase, set_user

from erpnext_taskview.portal import api
from erpnext_taskview.portal.access import assert_task_access, get_accessible_projects
from erpnext_taskview.portal.notify import NOTIFICATION_TYPE
from erpnext_taskview.www import projects as projects_page

from .fixtures import log_time, make_customer, make_portal_user, make_project, make_task


class TestPortal(IntegrationTestCase):
	@classmethod
	def setUpClass(cls):
		super().setUpClass()
		cls.customer = make_customer()
		cls.other_customer = make_customer()

		cls.contact_user = make_portal_user(cls.customer, via="contact")
		cls.portal_user = make_portal_user(cls.customer, via="portal_user")
		cls.member = make_portal_user()  # no customer; listed on one project only
		cls.outsider = make_portal_user(cls.other_customer, via="contact")

		cls.project = make_project(cls.customer, budgeted_hours=40)
		cls.member_project = make_project(cls.other_customer, users=(cls.member,))

		cls.phase = make_task(cls.project, is_group=1)
		assign({"doctype": "Task", "name": cls.phase, "assign_to": ["Administrator"]})
		cls.task = make_task(cls.project, parent=cls.phase, expected_time=6)
		log_time(cls.project, cls.task, 2, is_billable=0)

	# ── Access ────────────────────────────────────────────

	def test_access_paths(self):
		self.assertIn(self.project, get_accessible_projects(self.contact_user))
		self.assertIn(self.project, get_accessible_projects(self.portal_user))
		self.assertEqual(get_accessible_projects(self.member), [self.member_project])
		outsider_projects = get_accessible_projects(self.outsider)
		self.assertIn(self.member_project, outsider_projects)
		self.assertNotIn(self.project, outsider_projects)
		self.assertEqual(get_accessible_projects("Guest"), [])

	def test_outsider_is_refused_everywhere(self):
		attachment = None
		with set_user(self.contact_user):
			attachment = api.save_attachment(self.task, "brief.txt", b"brief")

		with set_user(self.outsider):
			calls = [
				lambda: api.get_project(self.project),
				lambda: api.get_task(self.task),
				lambda: api.create_task(self.project, "Sneaky"),
				lambda: api.set_task_status(self.task, "Working"),
				lambda: api.add_comment(self.task, "<p>hi</p>"),
				lambda: api.download_file(name=attachment.name),
			]
			for call in calls:
				with self.assertRaises(frappe.PermissionError):
					call()
			self.assertNotIn(self.project, [p["name"] for p in api.get_projects()])

	def test_template_tasks_are_hidden(self):
		template = make_task(self.project, is_template=1)
		with set_user(self.contact_user), self.assertRaises(frappe.PermissionError):
			assert_task_access(template)

	# ── Reads ─────────────────────────────────────────────

	def test_get_project(self):
		with set_user(self.contact_user):
			detail = api.get_project(self.project)

		self.assertTrue(detail["can_create"])
		self.assertEqual(detail["project"]["budget"]["budget_hours"], 40)
		self.assertEqual([p["name"] for p in detail["phases"]], [self.phase])
		card = next(t for t in detail["tasks"] if t["name"] == self.task)
		self.assertEqual(card["phase"], self.phase)
		self.assertEqual(card["column"], "Open")
		self.assertEqual(card["budget"]["logged_hours"], 2)

	def test_get_task_time_log(self):
		with set_user(self.portal_user):
			detail = api.get_task(self.task)

		self.assertEqual(
			detail["ancestors"],
			[{"name": self.phase, "subject": frappe.db.get_value("Task", self.phase, "subject")}],
		)
		self.assertEqual(detail["total_hours"], 2)
		self.assertEqual(detail["not_billed_hours"], 2)
		self.assertTrue(detail["time_logs"][0]["not_billed"])

	def test_board_column_for_overdue(self):
		self.assertEqual(api.board_column("Overdue", 0), "Open")
		self.assertEqual(api.board_column("Overdue", 1.5), "Working")
		self.assertEqual(api.board_column("Pending Review", 0), "Pending Review")

	# ── Writes ────────────────────────────────────────────

	def test_status_changes_close_assignments(self):
		task = make_task(self.project, parent=self.phase)
		assign({"doctype": "Task", "name": task, "assign_to": ["Administrator"]})

		with set_user(self.contact_user):
			api.set_task_status(task, "Completed")
		doc = frappe.get_doc("Task", task)
		self.assertEqual(doc.status, "Completed")
		self.assertEqual(doc.completed_by, self.contact_user)
		self.assertFalse(
			frappe.db.exists("ToDo", {"reference_type": "Task", "reference_name": task, "status": "Open"})
		)

		with set_user(self.contact_user):
			api.set_task_status(task, "Working")
		doc.reload()
		self.assertEqual(doc.status, "Working")
		self.assertIsNone(doc.completed_on)

	def test_status_rejects_phases_and_unknown_statuses(self):
		with set_user(self.contact_user):
			with self.assertRaises(frappe.ValidationError):
				api.set_task_status(self.phase, "Completed")
			with self.assertRaises(frappe.ValidationError):
				api.set_task_status(self.task, "Cancelled")

	def test_dependency_errors_pass_through(self):
		blocker = make_task(self.project)
		blocked = frappe.get_doc("Task", make_task(self.project))
		blocked.append("depends_on", {"task": blocker})
		blocked.save()

		with set_user(self.contact_user), self.assertRaisesRegex(frappe.ValidationError, blocker):
			api.set_task_status(blocked.name, "Completed")

	def test_create_task_under_phase(self):
		with set_user(self.contact_user):
			name = api.create_task(
				self.project,
				"  Please add a report  ",
				"<p>Details<script>alert(1)</script></p>",
				parent_task=self.phase,
				priority="High",
			)["name"]

		task = frappe.get_doc("Task", name)
		self.assertEqual(task.subject, "Please add a report")
		self.assertEqual(task.owner, self.contact_user)
		self.assertEqual(task.priority, "High")
		self.assertNotIn("script", task.description)
		self.assertEqual(task.company, frappe.db.get_value("Project", self.project, "company"))
		parent = frappe.get_doc("Task", self.phase)
		self.assertIn(name, [d.task for d in parent.depends_on])
		self.assertTrue(
			frappe.db.exists(
				"Notification Log",
				{"type": NOTIFICATION_TYPE, "document_name": name, "for_user": "Administrator"},
			)
		)

	def test_create_task_rejects_foreign_or_leaf_parent(self):
		foreign_phase = make_task(self.member_project, is_group=1)
		with set_user(self.contact_user):
			for parent in (self.task, foreign_phase):
				with self.assertRaises(frappe.ValidationError):
					api.create_task(self.project, "Bad parent", parent_task=parent)

	def test_comments(self):
		frappe.get_doc("Task", self.task).add_comment("Comment", "<p>From the team</p>")
		with set_user(self.contact_user):
			comment = api.add_comment(
				self.task,
				'<p>Hello <span class="mention" data-id="Administrator">@Admin</span><script>x()</script></p>',
			)
			detail = api.get_task(self.task)

		self.assertNotIn("<span", comment["content"])
		self.assertNotIn("script", comment["content"])
		by_staff = {c["content"]: c["is_staff"] for c in detail["comments"]}
		self.assertTrue(by_staff["<p>From the team</p>"])
		self.assertIn(comment["name"], [c["name"] for c in detail["comments"]])
		self.assertTrue(
			frappe.db.exists(
				"Notification Log",
				{"type": NOTIFICATION_TYPE, "document_name": self.task, "from_user": self.contact_user},
			)
		)

	def test_attachments(self):
		with set_user(self.contact_user):
			attachment = api.save_attachment(self.task, "notes.txt", b"hello portal")
			listed = api.get_task(self.task)["attachments"]
			frappe.local.response = frappe._dict()
			api.download_file(name=attachment.name)
			response = frappe.local.response

		self.assertIn(attachment.name, [a["name"] for a in listed])
		self.assertTrue(frappe.db.get_value("File", attachment.name, "is_private"))
		self.assertEqual(response.type, "download")
		self.assertEqual(response.display_content_as, "attachment")
		self.assertEqual(response.filecontent, "hello portal")

	# ── Page shell ────────────────────────────────────────

	def test_boot(self):
		with set_user(self.contact_user):
			boot = projects_page.get_boot("token")
		self.assertEqual(boot["user"], self.contact_user)
		self.assertFalse(boot["is_staff"])
		self.assertNotIn("/project", [m["route"] for m in boot["portal_menu"]])

	def test_legacy_link_redirect(self):
		frappe.local.flags.redirect_location = None
		with set_user(self.contact_user):
			frappe.local.form_dict = frappe._dict(project=self.project)
			with self.assertRaises(frappe.Redirect):
				projects_page.get_context(frappe._dict())
		self.assertEqual(frappe.local.flags.redirect_location, f"/projects/{self.project}")
		frappe.local.form_dict = frappe._dict()
