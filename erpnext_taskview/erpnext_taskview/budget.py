# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""Hour budgets for Tasks and Projects.

Shared by the desk TaskView (:func:`erpnext_taskview.erpnext_taskview.api.get`)
and the customer portal (:mod:`erpnext_taskview.portal.api`).

Semantics
---------
- **Logged hours are live.**  Every Timesheet Detail on a Draft *or*
  Submitted Timesheet (``docstatus < 2``) counts, plus the elapsed time of
  open timers.  ERPNext's own ``Task.actual_time`` / ``Project.actual_time``
  only count submitted timesheets, and the TaskView timer keeps appending to
  drafts until the week is closed out — so those fields lag by days.
- A task's **budget** is its ``expected_time``.  A task without one rolls up
  the budgets of its children.  Cancelled tasks contribute no budget, but the
  time logged against them still counts.
- A task's **logged** hours include all of its descendants'.
- A project's budget is ``Project.budgeted_hours`` when set, otherwise the sum
  of its root tasks' budgets.  Its logged hours are every row on the project,
  including rows that carry no task.

The rollup walks the ``parent_task`` map rather than ``lft``/``rgt``: the
TaskView re-parents tasks with ``frappe.db.set_value``, which leaves the
nested set stale.
"""

import json
from collections import defaultdict
from collections.abc import Iterable
from dataclasses import dataclass
from typing import cast

import frappe
from frappe.query_builder import DocType, Table
from frappe.query_builder.functions import Sum
from frappe.utils import flt, now_datetime

from .models import Budget, BudgetSet

# ─────────────────────────────────────────────────────────────
#  Loading
# ─────────────────────────────────────────────────────────────


@dataclass
class _TaskRow:
	name: str
	project: str
	parent_task: str | None
	expected_time: float
	status: str


def _load_tasks(projects: list[str]) -> dict[str, _TaskRow]:
	"""All non-template tasks of the given projects, keyed by name."""
	Tasks = cast(Table, DocType("Task"))
	rows = (
		frappe.qb.from_(Tasks)
		.select(Tasks.name, Tasks.project, Tasks.parent_task, Tasks.expected_time, Tasks.status)
		.where(Tasks.project.isin(projects))
		.where(Tasks.is_template == 0)
	).run(as_dict=True)
	return {
		r.name: _TaskRow(
			name=r.name,
			project=r.project,
			parent_task=r.parent_task or None,
			expected_time=flt(r.expected_time),
			status=r.status or "",
		)
		for r in rows
	}


def _load_logged_hours(
	projects: list[str], exclude_open_owner: str | None
) -> tuple[dict[str, float], dict[str, float]]:
	"""Own (non-rolled-up) logged hours per task and total logged hours per project.

	Closed rows contribute their ``hours``.  Open timer rows (``to_time IS
	NULL`` with a ``start_time``) contribute their accumulated paused seconds
	plus the running segment.  Timers owned by ``exclude_open_owner`` are
	skipped so the desk can add the current user's own timers live on the
	client without counting them twice.
	"""
	TD = cast(Table, DocType("Timesheet Detail"))

	by_task: dict[str, float] = defaultdict(float)
	by_project: dict[str, float] = defaultdict(float)

	closed = (
		frappe.qb.from_(TD)
		.select(TD.project, TD.task, Sum(TD.hours).as_("hours"))
		.where(TD.parenttype == "Timesheet")
		.where(TD.docstatus < 2)
		.where(TD.project.isin(projects))
		.where(TD.to_time.isnotnull() | TD.start_time.isnull())
		.groupby(TD.project, TD.task)
	).run(as_dict=True)
	for r in closed:
		by_project[r.project] += flt(r.hours)
		if r.task:
			by_task[r.task] += flt(r.hours)

	open_q = (
		frappe.qb.from_(TD)
		.select(TD.project, TD.task, TD.paused, TD.start_time, TD.paused_time_in_seconds)
		.where(TD.parenttype == "Timesheet")
		.where(TD.docstatus < 2)
		.where(TD.project.isin(projects))
		.where(TD.to_time.isnull())
		.where(TD.start_time.isnotnull())
	)
	if exclude_open_owner:
		# Same ownership test as api.get_active_timers, which feeds the desk's live figures.
		open_q = open_q.where(TD.owner != exclude_open_owner)

	now = now_datetime()
	for r in open_q.run(as_dict=True):
		seconds = flt(r.paused_time_in_seconds)
		if not r.paused and r.start_time:
			seconds += max(0.0, (now - r.start_time).total_seconds())
		hours = seconds / 3600
		by_project[r.project] += hours
		if r.task:
			by_task[r.task] += hours

	return by_task, by_project


def _load_project_budgets(projects: list[str]) -> dict[str, float]:
	Projects = cast(Table, DocType("Project"))
	rows = (
		frappe.qb.from_(Projects)
		.select(Projects.name, Projects.budgeted_hours)
		.where(Projects.name.isin(projects))
	).run(as_dict=True)
	return {r.name: flt(r.budgeted_hours) for r in rows}


# ─────────────────────────────────────────────────────────────
#  Rollup
# ─────────────────────────────────────────────────────────────


def _post_order(tasks: dict[str, _TaskRow], children: dict[str, list[str]], roots: list[str]) -> list[str]:
	"""Children-before-parents ordering of every task, safe against parent cycles.

	Tasks unreachable from ``roots`` (only possible inside a ``parent_task``
	cycle) are appended as extra roots so every task is visited exactly once.
	"""
	order: list[str] = []
	visited: set[str] = set()
	for start in [*roots, *tasks]:
		if start in visited:
			continue
		stack: list[tuple[str, bool]] = [(start, False)]
		while stack:
			name, expanded = stack.pop()
			if expanded:
				order.append(name)
				continue
			if name in visited:
				continue
			visited.add(name)
			stack.append((name, True))
			stack.extend((child, False) for child in children.get(name, ()) if child not in visited)
	return order


def compute_budgets(projects: Iterable[str], *, exclude_open_owner: str | None = None) -> BudgetSet:
	"""Budget and logged hours for the given projects and all of their tasks.

	Three queries regardless of project count: tasks, closed time rows
	(aggregated), and open timers.  The rollup itself runs in Python.

	Args:
		projects: Project names.  Duplicates and blanks are ignored.
		exclude_open_owner: Skip open timers on timesheets owned by this user
			(the desk adds them live).  ``None`` counts every open timer.

	Returns:
		A :class:`BudgetSet` with an entry for every requested project and
		every non-template task belonging to them.
	"""
	project_names = list(dict.fromkeys(p for p in projects if p))
	if not project_names:
		return BudgetSet()

	tasks = _load_tasks(project_names)
	own_hours, project_hours = _load_logged_hours(project_names, exclude_open_owner)
	project_budgets = _load_project_budgets(project_names)

	# Only link children to parents in the same project; a cross-project child
	# is treated as a root of its own project so nothing is counted twice.
	children: dict[str, list[str]] = defaultdict(list)
	roots_by_project: dict[str, list[str]] = defaultdict(list)
	for t in tasks.values():
		parent = tasks.get(t.parent_task) if t.parent_task else None
		if parent and parent.project == t.project and parent.name != t.name:
			children[parent.name].append(t.name)
		else:
			roots_by_project[t.project].append(t.name)

	result = BudgetSet()
	roots = [name for names in roots_by_project.values() for name in names]
	for name in _post_order(tasks, children, roots):
		t = tasks[name]
		kids = [result.tasks[c] for c in children.get(name, ()) if c in result.tasks]
		logged = own_hours.get(name, 0.0) + sum(k.logged_hours for k in kids)
		if t.status == "Cancelled":
			budget, source = 0.0, None
		elif t.expected_time > 0:
			budget, source = t.expected_time, "own"
		else:
			budget = sum(k.budget_hours for k in kids)
			source = "rollup" if budget > 0 else None
		result.tasks[name] = Budget(budget_hours=budget, logged_hours=logged, source=source)

	for project in project_names:
		explicit = project_budgets.get(project, 0.0)
		if explicit > 0:
			budget, source = explicit, "own"
		else:
			budget = sum(result.tasks[r].budget_hours for r in roots_by_project.get(project, ()))
			source = "rollup" if budget > 0 else None
		result.projects[project] = Budget(
			budget_hours=budget, logged_hours=project_hours.get(project, 0.0), source=source
		)

	for b in (*result.tasks.values(), *result.projects.values()):
		b.budget_hours = round(b.budget_hours, 2)
		b.logged_hours = round(b.logged_hours, 2)
	return result


# ─────────────────────────────────────────────────────────────
#  Desk endpoint
# ─────────────────────────────────────────────────────────────


@frappe.whitelist()
@frappe.read_only()
def get_budget_summary(projects: str | list[str]) -> dict:
	"""Budgets for the projects the current user can read.

	Used by the desk TaskView to patch its meters after a timer is stopped
	from the dock without rebuilding the whole tree.  The current user's own
	open timers are excluded — the desk adds them live.
	"""
	if isinstance(projects, str):
		projects = json.loads(projects)
	readable = [p for p in projects if frappe.has_permission("Project", "read", p)]
	return compute_budgets(readable, exclude_open_owner=frappe.session.user).model_dump()
