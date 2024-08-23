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

@frappe.whitelist()
def update_edit(node):
    # if docname is nonetype, it means the doc is new. if the new doc is a task, use the project value to assign a project
    # for creating new tasks, we need subject, project, is_group, and parent_task
    # for creating new projects, we need project_name
    try:
        # doc = frappe.get_doc({
        #     'doctype': 'Task',
        #     'title': 'New Task'
        # })
        doc = frappe.get_doc({

        })
        return True
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), f'{e}')
        return False