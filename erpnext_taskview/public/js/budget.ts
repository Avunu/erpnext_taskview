// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * @module budget
 *
 * Pure helpers for hour-budget meters, shared by the desk TaskView
 * (`components/BudgetMeter.vue`) and the customer portal SPA
 * (`portal/src/components/BudgetMeter.vue`).  No desk globals here.
 *
 * Budgets are computed server-side by `budget.py`; see its module docstring
 * for what counts as "logged" and how budgets roll up.
 */

/** `none` = no budget set; otherwise how close logged time is to the budget. */
export type BudgetState = "none" | "ok" | "warn" | "over";

/** Share of the budget at which a meter turns to the warning colour. */
export const WARN_AT = 0.8;

/** Logged ÷ budget, or 0 when there is no budget. */
export function budgetRatio(logged: number, budget: number): number {
  return budget > 0 ? logged / budget : 0;
}

export function budgetState(logged: number, budget: number): BudgetState {
  if (!(budget > 0)) return "none";
  const ratio = budgetRatio(logged, budget);
  if (ratio > 1) return "over";
  if (ratio >= WARN_AT) return "warn";
  return "ok";
}

/** Bar fill as a CSS width, capped at 100%. */
export function budgetFillWidth(logged: number, budget: number): string {
  return `${Math.min(100, Math.max(0, budgetRatio(logged, budget) * 100)).toFixed(1)}%`;
}

/** Hours for display: one decimal below 100 h, whole hours above, trailing ".0" dropped. */
export function formatHours(hours: number): string {
  const value = Math.abs(hours) >= 100 ? Math.round(hours) : Math.round(hours * 10) / 10;
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

/** "12.5 / 20 h", or "12.5 h" when there is no budget. */
export function budgetLabel(logged: number, budget: number): string {
  return budget > 0
    ? `${formatHours(logged)} / ${formatHours(budget)} h`
    : `${formatHours(logged)} h`;
}

/** Tooltip sentence: remaining or over-budget hours. */
export function budgetSummary(logged: number, budget: number): string {
  if (!(budget > 0)) return `${formatHours(logged)} h logged, no budget set`;
  const pct = Math.round(budgetRatio(logged, budget) * 100);
  const diff = budget - logged;
  return diff >= 0
    ? `${formatHours(logged)} of ${formatHours(budget)} h logged (${pct}%), ${formatHours(diff)} h remaining`
    : `${formatHours(logged)} of ${formatHours(budget)} h logged (${pct}%), ${formatHours(-diff)} h over budget`;
}
