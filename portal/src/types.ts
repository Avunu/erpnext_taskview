// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * Response shapes of `erpnext_taskview.portal.api`.
 *
 * Mirrors the Pydantic models in `erpnext_taskview/portal/models.py`; change
 * both together.
 */

export type BudgetSource = "own" | "rollup";

export interface Budget {
  budget_hours: number;
  logged_hours: number;
  source: BudgetSource | null;
}

/** Kanban columns, in order. Overdue tasks are placed in Open or Working. */
export const BOARD_COLUMNS = ["Open", "Working", "Pending Review", "Completed"] as const;
export type BoardColumn = (typeof BOARD_COLUMNS)[number];

export type ActivityKind = "created" | "comment" | "status" | "time" | "attachment";

export interface PortalProject {
  name: string;
  title: string;
  status: string;
  customer: string | null;
  expected_end_date: string | null;
  percent_complete: number;
  modified: string | null;
  budget: Budget;
  /** Leaf-task counts per board column. */
  counts: Partial<Record<BoardColumn, number>>;
}

export interface PortalPhase {
  name: string;
  subject: string;
  status: string;
  budget: Budget;
  task_count: number;
  completed_count: number;
}

export interface PortalTaskCard {
  name: string;
  subject: string;
  status: string;
  column: BoardColumn;
  priority: string | null;
  parent_task: string | null;
  parent_subject: string | null;
  phase: string | null;
  phase_subject: string | null;
  is_group: boolean;
  is_overdue: boolean;
  exp_end_date: string | null;
  budget: Budget;
  assignees: string[];
  comment_count: number;
  attachment_count: number;
  is_mine: boolean;
  creation: string | null;
  modified: string | null;
}

export interface PortalActivity {
  kind: ActivityKind;
  task: string | null;
  task_subject: string | null;
  by: string | null;
  at: string;
  text: string;
}

export interface PortalProjectDetail {
  project: PortalProject;
  phases: PortalPhase[];
  tasks: PortalTaskCard[];
  activity: PortalActivity[];
  can_create: boolean;
}

export interface PortalComment {
  name: string;
  content: string;
  by: string;
  by_image: string | null;
  is_mine: boolean;
  is_staff: boolean;
  creation: string;
}

export interface PortalAttachment {
  name: string;
  file_name: string;
  url: string;
  file_size: number;
  is_image: boolean;
  by: string | null;
  creation: string | null;
}

export interface PortalTimeLog {
  name: string;
  task: string | null;
  task_subject: string | null;
  date: string | null;
  staff: string | null;
  hours: number;
  description: string;
  activity_type: string | null;
  not_billed: boolean;
  running: boolean;
}

export interface PortalTaskDetail {
  task: PortalTaskCard;
  description: string;
  ancestors: { name: string; subject: string }[];
  comments: PortalComment[];
  time_logs: PortalTimeLog[];
  attachments: PortalAttachment[];
  total_hours: number;
  not_billed_hours: number;
  project_title: string;
}

export interface NewTaskArgs {
  project: string;
  subject: string;
  description?: string;
  parent_task?: string | null;
  priority?: string;
}
