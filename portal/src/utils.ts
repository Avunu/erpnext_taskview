// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

import { dayjs } from "frappe-ui";
import type { BoardColumn, PortalTaskCard } from "./types";

/** "3 Oct" this year, "3 Oct 2025" otherwise. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const d = dayjs(value);
  return d.format(d.year() === dayjs().year() ? "D MMM" : "D MMM YYYY");
}

/** "2 hours ago" */
export function fromNow(value: string | null | undefined): string {
  return value ? dayjs(value).fromNow() : "";
}

export function formatFileSize(bytes: number): string {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(i ? 1 : 0)} ${units[i]}`;
}

/** frappe-ui Badge theme per board column / task status. */
export function statusTheme(status: string): "gray" | "blue" | "green" | "amber" | "red" {
  switch (status as BoardColumn | "Overdue" | "Cancelled") {
    case "Working":
      return "blue";
    case "Pending Review":
      return "amber";
    case "Completed":
      return "green";
    case "Overdue":
      return "red";
    default:
      return "gray";
  }
}

export interface TreeRow {
  task: PortalTaskCard;
  depth: number;
}

/**
 * Tasks depth-first (each phase followed by its tasks), keeping the server's
 * sibling order.  A task whose parent isn't in the list becomes a root.
 */
export function flattenTree(tasks: PortalTaskCard[]): TreeRow[] {
  const names = new Set(tasks.map((t) => t.name));
  const children = new Map<string, PortalTaskCard[]>();
  const roots: PortalTaskCard[] = [];
  for (const t of tasks) {
    if (t.parent_task && names.has(t.parent_task)) {
      const list = children.get(t.parent_task) ?? [];
      list.push(t);
      children.set(t.parent_task, list);
    } else {
      roots.push(t);
    }
  }
  const rows: TreeRow[] = [];
  const seen = new Set<string>();
  const walk = (task: PortalTaskCard, depth: number) => {
    if (seen.has(task.name)) return;
    seen.add(task.name);
    rows.push({ task, depth });
    for (const child of children.get(task.name) ?? []) walk(child, depth + 1);
  };
  for (const t of roots) walk(t, 0);
  return rows;
}
