# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""Who may see what on the customer project portal.

Customers (Website Users) hold no permissions on Project or Task, and
``frappe.has_permission`` never consults ``has_website_permission``.  So, like
ERPNext's own portal pages, every portal endpoint first passes through this
module and only then reads or writes with ``ignore_permissions``.

A website user can see a project when either

- one of their Contacts (matched on ``Contact.user`` or any of its email
  addresses) links to the project's customer,
- they are listed in that customer's ``portal_users`` table, or
- they are listed in the project's own ``users`` table.

Staff (System Users) previewing the portal see what their normal Project
permissions allow, and write with normal permissions too.
"""

from typing import cast

import frappe
from frappe import _
from frappe.query_builder import Criterion, DocType, Order, Table
from frappe.query_builder.functions import Lower


def is_staff(user: str | None = None) -> bool:
	"""System Users preview the portal with their own permissions."""
	user = user or frappe.session.user
	return frappe.get_cached_value("User", user, "user_type") == "System User"


def get_customer_names(user: str | None = None) -> list[str]:
	"""Customers the website user belongs to, via Contact links or ``Customer.portal_users``."""
	user = user or frappe.session.user
	if user == "Guest":
		return []

	Contact = cast(Table, DocType("Contact"))
	ContactEmail = cast(Table, DocType("Contact Email"))
	DynamicLink = cast(Table, DocType("Dynamic Link"))
	PortalUser = cast(Table, DocType("Portal User"))

	email = user.lower()
	contacts = (
		frappe.qb.from_(Contact)
		.left_join(ContactEmail)
		.on((ContactEmail.parent == Contact.name) & (ContactEmail.parenttype == "Contact"))
		.select(Contact.name)
		.distinct()
		.where(
			Criterion.any(
				[
					Contact.user == user,
					Lower(Contact.email_id) == email,
					Lower(ContactEmail.email_id) == email,
				]
			)
		)
	)
	via_contacts = (
		frappe.qb.from_(DynamicLink)
		.select(DynamicLink.link_name)
		.distinct()
		.where(DynamicLink.parenttype == "Contact")
		.where(DynamicLink.link_doctype == "Customer")
		.where(DynamicLink.parent.isin(contacts))
	).run(pluck=True)

	via_portal_users = (
		frappe.qb.from_(PortalUser)
		.select(PortalUser.parent)
		.distinct()
		.where(PortalUser.parenttype == "Customer")
		.where(PortalUser.user == user)
	).run(pluck=True)

	return list(dict.fromkeys([*via_contacts, *via_portal_users]))


def get_accessible_projects(user: str | None = None) -> list[str]:
	"""Names of the (non-cancelled) projects the user may open on the portal, newest activity first."""
	user = user or frappe.session.user
	if user == "Guest":
		return []

	if is_staff(user):
		return frappe.get_list(
			"Project",
			filters={"status": ("!=", "Cancelled")},
			order_by="modified desc",
			pluck="name",
			limit_page_length=0,
		)

	Projects = cast(Table, DocType("Project"))
	ProjectUser = cast(Table, DocType("Project User"))

	conditions = [
		Projects.name.isin(
			frappe.qb.from_(ProjectUser)
			.select(ProjectUser.parent)
			.where(ProjectUser.parenttype == "Project")
			.where(ProjectUser.user == user)
		)
	]
	if customers := get_customer_names(user):
		conditions.append(Projects.customer.isin(customers))

	return (
		frappe.qb.from_(Projects)
		.select(Projects.name)
		.where(Criterion.any(conditions))
		.where(Projects.status != "Cancelled")
		.orderby(Projects.modified, order=Order.desc)
	).run(pluck=True)


def _deny() -> None:
	# One message for "missing" and "not yours", so project / task names
	# can't be probed from the portal.
	frappe.throw(_("You do not have access to this project."), frappe.PermissionError)


def assert_project_access(project: str) -> None:
	"""Raise ``frappe.PermissionError`` unless the session user may open ``project``."""
	if not project or frappe.session.user == "Guest":
		_deny()
	if is_staff():
		if not frappe.db.exists("Project", project) or not frappe.has_permission("Project", "read", project):
			_deny()
		return
	if project not in get_accessible_projects():
		_deny()


def assert_task_access(task: str) -> frappe._dict:
	"""Raise unless the session user may open ``task``; return its key fields.

	Template tasks are never exposed.
	"""
	row = (
		frappe.db.get_value(
			"Task",
			task,
			["name", "subject", "project", "parent_task", "status", "is_group", "is_template"],
			as_dict=True,
		)
		if task
		else None
	)
	if not row or row.is_template or not row.project:
		_deny()
	assert_project_access(row.project)
	return row
