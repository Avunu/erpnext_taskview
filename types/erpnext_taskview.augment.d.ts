// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

// What this app adds to frappe's desk namespaces, and the one frappe member
// frappe-types 16.5.0 does not declare yet. frappe's own globals come from
// frappe-types; nothing here redeclares them.

import type { ListColumn, ListView, ListViewSelect, SortSelector } from "frappe-types";

declare module "frappe-types" {
	interface FrappeViewsNamespace {
		// app-owned: the Task View list view, set by taskview.entry.ts and routed as `<doctype>/view/tasks`
		TasksView?: typeof ListView<ListColumn>;
		// app-owned: the view switcher with the Task View in it; taskview.entry.ts also installs it as ListViewSelect
		TaskViewSelect?: typeof ListViewSelect;
	}

	interface FrappeUiNamespace {
		// app-owned: the sort selector that labels `idx` "Manual", set by taskview.entry.ts
		TaskViewSortSelector?: typeof SortSelector;
	}

	interface BaseList {
		// app-owned: frappe's own member, missing from frappe-types 16.5.0 (base_list.js:325 reads it; the dashboard and kanban views set it)
		hide_sort_selector?: boolean;
	}
}
