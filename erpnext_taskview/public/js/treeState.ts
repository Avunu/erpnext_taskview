/**
 * Persistent tree collapse/expand state, stored in localStorage per user.
 *
 * Keys are Frappe document names; values are `true` (expanded) or `false`
 * (collapsed).  The storage key is scoped to the current Frappe session
 * user so each user gets their own layout.
 *
 * Replaces the previous `locals.nodes` global.
 */
import { useLocalStorage } from "@vueuse/core";
import type { RemovableRef } from "@vueuse/core";

function storageKey(): string {
  // frappe.session.user is available by the time any component mounts
  const user = frappe.session?.user ?? "guest";
  return `erpnext_taskview:tree_state:${user}`;
}

/** Reactive record of expanded/collapsed state keyed by doc name. */
export const treeNodes: RemovableRef<Record<string, boolean>> = useLocalStorage<
  Record<string, boolean>
>(storageKey(), {});
