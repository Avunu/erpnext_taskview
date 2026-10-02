// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * @module budgetLive
 *
 * Live hours from the current user's own open timers, credited to the timer's
 * task, every visible ancestor and the project — so budget meters tick while
 * a timer runs.  The server leaves these timers out of `logged_hours`
 * (`compute_budgets(exclude_open_owner=...)`), so nothing is counted twice.
 */

import { computed, ref } from "vue";
import { timers } from "./timerStore";
import { calcElapsedHrs } from "./timerDialog";
import type { TaskDoc } from "./types";

/** How often running meters re-evaluate. */
const TICK_MS = 30_000;

/** Task name → parent key (`parent_task`, or the project for root tasks). */
const parentOf = ref(new Map<string, string>());
const now = ref(Date.now());
let ticker: number | null = null;

/** Record the tree shape the live figures roll up through; call on every rebuild. */
export function setBudgetTree(tasks: TaskDoc[]): void {
  const map = new Map<string, string>();
  for (const t of tasks) map.set(t.name, t.parent_task || t.project);
  parentOf.value = map;
  if (ticker === null) {
    ticker = window.setInterval(() => {
      now.value = Date.now();
    }, TICK_MS);
  }
}

/** Extra live hours per task / project name. */
export const liveExtraByNode = computed(() => {
  void now.value; // re-evaluate on every tick
  const extra = new Map<string, number>();
  const add = (key: string, hrs: number) => extra.set(key, (extra.get(key) ?? 0) + hrs);

  for (const [, t] of timers.value) {
    const hrs = calcElapsedHrs(t.paused_time_in_seconds, t.paused, t.start_time);
    if (!hrs) continue;
    const seen = new Set<string>();
    let key: string | undefined = t.task;
    while (key && !seen.has(key)) {
      seen.add(key);
      add(key, hrs);
      key = parentOf.value.get(key);
    }
    // The task may be hidden (completed) so the chain never reached its project.
    if (t.project && !seen.has(t.project)) add(t.project, hrs);
  }
  return extra;
});
