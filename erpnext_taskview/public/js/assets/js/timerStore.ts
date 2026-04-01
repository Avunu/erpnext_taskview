/**
 * @module timerStore
 *
 * Global reactive singleton managing all active timers for the current user.
 *
 * This store is the **single source of truth** for timer state across the
 * entire Frappe session.  Both the floating timer dock and the task-view
 * tree consume and mutate state through this module.
 *
 * ## Lifecycle
 *
 * 1. On desk load, the dock calls {@link fetchTimers} to hydrate from the
 *    server via `get_active_timers`.
 * 2. Timer interactions (start/pause/resume/stop) call {@link sendTimerAction},
 *    which persists via `save_doc` and then refreshes from the server.
 * 3. The task-view can call {@link refreshTimers} after its own `save_doc`
 *    calls to keep the dock in sync.
 *
 * ## Reactivity
 *
 * The `timers` ref is a `Map<string, ActiveTimer>` keyed by Timesheet Detail
 * name.  Vue components that read this ref will re-render when it changes.
 */

import { reactive, ref, type Ref } from 'vue';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Enriched timer record for dock display.
 *
 * Mirrors `ActiveTimerDoc` from models.py.
 *
 * @property name                   - Timesheet Detail row name.
 * @property parent                 - Parent Timesheet document name.
 * @property project                - Project name.
 * @property task                   - Task name.
 * @property task_subject           - Human-readable task title.
 * @property project_name           - Human-readable project title.
 * @property from_time              - Timer start (ISO string).
 * @property to_time                - Timer end (always null for active timers).
 * @property hours                  - Computed elapsed hours.
 * @property paused                 - 1 if paused, 0 if running.
 * @property start_time             - Start of the current un-paused segment.
 * @property paused_time_in_seconds - Cumulative paused seconds.
 * @property description            - Work description.
 */
export interface ActiveTimer {
	name: string;
	parent: string;
	project: string;
	task: string;
	task_subject: string;
	project_name: string;
	from_time: string | null;
	to_time: string | null;
	hours: number;
	paused: number;
	start_time: string | null;
	paused_time_in_seconds: number;
	description: string;
}

// ---------------------------------------------------------------------------
// Singleton state
// ---------------------------------------------------------------------------

/** All active (open) timers keyed by Timesheet Detail name. */
const timers: Ref<Map<string, ActiveTimer>> = ref(new Map());

/** Whether the initial fetch has completed. */
const loaded = ref(false);

/** Whether a fetch/action is currently in flight. */
const loading = ref(false);

// ---------------------------------------------------------------------------
// Server communication
// ---------------------------------------------------------------------------

/**
 * Fetch all active timers from the server and replace the local map.
 *
 * Calls `get_active_timers` and rebuilds the `timers` map.
 */
export async function fetchTimers(): Promise<void> {
	loading.value = true;
	try {
		const result = await new Promise<{ timers: ActiveTimer[] }>((resolve, reject) => {
			frappe.call({
				method: 'erpnext_taskview.erpnext_taskview.api.get_active_timers',
				callback: (r: { message: { timers: ActiveTimer[] } }) => resolve(r.message),
				error: (err: unknown) => reject(err),
			});
		});
		const map = new Map<string, ActiveTimer>();
		for (const t of result.timers) {
			map.set(t.name, t);
		}
		timers.value = map;
		loaded.value = true;
	} finally {
		loading.value = false;
	}
}

/**
 * Send a timer action (start/pause/resume/stop/manual log) and refresh.
 *
 * Persists via `save_doc` then calls {@link fetchTimers} to re-sync.
 * The dock does **not** consume the `GetResponse` from `save_doc` — that
 * response is task-view-specific.  Instead it always re-fetches the global
 * timer list.
 *
 * @param detail - Partial `TimesheetDetailDoc` fields for the action.
 * @returns The raw `save_doc` response (so the task-view can use it too).
 */
export async function sendTimerAction(
	detail: Record<string, unknown>,
): Promise<unknown> {
	loading.value = true;
	try {
		const payload = JSON.stringify({ doc: { doctype: 'Timesheet Detail', ...detail } });
		const result = await new Promise<unknown>((resolve, reject) => {
			frappe.call({
				method: 'erpnext_taskview.erpnext_taskview.api.save_doc',
				args: { payload },
				callback: (r: { message: unknown }) => resolve(r.message),
				error: (err: unknown) => reject(err),
			});
		});
		await fetchTimers();
		return result;
	} finally {
		loading.value = false;
	}
}

/**
 * Re-fetch timers from the server.
 *
 * Convenience alias for use by the task-view after its own mutations.
 */
export const refreshTimers = fetchTimers;

// ---------------------------------------------------------------------------
// Derived helpers
// ---------------------------------------------------------------------------

/**
 * Find the currently running (non-paused) timer, if any.
 *
 * @returns The running {@link ActiveTimer} or `null`.
 */
export function getRunningTimer(): ActiveTimer | null {
	for (const [, t] of timers.value) {
		if (!t.paused) return t;
	}
	return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export { timers, loaded, loading };
