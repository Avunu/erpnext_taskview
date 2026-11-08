// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

// What this app adds to frappe's desk namespaces and view registry. frappe's
// own globals come from frappe-types; nothing here redeclares them.

import type { ListColumn, ListView, ListViewSelect, SortSelector } from "frappe-types";

declare module "frappe-types" {
	interface FrappeViewModes {
		// app-owned: the Task View's view mode, routed as `<doctype>/view/tasks`; taskview.entry.ts pushes it onto frappe.views.view_modes
		Tasks: true;
	}

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
}
