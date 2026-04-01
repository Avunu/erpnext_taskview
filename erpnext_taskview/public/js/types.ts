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

export interface ProjectDoc {
	doctype: 'Project';
	name: string;
	project_name: string;
	status: string;
}

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

export type FrappeDoc = ProjectDoc | TaskDoc | TimesheetDetailDoc;

// ---------------------------------------------------------------------------
// API response
// ---------------------------------------------------------------------------

export interface GetResponse {
	projects: ProjectDoc[];
	tasks: TaskDoc[];
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
	if (node.doc.doctype === 'Project') {
		const doc = node.doc as ProjectDoc;
		return `${doc.name}: ${doc.project_name}`;
	}
	return (node.doc as TaskDoc).subject;
}

/** Project name associated with a tree node. */
export function getProjectName(node: TreeNode): string {
	if (node.doc.doctype === 'Project') {
		return node.doc.name;
	}
	return (node.doc as TaskDoc).project;
}

// ---------------------------------------------------------------------------
// Backend communication
// ---------------------------------------------------------------------------

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

export function fetchData(): Promise<GetResponse> {
	return new Promise((resolve, reject) => {
		frappe.call({
			method: "erpnext_taskview.erpnext_taskview.api.get",
			callback: (r: { message: GetResponse }) => resolve(r.message),
			error: (err: unknown) => reject(err),
		});
	});
}
