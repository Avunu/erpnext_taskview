app_name = "erpnext_taskview"
app_title = "ERPNext TaskView"
app_publisher = "Avunu LLC"
app_description = "Project and Task workspace for ERPNext"
app_email = "mail@avu.nu"
app_license = "mit"
app_include_js = ["taskview.bundle.js", "timerdock.bundle.js"]
app_include_css = "timerdock.bundle.css"
extend_doctype_class = {
	"Timesheet Detail": "erpnext_taskview.erpnext_taskview.custom.timesheet_detail.TimesheetDetail",
}
