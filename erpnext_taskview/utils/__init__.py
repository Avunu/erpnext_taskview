# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

from typing import NoReturn

import frappe


def throw(message: str, exc: type[Exception] = frappe.ValidationError) -> NoReturn:
	"""``frappe.throw``, typed as never returning.

	``frappe.throw`` always raises, but frappe annotates it ``-> None``, so a
	type checker can't narrow on it.  Use this where the code after the check
	relies on the condition it rules out.
	"""
	frappe.throw(message, exc)
	raise exc(message)  # not reached: frappe.throw has raised already
