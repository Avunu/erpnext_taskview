"""Pydantic models for the ERPNext Task View API.

This module is the **single source of truth** for the request/response
contracts shared between the Python backend and the TypeScript frontend.
The TypeScript interfaces in ``script.ts`` mirror these models exactly.

Run ``generate-types`` (devenv script) to regenerate the corresponding
TypeScript interfaces whenever models change.

Design principles
-----------------
- **Flat data only**: the backend returns flat lists of docs; the frontend
  assembles the tree and derives all UI state.
- **Discriminated union**: ``FrappeDoc`` uses Pydantic's ``discriminator``
  on the ``doctype`` field so ``save_doc`` can accept any of the three
  doc shapes in one payload.
- **No frappe imports**: this module must stay importable in a plain Python
  environment so code-generation tooling can consume it directly.
"""

from __future__ import annotations

import json
from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, Field, field_validator

# ---------------------------------------------------------------------------
# Doctype field models — the only shapes crossing the API boundary
# ---------------------------------------------------------------------------


class ProjectDoc(BaseModel):
	"""Subset of Frappe *Project* fields returned by ``get()`` and accepted by ``save_doc()``.

	Attributes:
		doctype: Discriminator literal; always ``"Project"``.
		name: Frappe document name (primary key).  Empty string for new docs.
		project_name: Human-readable project title.
		status: Workflow status — typically ``"Open"`` or ``"Completed"``.
	"""

	doctype: Literal["Project"] = "Project"
	name: str = ""
	project_name: str = ""
	status: str = "Open"
	customer: str | None = ""


class TaskDoc(BaseModel):
	"""Subset of Frappe *Task* fields.

	Tasks form a nested-set tree (``lft``/``rgt``).  The tree hierarchy is
	represented via ``parent_task`` (immediate parent) and ``project``
	(root project).  ``is_group`` marks nodes that may have children.

	Attributes:
		doctype: Discriminator literal; always ``"Task"``.
		name: Frappe document name.  Empty string for new tasks.
		subject: Task title displayed in the tree row.
		project: Name of the parent Project doc.
		parent_task: Name of the parent Task, or ``None`` if at project root.
		status: Workflow status (``"Open"``, ``"Completed"``, etc.).
		is_group: ``1`` if this task contains children, ``0`` otherwise.
		priority: ERPNext priority level (``"Low"``, ``"Medium"``, ``"High"``, ``"Urgent"``).
	"""

	doctype: Literal["Task"] = "Task"
	name: str = ""
	subject: str = ""
	project: str = ""
	parent_task: str | None = None
	status: str = "Open"
	is_group: int = 0
	priority: str = "Medium"
	idx: int | None = None
	assigned_to: list[str] = Field(default_factory=list, alias="_assign")
	todo_name: str | None = None
	pin_idx: int | None = None

	model_config = {"populate_by_name": True}

	@field_validator("assigned_to", mode="before")
	@classmethod
	def parse_assign(cls, v: str | list | None) -> list[str]:
		if not v:
			return []
		if isinstance(v, str):
			return json.loads(v)
		return v


class TimesheetDetailDoc(BaseModel):
	"""Timesheet Detail row — carries all timer state for a single task.

	The frontend never mutates these fields directly; instead it sends a
	partial copy to ``save_doc()`` and the backend derives the appropriate
	timer operation from the field values:

	- **Start**: no ``name``, no ``from_time``/``to_time``.
	- **Manual log**: no ``name``, both ``from_time`` and ``to_time`` set.
	- **Pause**: has ``name``, ``paused == 1``.
	- **Resume**: has ``name``, ``paused == 0``.
	- **Stop**: has ``name``, ``to_time`` set.

	Attributes:
		doctype: Discriminator literal; always ``"Timesheet Detail"``.
		name: Frappe row name, or ``None`` for new entries.
		parent: Name of the parent Timesheet document.
		project: Associated project name.
		task: Associated task name.
		from_time: Timer / time-log start (set on first start).
		to_time: Timer / time-log end (set on stop or manual log).
		hours: Computed elapsed hours (``to_time - from_time``).
		paused: ``1`` if the timer is currently paused, ``0`` otherwise.
		start_time: Wall-clock time when the current (un-paused) segment began.
		paused_time_in_seconds: Cumulative seconds spent in paused state.
		description: Free-text work description entered on stop.
	"""

	doctype: Literal["Timesheet Detail"] = "Timesheet Detail"
	name: str | None = None
	parent: str | None = None
	project: str = ""
	task: str = ""
	from_time: datetime | None = None
	to_time: datetime | None = None
	hours: float = 0
	paused: int = 0
	start_time: datetime | None = None
	paused_time_in_seconds: int = 0
	description: str = ""
	activity_type: str = ""
	is_billable: int = 0
	completed: int = 0
	delete: int = 0
	update_description: int = 0


FrappeDoc = Annotated[
	ProjectDoc | TaskDoc | TimesheetDetailDoc,
	Field(discriminator="doctype"),
]
"""Discriminated union of the three doc types.

Pydantic inspects the ``doctype`` field to determine which model to
instantiate when deserialising ``save_doc`` payloads.
"""


# ---------------------------------------------------------------------------
# API response model
# ---------------------------------------------------------------------------


class GetResponse(BaseModel):
	"""Shape returned by the ``get`` endpoint.

	Contains two flat lists — projects and tasks.  Timer state is served
	separately by ``get_active_timers`` and managed by the global timer
	store on the frontend.

	Attributes:
		projects: All projects matching the current filters.
		tasks: All tasks belonging to the returned projects, ordered by
			nested-set ``lft``.  Tasks pinned by the current user carry
			``todo_name`` and ``pin_idx`` from the joined ToDo row.
	"""

	projects: list[ProjectDoc]
	tasks: list[TaskDoc]


# ---------------------------------------------------------------------------
# Active-timers response — enriched timesheet details for the global dock
# ---------------------------------------------------------------------------


class ActiveTimerDoc(BaseModel):
	"""Enriched timesheet detail for the global timer dock.

	Extends the core timer fields with human-readable labels so the dock
	can render task/project names without additional lookups.

	Attributes:
		name: Frappe row name of the Timesheet Detail.
		parent: Parent Timesheet document name.
		project: Project document name.
		task: Task document name.
		task_subject: Human-readable task title for display.
		project_name: Human-readable project title for display.
		from_time: Timer start time.
		to_time: Timer end time (always ``None`` for active timers).
		hours: Elapsed hours so far.
		paused: ``1`` if paused, ``0`` if running.
		start_time: Wall-clock start of the current un-paused segment.
		paused_time_in_seconds: Cumulative paused seconds.
		description: Work description.
	"""

	name: str
	parent: str
	project: str
	task: str
	task_subject: str = ""
	project_name: str = ""
	customer: str | None = None
	from_time: datetime | None = None
	to_time: datetime | None = None
	hours: float = 0
	paused: int = 0
	start_time: datetime | None = None
	paused_time_in_seconds: int = 0
	description: str = ""


class ActiveTimersResponse(BaseModel):
	"""Response from ``get_active_timers``.

	Attributes:
		timers: All open timers for the current user, enriched with
			task/project display names.
	"""

	timers: list[ActiveTimerDoc]


class SaveDocResponse(GetResponse):
	"""Response from ``save_doc`` augmented with optional status messages.

	Attributes:
		alert: Short success message to display via ``frappe.show_alert``. ``None`` for
			non-logging mutations (pause, resume, etc.).
		notice: Informational message to display via ``frappe.msgprint``,
			e.g. when a task cannot be completed due to open subtasks.
	"""

	alert: str | None = None
	notice: str | None = None


# ---------------------------------------------------------------------------
# save_doc request — carries optional children for reparenting
# ---------------------------------------------------------------------------


class SaveDocRequest(BaseModel):
	"""Payload for ``save_doc``: a doc + optional children for drag reparenting.

	When a task is dragged to a new parent/project in the tree, the frontend
	sends the dragged task as ``doc`` together with a flat ``children`` list
	containing all descendant tasks so the backend can update their ``project``
	field in bulk.

	Attributes:
		doc: The document to insert or update (Project, Task, or Timesheet Detail).
		children: Descendant tasks whose ``project`` field should be updated
			when the parent task is reparented.  ``None`` for non-drag operations.
	"""

	doc: FrappeDoc
	children: list[TaskDoc] | None = None
