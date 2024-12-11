import datetime
import frappe
import json
from frappe.desk.reportview import get_form_params
from pathlib import Path
from jsonpath_ng import parse


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

	# in the initial data query we are setting projects to collapsed and tasks to expanded if they have any children.
    # else:
    #     node["expanded"] = False  # Optional: collapse nodes with no active timers
    
    return has_active_timer


# timesheet docs are project specific, timesheet detail docs are task specific
# the standard timsheet detail has a from_time, to_time, and an hours field. we added custom fields for paused, start_time, and paused_time_in_seconds

# from_time will always be the time the timer was originally started
# to_time will be used at the end to mark the end time based on hours and from_time
# hours will be the total time spent on the task. This will be calculated at the end, based on start_time, the actual timestamp when the timer is stopped, and the paused_time_in_seconds
# paused will be a boolean value that will be used to determine if the timer is paused or not. When paused, current timestamp and start_time will be used to calculate the paused_time_in_seconds, along with the previous paused_time_in_seconds
# start_time will be the timestamp when the timer is started or resumed
# paused_time_in_seconds will be the total time the timer has run previously.
# status coming from the front end will be stopped, running, or paused. 
# stopped: final values will be calculated and the timesheet detail will be saved and submitted.
# running: the timer will be started or resumed
# paused: the timer will be paused
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
					# 'from_time': frappe.utils.now_datetime(),
					# 'start_time': frappe.utils.now_datetime()
				})
				timesheet.insert(ignore_permissions=True)
			# otherwise get the timesheet and add a timesheet detail for the current task
			else:
				timesheet = frappe.get_doc('Timesheet', timesheet_exists)
				timesheet.append('time_logs', {
					'project': project_name,
					'task': task_name,
					# 'from_time': frappe.utils.now_datetime(),
					# 'start_time': frappe.utils.now_datetime()
				})
				timesheet.save(ignore_permissions=True)
			frappe.db.commit()
			timesheet_detail_doc = frappe.get_doc('Timesheet Detail', timesheet.time_logs[-1].name)
	return timesheet_detail_doc


@frappe.whitelist()
def submit_task():
	pass


# nothing is using this right now
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