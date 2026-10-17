// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * Type surface of `frappe-ui/editor` as used by the portal.
 *
 * Mapped in `portal/tsconfig.json` for the same reason as `frappe-ui.d.ts`:
 * the library's sources don't pass this repo's strict compiler settings.
 * Components are typed as plain Vue components (their props are frappe-ui's
 * own concern); add an export here when the portal starts using another one.
 */

// The code-block extension adds `toggleCodeBlock`, which the portal's toolbar
// chains, to TipTap's `Commands`.
/// <reference types="@tiptap/extension-code-block" />

import type { Editor as CoreEditor } from "@tiptap/core";
import type { Component } from "vue";

/** TipTap's `Editor` instance, as passed to menu item callbacks. */
type TiptapEditor = CoreEditor;

export const Editor: Component;
export const EditorContent: Component;
export const EditorFixedMenu: Component;

/** A toolbar button (frappe-ui `menu.ts`). */
export interface CommandMenuItem {
	label: string;
	/** A `lucide-*` icon name or a component. */
	icon?: Component | string;
	action: (editor: TiptapEditor) => boolean | void | Promise<boolean | void>;
	isActive?: (editor: TiptapEditor) => boolean;
	isDisabled?: (editor: TiptapEditor) => boolean;
	isAvailable?: (editor: TiptapEditor) => boolean;
}

/** A dropdown of toolbar buttons. */
export interface MenuGroupItem {
	type: "group";
	icon?: Component | string;
	label: string;
	items: CommandMenuItem[];
}

export type MenuItem = CommandMenuItem | MenuGroupItem | { type: "separator" };

export const Paragraph: CommandMenuItem;
export const H2: CommandMenuItem;
export const H3: CommandMenuItem;
export const Bold: CommandMenuItem;
export const Italic: CommandMenuItem;
export const Strike: CommandMenuItem;
export const BulletList: CommandMenuItem;
export const OrderedList: CommandMenuItem;
export const InsertLink: CommandMenuItem;
export const Blockquote: CommandMenuItem;
export const Separator: MenuItem;

/** The comment-grade extension bundle; each member takes options or `false`. */
export const CommentKit: {
	configure(options: Record<string, unknown>): unknown;
};
