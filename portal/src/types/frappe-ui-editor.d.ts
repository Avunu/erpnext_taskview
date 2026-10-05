// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * Type surface of `frappe-ui/editor` as used by the portal.
 *
 * Mapped in `portal/tsconfig.json` for the same reason as `frappe-ui.d.ts`:
 * the library's sources don't pass this repo's strict compiler settings.
 * Components and the TipTap editor instance are typed loosely; add an export
 * here when the portal starts using another one.
 */

// Untyped on purpose: props and slots are frappe-ui's own concern.
type AnyComponent = any;
/** TipTap's `Editor` instance, as passed to menu item callbacks. */
type TiptapEditor = any;

export const Editor: AnyComponent;
export const EditorContent: AnyComponent;
export const EditorFixedMenu: AnyComponent;

/** A toolbar button (frappe-ui `menu.ts`). */
export interface CommandMenuItem {
  label: string;
  /** A `lucide-*` icon name or a component. */
  icon?: AnyComponent | string;
  action: (editor: TiptapEditor) => boolean | void | Promise<boolean | void>;
  isActive?: (editor: TiptapEditor) => boolean;
  isDisabled?: (editor: TiptapEditor) => boolean;
  isAvailable?: (editor: TiptapEditor) => boolean;
}

/** A dropdown of toolbar buttons. */
export interface MenuGroupItem {
  type: "group";
  icon?: AnyComponent | string;
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
