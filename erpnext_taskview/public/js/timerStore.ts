/**
 * @module timerStore
 *
 * Global reactive singleton managing all active timers for the current user.
 *
 * This store is the **single source of truth** for timer state across the
 * entire Frappe session.  Both the floating timer dock and the task-view
 * tree consume and mutate state through this module.
 *
 * Because the taskview and timerdock are separate IIFE bundles — each with
 * its own copy of Vue — reactive refs can't be shared directly.  Instead,
 * each bundle maintains its own local refs and a `CustomEvent` on
 * `document` signals other bundles to re-read the shared data cache on
 * `window`.  This gives us cross-bundle reactivity without requiring a
 * shared Vue runtime.
 */

import { computed, ref, type Ref } from "vue";
import { type SaveDocResponse } from "./types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ActiveTimer {
  name: string;
  parent: string;
  project: string;
  task: string;
  task_subject: string;
  project_name: string;
  customer: string | null;
  from_time: string | null;
  to_time: string | null;
  hours: number;
  paused: number;
  start_time: string | null;
  paused_time_in_seconds: number;
  description: string;
}

// ---------------------------------------------------------------------------
// Cross-bundle communication
// ---------------------------------------------------------------------------

const CACHE_KEY = "__erpnext_taskview_timers__";
const EVENT_NAME = "erpnext_taskview:timers_changed";

/** Write the timer list to a window-level cache for other bundles. */
function publishToCache(list: ActiveTimer[]): void {
  (window as any)[CACHE_KEY] = list;
}

/** Read the timer list from the window-level cache (set by any bundle). */
function readFromCache(): ActiveTimer[] | null {
  return (window as any)[CACHE_KEY] ?? null;
}

// ---------------------------------------------------------------------------
// Local reactive state (per-bundle)
// ---------------------------------------------------------------------------

const timers: Ref<Map<string, ActiveTimer>> = ref(new Map());
const loaded = ref(false);
const loading = ref(false);

/** Rebuild local refs from a timer list (shared or fetched). */
function hydrateFromList(list: ActiveTimer[]): void {
  const map = new Map<string, ActiveTimer>();
  for (const t of list) {
    map.set(t.name, t);
  }
  timers.value = map;
  loaded.value = true;
}

// Listen for changes signalled by the other bundle
document.addEventListener(EVENT_NAME, () => {
  const cached = readFromCache();
  if (cached) hydrateFromList(cached);
});

// ---------------------------------------------------------------------------
// Server communication
// ---------------------------------------------------------------------------

export async function fetchTimers(): Promise<void> {
  loading.value = true;
  try {
    const result = await new Promise<{ timers: ActiveTimer[] }>((resolve, reject) => {
      frappe.call({
        method: "erpnext_taskview.erpnext_taskview.api.get_active_timers",
        callback: (r: { message: { timers: ActiveTimer[] } }) => resolve(r.message),
        error: (err: unknown) => reject(err),
      });
    });
    hydrateFromList(result.timers);
    // Share with other bundles — cache + event
    publishToCache(result.timers);
    document.dispatchEvent(new CustomEvent(EVENT_NAME));
  } finally {
    loading.value = false;
  }
}

export async function sendTimerAction(detail: Record<string, unknown>): Promise<SaveDocResponse> {
  loading.value = true;
  try {
    const payload = JSON.stringify({ doc: { doctype: "Timesheet Detail", ...detail } });
    const result = await new Promise<SaveDocResponse>((resolve, reject) => {
      frappe.call({
        method: "erpnext_taskview.erpnext_taskview.api.save_doc",
        args: { payload },
        callback: (r: { message: SaveDocResponse }) => resolve(r.message),
        error: (err: unknown) => reject(err),
      });
    });
    await fetchTimers();
    return result;
  } finally {
    loading.value = false;
  }
}

export const refreshTimers = fetchTimers;

/**
 * Persist a description update for an active timer without triggering
 * a full timer refresh.  Intended to be called from a debounced handler.
 */
export async function saveTimerDescription(name: string, description: string): Promise<void> {
  const payload = JSON.stringify({
    doc: { doctype: "Timesheet Detail", name, description, update_description: 1 },
  });
  await new Promise<void>((resolve, reject) => {
    frappe.call({
      method: "erpnext_taskview.erpnext_taskview.api.save_doc",
      args: { payload },
      callback: () => resolve(),
      error: (err: unknown) => reject(err),
    });
  });
}

// ---------------------------------------------------------------------------
// Derived helpers
// ---------------------------------------------------------------------------

export function getRunningTimer(): ActiveTimer | null {
  for (const [, t] of timers.value) {
    if (!t.paused) return t;
  }
  return null;
}

export const timersByTask = computed(() => {
  const map = new Map<string, ActiveTimer>();
  for (const [, t] of timers.value) {
    map.set(t.task, t);
  }
  return map;
});

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export { timers, loaded, loading };
