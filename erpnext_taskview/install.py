# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

import frappe

from erpnext_taskview.portal.notify import NOTIFICATION_TYPE


def ensure_notification_type() -> None:
	"""Create the "Client Portal" Notification Type used for portal activity alerts.

	New users are emailed for every enabled type by default; existing users are
	seeded once by the ``setup_client_portal`` patch.
	"""
	if frappe.db.exists("Notification Type", NOTIFICATION_TYPE):
		return
	frappe.get_doc({"doctype": "Notification Type", "type_name": NOTIFICATION_TYPE, "enabled": 1}).insert(
		ignore_permissions=True
	)
