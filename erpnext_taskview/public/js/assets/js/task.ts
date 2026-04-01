/**
 * @module task
 *
 * Pure helper functions for extracting display data from {@link TreeNode}s.
 *
 * These functions are used by both `Task.vue` (for computed properties) and
 * `taskview.ts` (for tree-level operations like blank-task insertion and
 * parent-project lookup).
 */

import { TreeNode, ProjectDoc, TaskDoc } from './script.ts';

/**
 * Return the human-readable display text for a tree node.
 *
 * - **Projects** are shown as `"NAME: Title"` (e.g. `"PROJ-001: My Project"`).
 * - **Tasks** are shown as the task subject.
 *
 * @param node - The tree node to extract text from.
 * @returns A display-ready string for the tree row label.
 */
export function getDisplayText(node: TreeNode): string {
  if (node.doc.doctype === 'Project') {
    const doc = node.doc as ProjectDoc;
    return `${doc.name}: ${doc.project_name}`;
  }
  return (node.doc as TaskDoc).subject;
}

/**
 * Return the project name associated with a tree node.
 *
 * For project nodes this is the doc's own `name`.  For task nodes it is the
 * `project` field (which references the parent Project doc).
 *
 * @param node - The tree node to inspect.
 * @returns The Frappe Project document name.
 */
export function getProjectName(node: TreeNode): string {
  if (node.doc.doctype === 'Project') {
    return node.doc.name;
  }
  return (node.doc as TaskDoc).project;
}