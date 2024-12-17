import datetime
import frappe
import json
from frappe.desk.reportview import get_form_params # type: ignore
from pathlib import Path
from jsonpath_ng import parse # type: ignore


@frappe.whitelist()
@frappe.read_only()
def get():
	# filters are the only useful arg
	# TODO: add filters to the query (NOT PART OF THE MVP)
	args = get_form_params()
	query = (Path(__file__).parent / "get.sql").read_text()
	# # example of how to inject the filters into the query
	# query = query % {
	#  "filters": args.filters if args.filters else ""
	# }
	data = frappe.db.sql(query)
	root = merge_tree(data)
	data_tree = get_timesheet_details(root)
	return data_tree


def merge_tree(rows):
	# Initialize with a root array since we have multiple top-level projects
	root = []
	
	# magic black box
	for row in rows:
		data = json.loads(row[0])
		path = parse(row[1])
		
		path.update_or_create(root, data)
			
	return root


def get_timesheet_details(root):

	# employee.user_id is a link to the user doc, which shares a name with session.user
	employee_exists = frappe.db.exists('Employee', {'user_id': frappe.session.user})
	if not employee_exists:
		frappe.throw('Employee not found for current user')
	
	# timesheet details owner is the user, not the employee
	# get all the timesheet details where the owner is the user and the to_time is null
	query = """
        SELECT
            `name`,
            `parent`,
            `project`,
            `task`,
            `from_time`,
            `to_time`,
            `hours`,
            `paused`,
            `start_time`,
            `paused_time_in_seconds`
        FROM
            `tabTimesheet Detail`
        WHERE
            `owner` = %s
            AND `to_time` IS NULL
    """
	timesheet_details = frappe.db.sql(query, frappe.session.user, as_dict=True)

	# for each timesheet detail, find the project and task in root and add the timesheet detail to the task, keeping in mind that the task may be nested under several layers of tasks
	for project in root:
		set_timer_status(project, timesheet_details)
	

	return root

def set_timer_status(node, timesheet_details):
    """
    Recursively updates the timerStatus and expansion status for nodes.
    
    Args:
        node (dict): The current node in the tree.
        timesheet_details (list): List of timesheet details to match with tasks.
    
    Returns:
        bool: True if this node or any descendant has a running or paused timer, False otherwise.
    """
    has_active_timer = False  # Tracks if this node or descendants have active timers
    
    # Check if the current node is a task
    if not node["isProject"] and node["docName"]:
        # Match timesheet details to this task
        matching_details = [
            detail for detail in timesheet_details if detail["task"] == node["docName"]
        ]
        if matching_details:
            # Set timerStatus and timesheetDetail based on timesheet detail
            detail = matching_details[0]
            node["timesheetDetail"] = detail
            if detail["paused"]:
                node["timerStatus"] = "paused"
                has_active_timer = True
            else:
                node["timerStatus"] = "running"
                has_active_timer = True
    
    # Recursively process children
    for child in node.get("children", []):
        if set_timer_status(child, timesheet_details):
            has_active_timer = True

    # If this node or any of its children has an active timer, mark this node as expanded
    if has_active_timer:
        node["expanded"] = True
    
    return has_active_timer


@frappe.whitelist()
def update_timesheet_detail(project_name, task_name, status, timesheet_detail):

	if timesheet_detail:
		timesheet_detail = json.loads(timesheet_detail)

	# get the timesheet detail for the current user, project, task, and timesheet
	timesheet_detail_doc = get_timesheet_detail(project_name, task_name, timesheet_detail.get('name'))

	if status == "running":
		# start the timer
		if not timesheet_detail_doc.from_time:
			timesheet_detail_doc.from_time = frappe.utils.now_datetime()
		timesheet_detail_doc.start_time = frappe.utils.now_datetime()
		timesheet_detail_doc.paused = False

	elif status == "paused":
		# pause the timer
		# set the paused time to the current timestamp and calculate the paused time in seconds
		timesheet_detail_doc.paused_time_in_seconds = timesheet_detail_doc.paused_time_in_seconds + (frappe.utils.data.get_datetime() - frappe.utils.data.get_datetime(timesheet_detail_doc.start_time)).total_seconds()
		timesheet_detail_doc.paused = True

	elif status == "stopped":
		# stop the timer
		# Convert from_time and start_time to datetime objects
		from_time = frappe.utils.data.get_datetime(timesheet_detail_doc.from_time)
		start_time = frappe.utils.data.get_datetime(timesheet_detail_doc.start_time)

		# Calculate the total time in seconds based on the start time, current timestamp, and the paused time in seconds
		total_seconds = (frappe.utils.data.get_datetime() - start_time).total_seconds() + timesheet_detail_doc.paused_time_in_seconds

		# Convert the total seconds to hours
		timesheet_detail_doc.hours = total_seconds / 3600

		# Set the to_time to the from_time plus the total seconds
		timesheet_detail_doc.to_time = datetime.datetime.utcfromtimestamp(from_time.timestamp() + total_seconds)

	timesheet_detail_doc.save(ignore_permissions=True)
	frappe.db.commit()

	return timesheet_detail_doc.as_dict()


def get_timesheet_detail(project_name, task_name, timesheet_detail_name):
	if timesheet_detail_name:
		timesheet_detail_doc = frappe.get_doc('Timesheet Detail', timesheet_detail_name)
	else:
		timesheet_detail_doc_exists = frappe.db.exists('Timesheet Detail', {'project': project_name, 'task': task_name, 'to_time': None})
		if timesheet_detail_doc_exists:
			timesheet_detail_doc = frappe.get_doc('Timesheet Detail', timesheet_detail_doc_exists)
		else:
			# see if there is a timesheet for the current user and the current project that is not submitted
			employee_name = frappe.db.get_value('Employee', {'user_id': frappe.session.user}, 'name')
			timesheet_exists = frappe.db.exists('Timesheet', {'employee': employee_name, 'docstatus': 0, 'parent_project': project_name})
			if not timesheet_exists:
				# create a new timesheet and timesheet detail
				timesheet = frappe.get_doc({
					'doctype': 'Timesheet',
					'employee': employee_name,
					'parent_project': project_name,
				})
				timesheet.append('time_logs', {
					'project': project_name,
					'task': task_name,
				})
				timesheet.insert(ignore_permissions=True)
			# otherwise get the timesheet and add a timesheet detail for the current task
			else:
				timesheet = frappe.get_doc('Timesheet', timesheet_exists)
				timesheet.append('time_logs', {
					'project': project_name,
					'task': task_name,
				})
				timesheet.save(ignore_permissions=True)
			frappe.db.commit()
			timesheet_detail_doc = frappe.get_doc('Timesheet Detail', timesheet.time_logs[-1].name)
	return timesheet_detail_doc


@frappe.whitelist()
def backend_handler(action, node, update_object):

	# data = json.loads(data) if data else None
	node = json.loads(node)
	update_object = json.loads(update_object) if update_object else None

	if action == 'status_change':
		handle_status_change(node, update_object)
	elif action == 'title_change':
		handle_title_change(node, update_object)
	elif action == 'insert':
		handle_insert(node, update_object)
	elif action == 'update_parent':
		handle_update_parent(node, update_object)
	elif action == 'toggle_timer':
		handle_toggle_timer(node)
	elif action == 'log_time':
		handle_log_time(node)

	frappe.db.commit()

	return get()


# - status change from Open to Completed or vice versa
def handle_status_change(node):
	# frappe.db.set_value(props.doc.isProject ? 'Project' : 'Task', props.doc.docName, 'status', props.doc.status)
	pass


def handle_title_change(node):
	# // update the task or project in the database
	# if (props.doc.isProject) {
	# 	frappe.db.set_value('Project', props.doc.docName, 'project_name', editedText.value)
	# }
	# else {
	# 	frappe.db.set_value('Task', props.doc.docName, 'subject', editedText.value)

	pass


def handle_insert(node):
	# // MAKE SURE THE PARENT TASK HAS IS_GROUP = 1
	# if the parent is a task, set is_group to 1
	# frappe.db.set_value('Task', props.doc.parent, { is_group: 1 })

	# // insert the new task or project
	# frappe.db.insert(newObject)

	pass


def handle_update_parent(node, update_object):
	if not node.get('parent').get('data').get('isProject'):
		if len([child for child in node.get('parent').get('data').get('children') if not child.get('isBlank')]) == 1:
			# update the parent task to be a group task so it can have children in a moment
			frappe.db.set_value('Task', node.get('parent').get('data').get('docName'), {'is_group': 1})

	if node.get('data').get('children'):
		def update_children(children):
			for child in children:
				child['project'] = node.get('data').get('project')
				if not child.get('isBlank'):
					frappe.db.set_value('Task', child.get('docName'), {'project': node.get('data').get('project')})
					if child.get('children'):
						update_children(child.get('children'))
		update_children(node.get('data').get('children'))

	# // CURRENTLY THIS IS NOT UPDATING DEPENDS ON LISTS
	frappe.db.set_value('Project' if node.get('data').get('isProject') else 'Task', node.get('data').get('docName'), update_object)


def handle_toggle_timer(node):
	# frappe.call({
	# 	method: 'erpnext_taskview.erpnext_taskview.update_timesheet_detail',
	# 	args: {
	# 		project_name: projectName,
	# 		task_name: taskName,
	# 		status: status,
	# 		timesheet_detail: timesheetDetail
	# 	},
	# 	freeze: true
	# })
	pass


def handle_log_time(node):
	pass
