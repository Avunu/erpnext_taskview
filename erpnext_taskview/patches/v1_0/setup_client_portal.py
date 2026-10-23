# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""Switch an existing site's customer portal over to the ``/projects`` app.

A fresh install runs the same set-up from ``after_install``; see
:func:`erpnext_taskview.install.setup_client_portal`.
"""

from erpnext_taskview.install import setup_client_portal


def execute():
	setup_client_portal()
