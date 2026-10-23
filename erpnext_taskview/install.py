# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""Install-time set-up: the Client Portal notification type and the ``/projects`` portal."""

import frappe
from frappe.desk.doctype.notification_type.notification_type import seed_type_into_settings
from frappe.website.utils import clear_website_cache

from erpnext_taskview.portal.notify import NOTIFICATION_TYPE

PORTAL_HOME = "/projects"
# ERPNext's own project list, which the ``/projects`` portal replaces.
LEGACY_ROUTE = "/project"


def ensure_notification_type() -> None:
	"""Create the "Client Portal" Notification Type used for portal activity alerts.

	New users are emailed for every enabled type by default; existing users are
	opted in by :func:`setup_client_portal`.
	"""
	if frappe.db.exists("Notification Type", NOTIFICATION_TYPE):
		return
	frappe.get_doc({"doctype": "Notification Type", "type_name": NOTIFICATION_TYPE, "enabled": 1}).insert(
		ignore_permissions=True
	)


def _is_route(value: str | None, route: str) -> bool:
	return (value or "").strip("/ ") == route.strip("/")


def setup_client_portal() -> None:
	"""Switch the customer portal over to the ``/projects`` app.  Safe to run again.

	- Create the "Client Portal" Notification Type and opt every existing user
		into its emails (new users get it by default).
	- Disable ERPNext's ``/project`` portal menu row: the app adds its own
		"Projects" entry through the ``portal_menu_items`` hook, and
		``Portal Settings.sync_menu`` only ever adds missing rows, so it stays off.
	- Land portal users on their projects after login, unless the site already
		chose another Default Portal Home.
	- Drop any Website Settings redirect from ``/projects`` back to ``/project``
		(sites used it to steer customers away from ERPNext's legacy project page,
		which this portal replaces).

	Settings are saved only when something changes, so a second run writes nothing.
	"""
	ensure_notification_type()
	seed_type_into_settings(NOTIFICATION_TYPE)

	portal = frappe.get_single("Portal Settings")
	changed = False
	for row in portal.menu:
		if _is_route(row.route, LEGACY_ROUTE) and row.enabled:
			row.enabled = 0
			changed = True
	home = portal.default_portal_home
	if not (home or "").strip() or _is_route(home, LEGACY_ROUTE):
		portal.default_portal_home = PORTAL_HOME
		changed = True
	if changed:
		portal.save(ignore_permissions=True)

	website = frappe.get_single("Website Settings")
	stale = [
		r
		for r in website.route_redirects
		if _is_route(r.source, PORTAL_HOME) and _is_route(r.target, LEGACY_ROUTE)
	]
	if stale:
		for row in stale:
			website.remove(row)
		website.save(ignore_permissions=True)

	# The portal menu and the redirects are cached; frappe's website cache reset clears both.
	clear_website_cache()


def after_install() -> None:
	"""``after_install`` hook.

	``install-app`` marks every patch of a new app as done without running it,
	so the portal set-up the ``setup_client_portal`` patch does for upgraded
	sites has to happen here too.
	"""
	setup_client_portal()
