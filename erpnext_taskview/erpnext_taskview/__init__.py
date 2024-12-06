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
	data_tree = merge_tree(data)
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


@frappe.whitelist()
def submit_task():
	pass


# nothing is using this right now
@frappe.whitelist()
def update_edit(node):

	# DON'T DO THIS. JUST USE DB.INSERT AND DB.UPDATE FROM THE FRONT END. RENDER THE TREE BASED ON THE RESPONSE. SOMETHING LIKE
#     frappe.db.insert({
#     doctype: 'Purchase Order',
#     supplier: 'Intel',
#     items: [
#         {
#             'item_code': 'XXX141- C - WF',
#             'item_name': 'XXX141 - C - WF',
#             'schedule_date': '2019 - 03 - 30',
#             'description': 'Wafer Test',
#             'qty': 12,
#             'stock_uom': 'EA',
#             'uom': 'EA',
#             'conversion_factor': 1,
#             'base_rate': 12,
#             'base_amount': 12,
#         },
#     ]
# }).then(function(doc) { 
#     console.log(${doc.doctype} ${doc.name} created on ${doc.creation});
# });

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