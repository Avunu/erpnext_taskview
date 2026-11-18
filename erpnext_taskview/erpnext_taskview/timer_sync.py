# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""Tells a user's open desk sessions that their timers changed.

The timer dock and the task tree each hold a copy of the user's open timers
(:func:`~erpnext_taskview.erpnext_taskview.api.get_active_timers`), fetched when a page
loads and after the user's own timer actions.  A change made anywhere else (another tab,
another browser, the phone, or the Timesheet form) would not reach them until a reload.

Every change to a Timesheet or one of its time logs therefore publishes ``TIMERS_EVENT``
to the log's owner, the only person whose timers it can change.  The desk sessions of that
user, wherever they are open, answer by fetching their timers again.  The event carries no
data, so it leaks nothing: each session reads the timers through the whitelisted endpoint,
with its own permission checks.

The time logs of a Timesheet are saved on their own by the timer endpoints (``detail.save()``),
which runs no hook of the parent; and the Timesheet form saves its logs without running any of
their own hooks.  So both doctypes are hooked (``doc_events`` in ``hooks.py``).
"""

from collections.abc import Iterable
from typing import Any

import frappe

# The desk's realtime client listens for this name (``timerSync.ts``).
TIMERS_EVENT = "erpnext_taskview_timers"


def notify_timers_changed(users: Iterable[str | None]) -> None:
	"""Publish :data:`TIMERS_EVENT` to each of the users, once, when the transaction commits.

	It is addressed to named users only: a message with no user or room would go to every
	connected session.
	"""
	for user in dict.fromkeys(user for user in users if user):
		frappe.publish_realtime(TIMERS_EVENT, {}, user=user, after_commit=True)


def timesheet_detail_changed(doc: Any, method: str | None = None) -> None:
	"""Doc event of a Timesheet Detail: saved or deleted on its own, as the timer endpoints do."""
	notify_timers_changed([doc.owner])


def timesheet_changed(doc: Any, method: str | None = None) -> None:
	"""Doc event of a Timesheet: saved, submitted, cancelled or deleted, with its logs as they are.

	The logs a save removed are gone from the document, so the owners of the rows as they were
	loaded count too.
	"""
	owners = [row.owner for row in doc.get("time_logs") or []]
	before = doc.get_doc_before_save()
	if before:
		owners.extend(row.owner for row in before.get("time_logs") or [])
	notify_timers_changed(owners)
