# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

from erpnext.projects.doctype.timesheet_detail.timesheet_detail import TimesheetDetail as BaseTimesheetDetail
from frappe.types import DF


class TimesheetDetail(BaseTimesheetDetail):
	"""TimesheetDetail override for type annotations"""

	paused: DF.Check
	start_time: DF.Datetime | None
	paused_time_in_seconds: DF.Int | None
	task_subject: DF.Data | None
