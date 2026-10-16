// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * @module taskMarkdown
 *
 * "Copy as Markdown": serialize task/project tree nodes into a nested
 * markdown task list, with each task's description under it, and put it on
 * the clipboard.  Used by the copy button on each row and by Ctrl/Cmd+C.
 *
 * Copy semantics:
 * - A copied node brings its **entire subtree** as the tree holds it — every
 *   descendant is emitted, even collapsed ones.  The tree has no Completed or
 *   Cancelled tasks (`get()` hides them) and honours the list filters and the
 *   My Tasks view, so neither does the copy.
 * - Each copied node is a top-level item.  Within a selection, a node whose
 *   ancestor is also selected is copied as part of that ancestor.
 * - Tasks render as GitHub task-list items: `- [x]` when `Completed`,
 *   `- [ ]` otherwise.  A project renders as a plain line with its tasks
 *   beneath it; it only appears when the project itself is copied.
 * - A task's description (fetched as Markdown from the server) follows it as
 *   an indented paragraph, separated by blank lines.
 */

import { fetchTaskDescriptions, getDisplayText, type TaskDoc, type TreeNode } from "./types";

/** One markdown bullet line for a node at the given indent. */
function formatLine(node: TreeNode, indent: string): string {
  if (node.doc.doctype === "Project") {
    // Projects are context headers, not checkable items.
    return `${indent}- ${getDisplayText(node)}`;
  }
  const done = (node.doc as TaskDoc).status === "Completed";
  return `${indent}- [${done ? "x" : " "}] ${(node.doc as TaskDoc).subject}`;
}

/**
 * The selected nodes of `tree` that have no selected ancestor, in display
 * order.  Each one is copied with its whole subtree, so a selected descendant
 * is already covered by its ancestor.  Blank placeholder nodes are skipped.
 */
export function selectionRoots(tree: TreeNode[], selected: Set<string>): TreeNode[] {
  const roots: TreeNode[] = [];
  const walk = (nodes: TreeNode[]): void => {
    for (const node of nodes) {
      if (!node.doc.name) continue;
      if (selected.has(node.doc.name)) roots.push(node);
      else walk(node.children);
    }
  };
  walk(tree);
  return roots;
}

/**
 * Rebuild the subtree under `root` from a flat task list, keeping the list's
 * order (the backend's sort).  The Pinned view shows tasks flat, so this is
 * where a pinned row's subtasks come from.
 */
export function subtreeFromDocs(root: TaskDoc, tasks: TaskDoc[]): TreeNode {
  const childrenOf = new Map<string, TaskDoc[]>();
  for (const task of tasks) {
    if (!task.parent_task) continue;
    const siblings = childrenOf.get(task.parent_task);
    if (siblings) siblings.push(task);
    else childrenOf.set(task.parent_task, [task]);
  }
  // Guards against a parent_task cycle in bad data.
  const seen = new Set<string>();
  const build = (doc: TaskDoc): TreeNode => {
    seen.add(doc.name);
    const children = (childrenOf.get(doc.name) ?? []).filter((c) => !seen.has(c.name));
    return { doc, children: children.map(build) };
  };
  return build(root);
}

/** Names of every task in the given subtrees, to fetch their descriptions. */
export function collectTaskNames(nodes: TreeNode[]): string[] {
  const names: string[] = [];
  const walk = (node: TreeNode): void => {
    if (!node.doc.name) return;
    if (node.doc.doctype === "Task") names.push(node.doc.name);
    node.children.forEach(walk);
  };
  nodes.forEach(walk);
  return names;
}

/**
 * Render `nodes` and their subtrees as a nested markdown task list, each
 * task followed by its description from `descriptions` (keyed by task name).
 * `count` is the number of task lines.
 */
export function renderMarkdown(
  nodes: TreeNode[],
  descriptions: Record<string, string>,
): { markdown: string; count: number } {
  const lines: string[] = [];
  let count = 0;

  const walk = (node: TreeNode, depth: number): void => {
    if (!node.doc.name) return; // skip blank "Add task…/Add project…" placeholder nodes
    const indent = "  ".repeat(depth);
    lines.push(formatLine(node, indent));
    if (node.doc.doctype === "Task") {
      count++;
      const description = descriptions[node.doc.name];
      if (description) {
        // Without the blank line before it, the description would continue
        // the title's paragraph.  Indenting by the bullet's width keeps it
        // inside the list item; blank lines stay empty.
        const body = description
          .split("\n")
          .map((line) => (line.trim() ? `${indent}  ${line}` : ""));
        lines.push("", ...body, "");
      }
    }
    for (const child of node.children) walk(child, depth + 1);
  };

  for (const node of nodes) walk(node, 0);
  // Adjacent descriptions each add a blank line; keep one.
  const markdown = lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { markdown, count };
}

/** Legacy clipboard path for desks served over an insecure origin. */
function copyViaTextarea(text: string): void {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    if (!document.execCommand("copy")) throw new Error("execCommand copy failed");
  } finally {
    document.body.removeChild(ta);
  }
}

/**
 * Put text that is still being built on the clipboard.
 *
 * The write is requested right away, inside the click or keydown, with a
 * `ClipboardItem` that resolves once the text is ready.  Safari and Firefox
 * refuse a clipboard write made after an `await`, once the user gesture has
 * lapsed, so `writeText` after the server round-trip is only the fallback.
 * `navigator.clipboard` is absent in non-secure contexts; any throw falls
 * through to the next path.  Rejects if the text itself fails to build.
 */
async function writeToClipboard(text: Promise<string>): Promise<void> {
  try {
    const blob = text.then((t) => new Blob([t], { type: "text/plain" }));
    await navigator.clipboard.write([new ClipboardItem({ "text/plain": blob })]);
    return;
  } catch {
    // fall through
  }
  try {
    await navigator.clipboard.writeText(await text);
    return;
  } catch {
    // fall through
  }
  copyViaTextarea(await text);
}

/**
 * Copy `nodes` and their subtrees to the clipboard as Markdown, with task
 * descriptions, and confirm with an alert.  Call it straight from the click
 * or keydown handler so the clipboard write still counts as user-initiated.
 */
export async function copyNodesAsMarkdown(nodes: TreeNode[]): Promise<void> {
  if (!nodes.some((node) => node.doc.name)) return;
  const names = collectTaskNames(nodes);
  const rendered = (names.length ? fetchTaskDescriptions(names) : Promise.resolve({})).then(
    (descriptions) => renderMarkdown(nodes, descriptions),
  );
  try {
    await writeToClipboard(rendered.then((r) => r.markdown));
    const { count } = await rendered;
    frappe.show_alert({
      message: __("Copied {0} task(s) to clipboard", { "0": String(count) }),
      indicator: "green",
    });
  } catch {
    frappe.show_alert({ message: __("Copy to clipboard failed"), indicator: "red" });
  }
}
