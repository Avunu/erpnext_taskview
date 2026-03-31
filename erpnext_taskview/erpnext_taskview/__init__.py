import datetime
import frappe
import json
from frappe.desk.reportview import get_form_params
from pathlib import Path
from jsonpath_ng import parse


@frappe.whitelist()
@frappe.read_only()
def get():
	args = get_form_params()
	
	where_clause = ""

	if args.filters:
		conditions = []
		query_builder = frappe.model.db_query.DatabaseQuery(args.doctype)
		for filter in args.filters:
			conditions.append(query_builder.prepare_filter_condition(filter))
		if conditions:
			where_clause = "AND " + " AND ".join(conditions)

	query = (Path(__file__).parent / "get.sql").read_text()
	
	query = query % {
		"task_filters": where_clause if args.doctype == 'Task' else '',
		"project_filters": where_clause if args.doctype == 'Project' else '',
		"order_by": args.order_by or f'`tab{args.doctype}`.creation DESC'
	}

	data = frappe.db.sql(query)
	root = merge_tree(data)
	data_tree = get_timesheet_details(root) 
	return data_tree


def merge_tree(rows):
	# Initialize with a root array since we have multiple top-level projects
	root = []
	
	for row in rows:
		data = json.loads(row[0])
		
		# magic black box
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
def update_timesheet_detail(project_name, task_name, status, timesheet_detail, description = ''):

	if timesheet_detail:
		timesheet_detail = json.loads(timesheet_detail)
	
	# get the timesheet detail for the current user, project, task, and timesheet
	timesheet_detail_doc = get_timesheet_detail(project_name, task_name, timesheet_detail.get('name') if timesheet_detail else None, description)

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

		# set the description
		timesheet_detail_doc.description = description

	timesheet_detail_doc.save(ignore_permissions=True)
	frappe.db.commit()

	return timesheet_detail_doc.as_dict()


def get_timesheet_detail(project_name, task_name, timesheet_detail_name, description = ''):
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
					'description': description,
				})
				timesheet.insert(ignore_permissions=True)
			# otherwise get the timesheet and add a timesheet detail for the current task
			else:
				timesheet = frappe.get_doc('Timesheet', timesheet_exists)
				timesheet.append('time_logs', {
					'project': project_name,
					'task': task_name,
					'description': description,
				})
				timesheet.save(ignore_permissions=True)
			frappe.db.commit()
			timesheet_detail_doc = frappe.get_doc('Timesheet Detail', timesheet.time_logs[-1].name)
	return timesheet_detail_doc


@frappe.whitelist()
def backend_handler(action, node, update_object):

	try:

		node = json.loads(node) if node else None
		update_object = json.loads(update_object) if update_object else None
  
		# if node.get('isProject'):
		# 	update_object = node_to_project(node)
		# else:
		# 	update_object = node_to_task(node)

		if action == 'status_change' or action == 'title_change' or action == 'update_parent':
			handle_update(node, update_object)
		elif action == 'insert':
			handle_insert(node, update_object)
		elif action == 'toggle_timer':
			return handle_toggle_timer(node)
		elif action == 'log_time':
			return handle_log_time(node)
		elif action == 'get':
			return get()
		
	except Exception as e:
		frappe.log_error('Error in task view backend handler', f'{e}\n{frappe.get_traceback()}')
		frappe.msgprint(e, indicator='red')

	frappe.db.commit()

	return get()


def handle_insert(node, update_object):
	# if the parent is a task, set is_group to 1
	if not node.get('parent').get('isProject'):
		frappe.db.set_value('Task', node.get('parent').get('docName'), {'is_group': 1})
		frappe.db.commit()

	# // insert the new task or project
	frappe.get_doc(update_object).insert()


# - status change from Open to Completed or vice versa
# TODO: DETERMINE WHAT HAPPENS IF THERE ARE INCOMPLETE CHILDREN OR RUNNING TIMERS
# TODO: update completed_by, completed_on as well?
# // TODO: DON'T ALLOW PROJECTS OR TASKS TO CLOSE IF THEY OR THEIR CHILDREN HAVE RUNNING OR PAUSED TIMERS
# // OR
# // STOP ALL TIMERS WHEN A PROJECT OR TASK IS CLOSED

# // TODO: mark child tasks as completed when a parent task is completed, otherwise frappe can't handle it

# // TASKS CAN'T BE COMPLETED IF THEY HAVE TIMERS RUNNING OR PAUSED OR IF THEY HAVE CHILDREN THAT AREN'T COMPLETED

# // DO WE WANT TO THROW AN ERROR, OR AUTOMATICALLY STOP THE TIMER AND MARK THE CHILDREN AS COMPLETED? THROW AN ERROR FOR NOW
def handle_update(node, update_object):

	#  make sure the parent task has is_group = 1
	if update_object.get('parent_task') and not node.get('parent').get('isProject'):
		if len([child for child in node.get('parent').get('children') if not child.get('isBlank')]) == 1:
			# update the parent task to be a group task so it can have children in a moment
			frappe.db.set_value('Task', node.get('parent').get('docName'), {'is_group': 1})

	# update the children to have the same project as the parent. don't bother if the node project isn't changing
	if update_object.get('project'):
		if node.get('children'):
			def update_children(children):
				for child in children:
					if not child.get('isBlank'):
						frappe.db.set_value('Task', child.get('docName'), {'project': node.get('project')})
						if child.get('children'):
							update_children(child.get('children'))
			update_children(node.get('children'))


	# CURRENTLY THIS IS NOT UPDATING DEPENDS ON LISTS WHEN THE PARENT TASK IS CHANGED
	frappe.db.set_value('Project' if node.get('isProject') else 'Task', node.get('docName'), update_object)


def handle_toggle_timer(node):
	return update_timesheet_detail(node.get('project'), node.get('docName'), node.get('status'), node.get('timesheet_detail'), node.get('description') or '')


def handle_log_time(node):

	timesheet_detail_doc = get_timesheet_detail(node.get('project'), node.get('docName'), None, node.get('description'))

	timesheet_detail_doc.from_time = frappe.utils.data.get_datetime(node.get('startTime'))
	timesheet_detail_doc.to_time = frappe.utils.data.get_datetime(node.get('stopTime'))

	hours = (timesheet_detail_doc.to_time - timesheet_detail_doc.from_time).total_seconds() / 3600
	timesheet_detail_doc.hours = hours

	timesheet_detail_doc.save(ignore_permissions=True)
	frappe.db.commit()
	return 'success'


def node_to_doc(node):
	useful_object = {}
	project_node_fields = {
		"docName": "PROJ-0005",
		"text": "PROJ-0005: New Project",
		"parent": None,
		"project": "PROJ-0005",
		"status": "Open",
		"isProject": True,
		"isBlank": False,
		"timerStatus": None,
		"timesheetDetail": None,
		"expanded": False,
		"autoFocus": False,
		"children": []
	}
	if node.get('isProject'):
		useful_object.doctype = 'Project'
		useful_object.project_name = node.get('text').split(':')[1].strip()
		if node.get('docName'):
			useful_object.name = node.get('docName')
		useful_object.status = node.get('status')
	
		task_node_fields = {
		"docName": "TASK-2024-00026",
		"text": "New Taz",
		"parent": "PROJ-0004",
		"project": "PROJ-0004",
		"status": "Open",
		"isProject": False,
		"isBlank": 0,
		"timerStatus": "stopped",
		"timesheetDetail": None,
		"expanded": False,
		"autoFocus": False,
		"children": []
	}
	else:
		useful_object.doctype = 'Task'
		useful_object.subject = node.get('text')
		useful_object.project = node.get('project')
		useful_object.status = node.get('status')
		if node.get('project') != node.get('parent'):
			useful_object.parent_task = node.get('parent')
		if node.get('children').length == 0:
			useful_object.is_group = 0
		else:
			useful_object.is_group = 1
		useful_object.timer_status = node.get('timerStatus')
		useful_object.timesheet_detail = node.get('timesheetDetail')
		useful_object.children = node.get('children')

	return useful_object
	
project_fields = {
	'name': 'PROJ-0001',
	'owner': 'Administrator',
	'creation': datetime.datetime(2024, 8, 14, 9, 55, 31, 656561),
	'modified': datetime.datetime(2024, 12, 13, 13, 13, 21, 940383),
	'modified_by': 'Administrator',
	'docstatus': 0,
	'idx': 150,
	'naming_series': 'PROJ-.####',
	'project_name': 'Test',
	'status': 'Open',
	'project_type': None,
	'is_active': 'Yes',
	'percent_complete_method': 'Task Completion',
	'percent_complete': 12.5,
	'project_template': None,
	'expected_start_date': None,
	'expected_end_date': None,
	'priority': 'Medium',
	'department': None,
	'customer': None,
	'sales_order': None,
	'copied_from': None,
	'notes': None,
	'actual_start_date': None,
	'actual_time': 0.0,
	'actual_end_date': None,
	'estimated_costing': 0.0,
	'total_costing_amount': 0.0,
	'total_purchase_cost': 0.0,
	'company': 'Avunu',
	'total_sales_amount': 0.0,
	'total_billable_amount': 0.0,
	'total_billed_amount': 0.0,
	'total_consumed_material_cost': 0.0,
	'cost_center': None,
	'gross_margin': 0.0,
	'per_gross_margin': 0.0,
	'collect_progress': 0,
	'holiday_list': None,
	'frequency': 'Hourly',
	'from_time': datetime.timedelta(seconds=35731, microseconds=652058),
	'to_time': datetime.timedelta(seconds=35731, microseconds=652158),
	'first_email': datetime.timedelta(seconds=35731, microseconds=652176),
	'second_email': datetime.timedelta(seconds=35731, microseconds=652191),
	'daily_time_to_send': datetime.timedelta(seconds=35731, microseconds=652204),
	'day_to_send': 'Monday',
	'weekly_time_to_send': datetime.timedelta(seconds=35731, microseconds=652218),
	'message': None,
	'doctype': 'Project',
	'users': []
}

task_fields = {
	'name': 'TASK-2024-00036',
	'owner': 'Administrator',
	'creation': datetime.datetime(2024, 12, 19, 13, 11, 53, 741836),
	'modified': datetime.datetime(2024, 12, 19, 13, 11, 53, 741836),
	'modified_by': 'Administrator',
	'docstatus': 0,
	'idx': 0,
	'subject': 'Test',
	'project': 'PROJ-0029',
	'issue': None,
	'type': None,
	'color': None,
	'is_group': 0,
	'is_template': 0,
	'status': 'Open',
	'priority': 'Medium',
	'task_weight': 0.0,
	'parent_task': None,
	'completed_by': None,
	'completed_on': None,
	'exp_start_date': None,
	'expected_time': 0.0,
	'start': 0,
	'exp_end_date': None,
	'progress': 0.0,
	'duration': 0,
	'is_milestone': 0,
	'description': None,
	'depends_on_tasks': '',
	'act_start_date': None,
	'actual_time': 0.0,
	'act_end_date': None,
	'total_costing_amount': 0.0,
	'total_billing_amount': 0.0,
	'review_date': None,
	'closing_date': None,
	'department': None,
	'company': 'Avunu',
	'lft': 71,
	'rgt': 72,
	'old_parent': '',
	'template_task': None,
	'doctype': 'Task',
	'depends_on': []
 }
