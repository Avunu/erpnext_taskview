# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

app_name = "erpnext_taskview"
app_title = "ERPNext TaskView"
app_publisher = "Avunu LLC"
app_description = "Project and Task workspace for ERPNext"
app_email = "mail@avu.nu"
app_license = "mit"
app_include_js = ["taskview.bundle.js", "timerdock.bundle.js"]
app_include_css = ["taskview.bundle.css", "timerdock.bundle.css"]
extend_doctype_class = {
	"Task": "erpnext_taskview.erpnext_taskview.custom.task.TaskviewTask",
	"Timesheet": "erpnext_taskview.erpnext_taskview.custom.timesheet.TaskviewTimesheet",
	"Timesheet Detail": "erpnext_taskview.erpnext_taskview.custom.timesheet_detail.TimesheetDetail",
}

after_install = "erpnext_taskview.install.ensure_notification_type"
after_migrate = "erpnext_taskview.install.ensure_notification_type"

# Customer project portal — a frappe-ui SPA served by www/projects.py
website_route_rules = [
	{"from_route": "/projects/<path:app_path>", "to_route": "projects"},
]
portal_menu_items = [
	{"title": "Projects", "route": "/projects", "reference_doctype": "Project", "role": "Customer"},
]
# ERPNext's plain project list is superseded by the portal; keep old links working.
website_redirects = [
	{"source": "/project", "target": "/projects", "redirect_http_status": 302},
]
