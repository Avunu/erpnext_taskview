// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * @module taskMarkdown
 *
 * Serialize a selection of task/project tree nodes into a nested markdown
 * list, ready to paste elsewhere.
 *
 * Selection semantics (see the "select & copy" feature):
 * - Selecting a node includes its **entire subtree** — every descendant is
 *   emitted, even collapsed or unclicked ones.
 * - Tasks render as GitHub task-list items: `- [x]` when `Completed`,
 *   `- [ ]` otherwise.
 * - A project renders as a plain top-level header whenever it contains any
 *   selected descendant, giving the copied outline context.
 * - Unselected intermediate ancestors are skipped and don't add indentation,
 *   so a deep selection collapses up under its nearest rendered ancestor.
 */

import { getDisplayText, type TaskDoc, type TreeNode } from "./types";

/** One markdown bullet line for a rendered node at the given depth. */
function formatLine(node: TreeNode, depth: number): string {
  const indent = "  ".repeat(depth);
  if (node.doc.doctype === "Project") {
    // Projects are context headers, not checkable items.
    return `${indent}- ${getDisplayText(node)}`;
  }
  const done = (node.doc as TaskDoc).status === "Completed";
  return `${indent}- [${done ? "x" : " "}] ${(node.doc as TaskDoc).subject}`;
}

/**
 * Render the selected nodes (and, per the include-descendants rule, everything
 * beneath them) as a nested markdown list. `roots` is the full tree — typically
 * TaskView's `treeData`; `selected` is the set of selected doc names.
 *
 * Returns an empty string when nothing renders.
 */
export function selectionToMarkdown(roots: TreeNode[], selected: Set<string>): string {
  const lines: string[] = [];

  const hasSelectedDescendant = (node: TreeNode): boolean =>
    (!!node.doc.name && selected.has(node.doc.name)) || node.children.some(hasSelectedDescendant);

  const walk = (node: TreeNode, depth: number, underSelected: boolean): void => {
    const name = node.doc.name;
    if (!name) return; // skip blank "Add task…/Add project…" placeholder nodes
    const isProject = node.doc.doctype === "Project";
    const isSelected = selected.has(name);
    const included = underSelected || isSelected;
    // A project shows only when it actually contains something we're copying.
    const render = isProject ? included || hasSelectedDescendant(node) : included;

    if (render) lines.push(formatLine(node, depth));
    // Unselected ancestors don't consume a level, so gaps collapse upward.
    const childDepth = render ? depth + 1 : depth;
    for (const child of node.children) {
      walk(child, childDepth, underSelected || isSelected);
    }
  };

  for (const root of roots) walk(root, 0, false);
  return lines.join("\n");
}
