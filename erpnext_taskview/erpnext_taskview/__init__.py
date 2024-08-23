# put modules like submit task here (available at erpnext_taskview.erpnext_taskview level)

import frappe # type: ignore

@frappe.whitelist()
def submit_task():
    pass

@frappe.whitelist()
def get_projects():
    try:
        projects = frappe.get_all('Project', fields=['name', 'project_name', 'status'], filters={'status': 'Open'})
        return projects
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), f'{e}')
        return None
    