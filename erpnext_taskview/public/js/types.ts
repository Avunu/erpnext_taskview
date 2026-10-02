// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * @module types
 *
 * Shared types, helper functions, and backend communication for the
 * ERPNext Task View.
 *
 * This file mirrors the Pydantic models in ``models.py`` — those models are
 * the **single source of truth**; any change there must be reflected here.
 *
 * The backend returns flat lists of docs via {@link GetResponse}.  The
 * frontend assembles the tree ({@link TreeNode}) and each Vue component
 * derives its own UI state through `computed` properties — no pre-computed
 * UI objects cross the API boundary.
 */

// ---------------------------------------------------------------------------
// Doc types — mirrors models.py (single source of truth)
// ---------------------------------------------------------------------------

/** Where a budget comes from: the doc's own field, or its children's sum. */
export type BudgetSource = "own" | "rollup";

/** Hour budget fields merged onto docs by `get()` (see `budget.py`). */
export interface BudgetFields {
  /** Effective budget in hours; 0 when nothing is estimated. */
  budget_hours?: number;
  /** Live logged hours incl. descendants, excluding the user's own open timers. */
  logged_hours?: number;
  budget_source?: BudgetSource | null;
}

export interface ProjectDoc extends BudgetFields {
  doctype: "Project";
  name: string;
  project_name: string;
  status: string;
  idx?: number;
  customer: string;
  creation?: string;
  modified?: string;
}

export interface TaskDoc extends BudgetFields {
  doctype: "Task";
  name: string;
  subject: string;
  project: string;
  project_name?: string | null;
  customer?: string | null;
  parent_task: string | null;
  parent_task_subject?: string | null;
  status: string;
  is_group: number;
  priority: string;
  idx?: number;
  assigned_to: string[];
  todo_name: string | null;
  pin_idx: number | null;
  creation?: string;
  modified?: string;
}

export interface TimesheetDetailDoc {
  doctype: "Timesheet Detail";
  name: string | null;
  parent: string | null;
  project: string;
  task: string;
  from_time: string | null;
  to_time: string | null;
  hours: number;
  paused: number;
  start_time: string | null;
  paused_time_in_seconds: number;
  description: string;
  activity_type?: string;
  is_billable?: number;
  completed?: number;
  billing_hours?: number;
}

export type FrappeDoc = ProjectDoc | TaskDoc | TimesheetDetailDoc;

// ---------------------------------------------------------------------------
// API response
// ---------------------------------------------------------------------------

export interface GetResponse {
  projects: ProjectDoc[];
  tasks: TaskDoc[];
}

export interface SaveDocResponse extends GetResponse {
  alert?: string;
  notice?: string;
}

/** Mirrors `models.Budget`. */
export interface Budget {
  budget_hours: number;
  logged_hours: number;
  source: BudgetSource | null;
}

/** Mirrors `models.BudgetSet` — budgets keyed by doc name. */
export interface BudgetSet {
  projects: Record<string, Budget>;
  tasks: Record<string, Budget>;
}

// ---------------------------------------------------------------------------
// Tree node — minimal wrapper for @he-tree/vue
// ---------------------------------------------------------------------------

export interface TreeNode {
  doc: ProjectDoc | TaskDoc;
  children: TreeNode[];
  _autoFocus?: boolean;
}

// ---------------------------------------------------------------------------
// Pure helpers (was task.ts)
// ---------------------------------------------------------------------------

/** Human-readable display text for a tree node row. */
export function getDisplayText(node: TreeNode): string {
  if (node.doc.doctype === "Project") {
    const doc = node.doc as ProjectDoc;
    return `${doc.name}: ${doc.project_name}`;
  }
  return (node.doc as TaskDoc).subject;
}

/** Project name associated with a tree node. */
export function getProjectName(node: TreeNode): string {
  if (node.doc.doctype === "Project") {
    return node.doc.name;
  }
  return (node.doc as TaskDoc).project;
}

// ---------------------------------------------------------------------------
// Backend communication
// ---------------------------------------------------------------------------

/**
 * Capture the current list-view's form params (doctype, filters, sort, etc.)
 * so mutation endpoints can forward them to `get()` on the backend.
 */
function getFormParams(): string | undefined {
  const list = (window as any).cur_list;
  if (!list) return undefined;
  const params: Record<string, unknown> = {};
  if (list.doctype) params.doctype = list.doctype;
  if (list.filters) params.filters = list.get_filters_for_args?.() ?? list.filters;
  if (list.or_filters) params.or_filters = list.or_filters;
  if (list.sort_selector) {
    params.sort_by = list.sort_selector.sort_by;
    params.sort_order = list.sort_selector.sort_order;
  }
  return JSON.stringify(params);
}

export function saveDoc(
  doc: Partial<FrappeDoc>,
  children?: TaskDoc[],
  siblingOrder?: string[],
  assignToMe?: boolean,
): Promise<SaveDocResponse> {
  const payload: Record<string, unknown> = { doc };
  if (children) payload.children = children;
  if (siblingOrder) payload.sibling_order = siblingOrder;
  if (assignToMe) payload.assign_to_me = true;

  const args: Record<string, string> = { payload: JSON.stringify(payload) };
  const fp = getFormParams();
  if (fp) args.form_params = fp;

  return new Promise((resolve, reject) => {
    frappe.call({
      method: "erpnext_taskview.erpnext_taskview.api.save_doc",
      args,
      callback: (r: { message: SaveDocResponse }) => resolve(r.message),
      error: (err: unknown) => reject(err),
    });
  });
}

/** Fresh budgets for the given projects, without rebuilding the tree. */
export function fetchBudgetSummary(projects: string[]): Promise<BudgetSet> {
  return new Promise((resolve, reject) => {
    frappe.call({
      method: "erpnext_taskview.erpnext_taskview.budget.get_budget_summary",
      args: { projects: JSON.stringify(projects) },
      callback: (r: { message: BudgetSet }) => resolve(r.message),
      error: (err: unknown) => reject(err),
    });
  });
}

export function fetchData(): Promise<GetResponse> {
  return new Promise((resolve, reject) => {
    const callArgs: Record<string, string> = {};
    const fp = getFormParams();
    if (fp) callArgs.args = fp;
    frappe.call({
      method: "erpnext_taskview.erpnext_taskview.api.get",
      args: callArgs,
      callback: (r: { message: GetResponse }) => resolve(r.message),
      error: (err: unknown) => reject(err),
    });
  });
}

export function bulkCreateTasks(
  subjects: string[],
  project: string,
  parentTask?: string | null,
  assignToMe?: boolean,
): Promise<GetResponse> {
  const payload: Record<string, unknown> = { subjects, project };
  if (parentTask) payload.parent_task = parentTask;
  if (assignToMe) payload.assign_to_me = true;

  const args: Record<string, string> = { payload: JSON.stringify(payload) };
  const fp = getFormParams();
  if (fp) args.form_params = fp;

  return new Promise((resolve, reject) => {
    frappe.call({
      method: "erpnext_taskview.erpnext_taskview.api.bulk_create_tasks",
      args,
      callback: (r: { message: GetResponse }) => resolve(r.message),
      error: (err: unknown) => reject(err),
    });
  });
}

export function deleteTask(task: string): Promise<GetResponse> {
  const args: Record<string, string> = { task };
  const fp = getFormParams();
  if (fp) args.form_params = fp;

  return new Promise((resolve, reject) => {
    frappe.call({
      method: "erpnext_taskview.erpnext_taskview.api.delete_task",
      args,
      callback: (r: { message: GetResponse }) => resolve(r.message),
      error: (err: unknown) => reject(err),
    });
  });
}

export function assignTask(task: string, user: string): Promise<GetResponse> {
  const args: Record<string, string> = { task, user };
  const fp = getFormParams();
  if (fp) args.form_params = fp;

  return new Promise((resolve, reject) => {
    frappe.call({
      method: "erpnext_taskview.erpnext_taskview.api.assign_task",
      args,
      callback: (r: { message: GetResponse }) => resolve(r.message),
      error: (err: unknown) => reject(err),
    });
  });
}

export function unassignTask(task: string, user: string): Promise<GetResponse> {
  const args: Record<string, string> = { task, user };
  const fp = getFormParams();
  if (fp) args.form_params = fp;

  return new Promise((resolve, reject) => {
    frappe.call({
      method: "erpnext_taskview.erpnext_taskview.api.unassign_task",
      args,
      callback: (r: { message: GetResponse }) => resolve(r.message),
      error: (err: unknown) => reject(err),
    });
  });
}

export function pinTask(task: string): Promise<GetResponse> {
  const args: Record<string, string> = { task };
  const fp = getFormParams();
  if (fp) args.form_params = fp;

  return new Promise((resolve, reject) => {
    frappe.call({
      method: "erpnext_taskview.erpnext_taskview.api.pin_task",
      args,
      callback: (r: { message: GetResponse }) => resolve(r.message),
      error: (err: unknown) => reject(err),
    });
  });
}

export function unpinTask(task: string): Promise<GetResponse> {
  const args: Record<string, string> = { task };
  const fp = getFormParams();
  if (fp) args.form_params = fp;

  return new Promise((resolve, reject) => {
    frappe.call({
      method: "erpnext_taskview.erpnext_taskview.api.unpin_task",
      args,
      callback: (r: { message: GetResponse }) => resolve(r.message),
      error: (err: unknown) => reject(err),
    });
  });
}

export function reorderPinnedTasks(order: string[]): Promise<GetResponse> {
  const args: Record<string, string> = { order: JSON.stringify(order) };
  const fp = getFormParams();
  if (fp) args.form_params = fp;

  return new Promise((resolve, reject) => {
    frappe.call({
      method: "erpnext_taskview.erpnext_taskview.api.reorder_pinned_tasks",
      args,
      callback: (r: { message: GetResponse }) => resolve(r.message),
      error: (err: unknown) => reject(err),
    });
  });
}
