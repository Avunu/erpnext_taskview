# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""Switch the customer portal over to the ``/projects`` SPA.

- Create the "Client Portal" Notification Type and opt existing users into
  its emails (new users get it by default).
- Disable ERPNext's ``/project`` portal menu row — the app adds its own
  "Projects" entry through the ``portal_menu_items`` hook, and
  ``Portal Settings.sync_menu`` only ever adds missing rows, so it stays off.
- Drop any Website Settings redirect from ``/projects`` back to the old
  ``/project`` list (sites used it to steer customers away from ERPNext's
  legacy project page, which the SPA now replaces).
- Land portal users on their projects after login.
"""

import frappe
from frappe.desk.doctype.notification_type.notification_type import seed_type_into_settings

from erpnext_taskview.install import ensure_notification_type
from erpnext_taskview.portal.notify import NOTIFICATION_TYPE


def _is_route(value: str | None, route: str) -> bool:
	return (value or "").strip("/ ") == route


def execute():
	ensure_notification_type()
	seed_type_into_settings(NOTIFICATION_TYPE)

	portal = frappe.get_single("Portal Settings")
	for row in portal.menu:
		if row.route == "/project":
			row.enabled = 0
	portal.default_portal_home = "/projects"
	portal.save(ignore_permissions=True)

	website = frappe.get_single("Website Settings")
	stale = [
		r
		for r in website.route_redirects
		if _is_route(r.source, "projects") and _is_route(r.target, "project")
	]
	if stale:
		for row in stale:
			website.remove(row)
		website.save(ignore_permissions=True)

	frappe.cache.delete_key("portal_menu_items")
	frappe.cache.delete_key("website_redirects")
