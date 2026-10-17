# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""The query-builder SQL functions other apps import (avunu's Timesheet Review report)."""

import frappe
from frappe.query_builder import DocType
from frappe.tests import IntegrationTestCase

from erpnext_taskview.utils.json_functions import (
	GROUP_CONCAT,
	IFNULL,
	JSON_ARRAYAGG,
	JSON_OBJECT,
	JSON_OBJECTAGG,
	NESTED_SET_DEPTH,
)

Task = DocType("Task")


def sql(term) -> str:
	return term.get_sql(quote_char="`")


class TestJsonFunctions(IntegrationTestCase):
	def test_plain_functions_keep_every_argument(self):
		self.assertEqual(
			sql(JSON_OBJECT("name", Task.name, "subject", Task.subject)),
			"JSON_OBJECT('name',`name`,'subject',`subject`)",
		)
		self.assertEqual(sql(IFNULL(Task.subject, "")), "IFNULL(`subject`,'')")

	def test_json_arrayagg(self):
		self.assertEqual(sql(JSON_ARRAYAGG(Task.name)), "JSON_ARRAYAGG(`name`)")
		self.assertEqual(
			sql(JSON_ARRAYAGG(Task.name, distinct=True, orderby=[Task.name + 0, Task.name])),
			"JSON_ARRAYAGG(DISTINCT `name` ORDER BY `name`+0, `name`)",
		)
		self.assertEqual(
			sql(JSON_ARRAYAGG(Task.name, orderby=Task.name)), "JSON_ARRAYAGG(`name` ORDER BY `name`)"
		)
		self.assertEqual(sql(JSON_ARRAYAGG("x")), "JSON_ARRAYAGG('x')")

	def test_json_objectagg_and_group_concat(self):
		self.assertEqual(sql(JSON_OBJECTAGG(Task.name, Task.subject)), "JSON_OBJECTAGG(`name`,`subject`)")
		self.assertEqual(sql(GROUP_CONCAT(Task.name)), "GROUP_CONCAT(`name`)")
		self.assertEqual(sql(GROUP_CONCAT(Task.name, distinct=True)), "GROUP_CONCAT(`name`)")

	def test_nested_set_depth(self):
		self.assertEqual(
			NESTED_SET_DEPTH("Task", "t").get_sql(),
			"(SELECT COUNT(*) FROM `tabTask` a WHERE a.lft < `t`.lft AND a.rgt > `t`.rgt)",
		)
		depth = NESTED_SET_DEPTH("Task", "t", root_lft=1, root_rgt=9)
		depth.alias = "depth"
		self.assertEqual(
			depth.get_sql(with_alias=True),
			"(SELECT COUNT(*) FROM `tabTask` a WHERE a.lft < `t`.lft AND a.rgt > `t`.rgt"
			" AND a.lft >= 1 AND a.rgt <= 9) `depth`",
		)

	def test_runs_on_the_database(self):
		rows = (
			frappe.qb.from_(Task)
			.select(
				JSON_ARRAYAGG(JSON_OBJECT("name", Task.name), distinct=True, orderby=Task.name).as_("tasks")
			)
			.where(Task.name == "no such task")
		).run(as_dict=True)
		self.assertIsNone(rows[0].tasks)
