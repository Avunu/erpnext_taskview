// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * The open project, loaded once by `ProjectLayout` and shared with the
 * overview, task list / board and task drawer below it.
 */

import { inject, type InjectionKey } from "vue";
import type { PortalProjectDetail } from "./types";

export interface ProjectContext {
  detail: PortalProjectDetail | null;
  loading: boolean;
  error: string;
  /** Re-fetch the project (after a change, or on the poll / window focus). */
  reload: () => Promise<void>;
  /** Open the new-task dialog, optionally under a phase. */
  newTask: (phase?: string | null) => void;
}

export const PROJECT_CONTEXT: InjectionKey<ProjectContext> = Symbol("project");

export function useProject(): ProjectContext {
  const ctx = inject(PROJECT_CONTEXT);
  if (!ctx) throw new Error("useProject() outside ProjectLayout");
  return ctx;
}

/** Rich-text toolbar for customer input: no images, embeds or task lists. */
export const EDITOR_MENU = [
  "Paragraph",
  ["Heading 2", "Heading 3"],
  "Separator",
  "Bold",
  "Italic",
  "Strikethrough",
  "Separator",
  "Bullet List",
  "Numbered List",
  "Separator",
  "Link",
  "Blockquote",
  "Code",
];
