/**
 * @module script
 *
 * Shared types and backend communication helpers for the ERPNext Task View.
 *
 * This file mirrors the Pydantic models in ``models.py`` — those models are
 * the **single source of truth**; any change there must be reflected here.
 *
 * ## Architecture
 *
 * The backend returns flat lists of docs via {@link GetResponse}.  The
 * frontend assembles the tree ({@link TreeNode}) and each Vue component
 * derives its own UI state through `computed` properties — no pre-computed
 * UI objects cross the API boundary.
 *
 * ## Backend communication
 *
 * Two standalone functions — {@link saveDoc} and {@link fetchData} — wrap
 * `frappe.call`.  Both return a fresh {@link GetResponse} so the tree can
 * be rebuilt after every mutation.
 */

// ---------------------------------------------------------------------------
// Doc types — mirrors models.py (single source of truth)
// ---------------------------------------------------------------------------

/**
 * Subset of Frappe *Project* fields used in the task tree.
 *
 * @property doctype - Discriminator; always `'Project'`.
 * @property name    - Frappe document name (primary key). Empty string for new docs.
 * @property project_name - Human-readable title.
 * @property status  - Workflow status (`'Open'`, `'Completed'`, etc.).
 */
export interface ProjectDoc {
  doctype: 'Project';
  name: string;
  project_name: string;
  status: string;
}

/**
 * Subset of Frappe *Task* fields.
 *
 * Tasks form a nested-set tree (lft/rgt) in the database.  The parent-child
 * relationship is expressed through {@link parent_task} (immediate parent)
 * and {@link project} (root project).
 *
 * @property doctype     - Discriminator; always `'Task'`.
 * @property name        - Frappe document name. Empty string for new tasks.
 * @property subject     - Task title displayed in the tree row.
 * @property project     - Name of the parent Project doc.
 * @property parent_task - Name of the parent Task, or `null` at project root.
 * @property status      - Workflow status (`'Open'`, `'Completed'`, etc.).
 * @property is_group    - `1` if this task may contain children, `0` otherwise.
 * @property priority    - ERPNext priority (`'Low'`, `'Medium'`, `'High'`, `'Urgent'`).
 */
export interface TaskDoc {
  doctype: 'Task';
  name: string;
  subject: string;
  project: string;
  parent_task: string | null;
  status: string;
  is_group: number;
  priority: string;
}

/**
 * Timesheet Detail row — carries all timer state for a single task.
 *
 * The frontend never mutates these fields directly.  Instead it sends a
 * partial copy to {@link saveDoc} and the backend derives the timer action
 * from the field values:
 *
 * | Action     | `name`    | `from_time` | `to_time` | `paused` |
 * |------------|-----------|-------------|-----------|----------|
 * | Start      | absent    | —           | —         | —        |
 * | Manual log | absent    | set         | set       | —        |
 * | Pause      | present   | —           | —         | `1`      |
 * | Resume     | present   | —           | —         | `0`      |
 * | Stop       | present   | —           | set       | —        |
 *
 * @property doctype                - Discriminator; always `'Timesheet Detail'`.
 * @property name                   - Frappe row name, or `null` for new entries.
 * @property parent                 - Name of the parent Timesheet document.
 * @property project                - Associated project name.
 * @property task                   - Associated task name.
 * @property from_time              - ISO datetime string — timer start.
 * @property to_time                - ISO datetime string — timer end / manual log end.
 * @property hours                  - Computed elapsed hours.
 * @property paused                 - `1` if paused, `0` if running/stopped.
 * @property start_time             - Wall-clock start of the current un-paused segment.
 * @property paused_time_in_seconds - Cumulative seconds spent paused.
 * @property description            - Free-text work description.
 */
export interface TimesheetDetailDoc {
  doctype: 'Timesheet Detail';
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
}

/**
 * Discriminated union of the three doc types.
 *
 * Mirrors the Pydantic ``FrappeDoc`` type with `doctype` as discriminator.
 */
export type FrappeDoc = ProjectDoc | TaskDoc | TimesheetDetailDoc;

// ---------------------------------------------------------------------------
// API response from get()
// ---------------------------------------------------------------------------

/**
 * Shape returned by the `get` endpoint.
 *
 * Contains three flat lists — the frontend assembles the tree and derives
 * all UI state (timerStatus, isBlank, expanded, etc.) from these raw docs.
 *
 * @property projects          - All projects matching the current filters.
 * @property tasks             - Tasks belonging to returned projects, ordered by nested-set `lft`.
 * @property timesheet_details - Open (to_time IS NULL) timesheet detail rows for the current user.
 */
export interface GetResponse {
  projects: ProjectDoc[];
  tasks: TaskDoc[];
  timesheet_details: TimesheetDetailDoc[];
}

// ---------------------------------------------------------------------------
// Tree node — minimal wrapper for @he-tree/vue.
// UI state is derived by each component via computed properties.
// ---------------------------------------------------------------------------

/**
 * Minimal tree node consumed by `@he-tree/vue`'s `<Draggable>` component.
 *
 * Contains only the raw doc and child array — **no pre-computed UI state**.
 * Each Vue component (e.g. `Task.vue`) derives display properties like
 * `isProject`, `timerStatus`, `isBlank` via its own `computed` block.
 *
 * @property doc        - The underlying Frappe document (Project or Task).
 * @property children   - Child nodes in the tree hierarchy.
 * @property _autoFocus - Ephemeral flag set by keyboard shortcuts to trigger
 *                        edit mode on blank placeholder nodes.
 */
export interface TreeNode {
  doc: ProjectDoc | TaskDoc;
  children: TreeNode[];
  _autoFocus?: boolean;
}

// ---------------------------------------------------------------------------
// Backend communication
// ---------------------------------------------------------------------------

/**
 * Persist a document to the server via `save_doc`.
 *
 * Wraps `frappe.call` to the `erpnext_taskview.erpnext_taskview.api.save_doc`
 * endpoint.  The server determines insert-vs-update semantics and timer
 * actions from the doc fields themselves (see {@link TimesheetDetailDoc}).
 *
 * @param doc      - Partial doc to save.  Must include `doctype` and enough
 *                   fields for the backend to derive the operation.
 * @param children - Optional flat list of descendant {@link TaskDoc}s whose
 *                   `project` field should be updated (used during drag
 *                   reparenting).
 * @returns A fresh {@link GetResponse} so the caller can rebuild the tree
 *          with up-to-date data.
 */
export function saveDoc(
  doc: Partial<FrappeDoc>,
  children?: TaskDoc[]
): Promise<GetResponse> {
  const payload: Record<string, unknown> = { doc };
  if (children) payload.children = children;

  return new Promise((resolve, reject) => {
    frappe.call({
      method: "erpnext_taskview.erpnext_taskview.api.save_doc",
      args: { payload: JSON.stringify(payload) },
      callback: (r: { message: GetResponse }) => resolve(r.message),
      error: (err: unknown) => reject(err),
    });
  });
}

/**
 * Fetch fresh project/task/timesheet data from the server.
 *
 * Calls the read-only `get` endpoint.  Used for initial page load and for
 * recovery after an error (re-sync the frontend with server state).
 *
 * @returns The current {@link GetResponse} snapshot.
 */
export function fetchData(): Promise<GetResponse> {
  return new Promise((resolve, reject) => {
    frappe.call({
      method: "erpnext_taskview.erpnext_taskview.api.get",
      callback: (r: { message: GetResponse }) => resolve(r.message),
      error: (err: unknown) => reject(err),
    });
  });
}