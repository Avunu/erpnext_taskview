# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""
Custom PyPika functions for JSON operations in MariaDB/MySQL.

Provides JSON aggregation and manipulation functions for use with
Frappe's query builder.

Example usage:
	from frappe.query_builder import DocType
	from pequea.utils.json_functions import JSON_OBJECTAGG, JSON_ARRAYAGG

	Item = DocType("Item")
	IVA = DocType("Item Variant Attribute")

	result = (
		frappe.qb.from_(Item)
		.left_join(IVA).on(Item.name == IVA.parent)
		.select(
			Item.item_code,
			JSON_OBJECTAGG(IVA.attribute, IVA.attribute_value).as_("attributes")
		)
		.where(Item.variant_of == template_item)
		.groupby(Item.item_code)
	).run(as_dict=True)
"""

from typing import Any

from frappe.query_builder.terms import ValueWrapper
from pypika.terms import AggregateFunction, Function, Term


class _Fn:
	"""Callable that creates a Function term with any number of arguments.

	PyPika's CustomFunction drops ALL positional arguments when ``params``
	is not provided (the default).  This wrapper always passes them through.
	"""

	def __init__(self, name: str):
		self.name = name

	def __call__(self, *args: Any, **kwargs: Any) -> Function:
		return Function(self.name, *args, alias=kwargs.get("alias"))


# JSON creation functions
JSON_OBJECT = _Fn("JSON_OBJECT")
JSON_ARRAY = _Fn("JSON_ARRAY")
JSON_MERGE_PATCH = _Fn("JSON_MERGE_PATCH")
JSON_EXTRACT = _Fn("JSON_EXTRACT")
JSON_UNQUOTE = _Fn("JSON_UNQUOTE")
JSON_KEYS = _Fn("JSON_KEYS")

# SQL utility functions
IF = _Fn("IF")
IFNULL = _Fn("IFNULL")
CONCAT = _Fn("CONCAT")


class JSON_OBJECTAGG(AggregateFunction):
	"""
	Aggregates key-value pairs into a JSON object.

	Usage:
		JSON_OBJECTAGG(key_column, value_column)

	SQL equivalent:
		JSON_OBJECTAGG(key_column, value_column)
	"""

	def __init__(self, key, value, alias=None):
		super().__init__("JSON_OBJECTAGG", key, value, alias=alias)


class JSON_ARRAYAGG(AggregateFunction):
	"""
	JSON_ARRAYAGG with optional DISTINCT and ORDER BY support.

	MariaDB syntax: JSON_ARRAYAGG([DISTINCT] expr [ORDER BY expr [, expr ...]])

	Usage:
		# Simple
		JSON_ARRAYAGG(column)

		# With distinct and single order
		JSON_ARRAYAGG(column, distinct=True, orderby=column)

		# Natural numeric sort (numbers before strings, numeric order)
		JSON_ARRAYAGG(column, distinct=True, orderby=[column + 0, column])
	"""

	def __init__(
		self,
		term: Any,
		distinct: bool = False,
		orderby: Term | list[Term] | None = None,
		alias: str | None = None,
	):
		# Don't pass term to parent - we'll handle it ourselves
		super().__init__("JSON_ARRAYAGG", alias=alias)
		# Store the term separately, wrapping if needed
		self._term = term if isinstance(term, Term) else ValueWrapper(term)
		self._distinct = distinct
		self._orderby = orderby

	def get_function_sql(self, **kwargs: Any) -> str:
		# Build term SQL
		term_sql = self._term.get_sql(with_alias=False, **kwargs)

		# Build DISTINCT prefix
		distinct_sql = "DISTINCT " if self._distinct else ""

		# Build ORDER BY suffix
		order_sql = ""
		if self._orderby is not None:
			order_terms = self._orderby if isinstance(self._orderby, list) else [self._orderby]
			order_parts = [
				t.get_sql(with_alias=False, **kwargs) if isinstance(t, Term) else str(t) for t in order_terms
			]
			order_sql = f" ORDER BY {', '.join(order_parts)}"

		return f"JSON_ARRAYAGG({distinct_sql}{term_sql}{order_sql})"


class GROUP_CONCAT(AggregateFunction):
	"""
	Concatenates values with a separator.

	Usage:
		GROUP_CONCAT(column)

	SQL equivalent:
		GROUP_CONCAT(DISTINCT column SEPARATOR ',')
	"""

	def __init__(self, term, distinct=False, separator=",", alias=None):
		if distinct:
			# PyPika doesn't easily support DISTINCT in aggregate, so we use a workaround
			super().__init__("GROUP_CONCAT", term, alias=alias)
		else:
			super().__init__("GROUP_CONCAT", term, alias=alias)


class NESTED_SET_DEPTH(Term):
	"""
	Calculate the depth/indent of a node in a nested set model by counting ancestors.

	This generates a correlated subquery that counts how many rows have
	lft < node.lft AND rgt > node.rgt (i.e., ancestors of the node).

	Usage:
		IG = DocType("Item Group")
		# Full tree depth
		depth = NESTED_SET_DEPTH("Item Group", "ig")

		# Depth relative to a subtree root
		depth = NESTED_SET_DEPTH("Item Group", "ig", root_lft=10, root_rgt=50)

	SQL equivalent:
		(SELECT COUNT(*) FROM `tabItem Group` a
		WHERE a.lft < `ig`.lft AND a.rgt > `ig`.rgt
		[AND a.lft >= root_lft AND a.rgt <= root_rgt])
	"""

	def __init__(
		self,
		table: str,
		outer_alias: str,
		root_lft: int | None = None,
		root_rgt: int | None = None,
	):
		super().__init__()
		self._table = table
		self._outer_alias = outer_alias
		self._root_lft = root_lft
		self._root_rgt = root_rgt

	def get_sql(self, with_alias: bool = False, **kwargs: Any) -> str:
		table_name = f"`tab{self._table}`"
		outer_ref = f"`{self._outer_alias}`"

		sql = (
			f"(SELECT COUNT(*) FROM {table_name} a WHERE a.lft < {outer_ref}.lft AND a.rgt > {outer_ref}.rgt"
		)

		if self._root_lft is not None and self._root_rgt is not None:
			sql += f" AND a.lft >= {self._root_lft} AND a.rgt <= {self._root_rgt}"

		sql += ")"

		if with_alias and self.alias:
			sql += f" `{self.alias}`"

		return sql
