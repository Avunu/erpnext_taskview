# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""Response shapes of the customer portal API (:mod:`erpnext_taskview.portal.api`).

Mirrored by hand in ``portal/src/types.ts``; change both together.
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from erpnext_taskview.erpnext_taskview.models import Budget

BoardColumn = Literal["Open", "Working", "Pending Review", "Completed"]
"""Kanban columns, in order.  Overdue tasks are placed in Open or Working."""

BOARD_COLUMNS: tuple[BoardColumn, ...] = ("Open", "Working", "Pending Review", "Completed")

ActivityKind = Literal["created", "comment", "status", "time", "attachment"]


class _Model(BaseModel):
	@field_validator("*", mode="before")
	@classmethod
	def _isoformat(cls, v: object) -> object:
		if isinstance(v, datetime | date):
			return v.isoformat()
		return v


class PortalProject(_Model):
	name: str
	title: str
	status: str
	customer: str | None = None
	expected_end_date: str | None = None
	percent_complete: float = 0
	modified: str | None = None
	budget: Budget = Field(default_factory=Budget)
	counts: dict[str, int] = Field(default_factory=dict)
	"""Leaf-task counts per board column."""


class PortalPhase(_Model):
	"""A root-level group task — how a phased project is broken down."""

	name: str
	subject: str
	status: str
	budget: Budget = Field(default_factory=Budget)
	task_count: int = 0
	completed_count: int = 0


class PortalTaskCard(_Model):
	name: str
	subject: str
	status: str
	column: BoardColumn
	priority: str | None = None
	parent_task: str | None = None
	parent_subject: str | None = None
	phase: str | None = None
	phase_subject: str | None = None
	is_group: bool = False
	is_overdue: bool = False
	exp_end_date: str | None = None
	budget: Budget = Field(default_factory=Budget)
	assignees: list[str] = Field(default_factory=list)
	comment_count: int = 0
	attachment_count: int = 0
	is_mine: bool = False
	creation: str | None = None
	modified: str | None = None


class PortalActivity(_Model):
	kind: ActivityKind
	task: str | None = None
	task_subject: str | None = None
	by: str | None = None
	at: str
	text: str = ""


class PortalProjectDetail(_Model):
	project: PortalProject
	phases: list[PortalPhase] = Field(default_factory=list)
	tasks: list[PortalTaskCard] = Field(default_factory=list)
	activity: list[PortalActivity] = Field(default_factory=list)
	can_create: bool = False


class PortalComment(_Model):
	name: str
	content: str
	by: str
	by_image: str | None = None
	is_mine: bool = False
	is_staff: bool = False
	creation: str


class PortalAttachment(_Model):
	name: str
	file_name: str
	url: str
	file_size: int = 0
	is_image: bool = False
	by: str | None = None
	creation: str | None = None


class PortalTimeLog(_Model):
	name: str
	task: str | None = None
	task_subject: str | None = None
	date: str | None = None
	staff: str | None = None
	hours: float = 0
	description: str = ""
	activity_type: str | None = None
	not_billed: bool = False
	running: bool = False


class PortalTaskDetail(_Model):
	task: PortalTaskCard
	description: str = ""
	ancestors: list[dict[str, str]] = Field(default_factory=list)
	comments: list[PortalComment] = Field(default_factory=list)
	time_logs: list[PortalTimeLog] = Field(default_factory=list)
	attachments: list[PortalAttachment] = Field(default_factory=list)
	total_hours: float = 0
	not_billed_hours: float = 0
	project_title: str = ""
