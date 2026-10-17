// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

import type {
	FrappeViewName,
	ListViewDBSettings,
	ListViewSelect as FrappeListViewSelect,
	ListViewSelectView,
} from "frappe-types";
import { createApp } from "vue";
import TaskView from "./TaskView.vue";
import ViewModeSwitcher from "./components/ViewModeSwitcher.vue";
import type { ViewMode } from "./components/ViewModeSwitcher.vue";
import { fetchData } from "./types";
import type { GetResponse } from "./types";

frappe.provide("frappe.views");
frappe.provide("frappe.ui.toolbar");
frappe.provide("frappe.ui.form");

// The desk bundle defines both before any app_include_js bundle runs.
const { ListView, ListViewSelect } = frappe.views;
if (!ListView || !ListViewSelect) {
	throw new Error("TaskView needs frappe's ListView and ListViewSelect");
}

/**
 * The "Tasks" view mode: routed as `/desk/<doctype>/view/tasks` (see the
 * router registration below) and offered by the view switcher on the Task and
 * Project lists.  frappe-types closes `FrappeViewName` over frappe's own
 * views, so an app's view is cast into it once, here.
 */
const TASKS_VIEW = "Tasks" as FrappeViewName;

class TaskViewSortSelector extends frappe.ui.SortSelector {
	override get_label(fieldname: string): string {
		if (fieldname === "idx") {
			return __("Manual");
		}
		return this.labels[fieldname] || frappe.meta.get_label(this.doctype ?? "", fieldname);
	}
}
frappe.ui.TaskViewSortSelector = TaskViewSortSelector;

/**
 * Offers the Task View in frappe's view switcher.
 *
 * The switcher lists the views `get_views()` returns, in the order of
 * `frappe.views.view_modes`, and marks the one named by the route as current,
 * so the Tasks view mode is registered in both, with its icon and label.
 */
class TaskViewSelect extends ListViewSelect {
	override set_current_view(): void {
		// The constructor calls this first, before it builds the switcher from the label map.
		this.label_map[TASKS_VIEW] = __("Task View");
		super.set_current_view();
	}

	override get_views(): ReturnType<FrappeListViewSelect["get_views"]> {
		const tasks: ListViewSelectView = {
			condition: this.doctype === "Task" || this.doctype === "Project",
			action: () => this.set_route("tasks"),
		};
		return { ...super.get_views(), [TASKS_VIEW]: tasks };
	}
}
frappe.views.TaskViewSelect = TaskViewSelect;

frappe.views.view_modes?.push(TASKS_VIEW);
if (frappe.views.view_icon_map) frappe.views.view_icon_map[TASKS_VIEW] = "list-todo";

// add Task view to the router
frappe.router.list_views.push("tasks");
frappe.router.list_views_route["tasks"] = "Tasks";

class TasksView extends ListView {
	/** Structured response consumed by the Vue TaskView component. */
	taskViewData: GetResponse | undefined;
	/** The mounted Vue TaskView instance, for view mode switching. */
	taskViewInstance: InstanceType<typeof TaskView> | undefined;
	/** The mounted ViewModeSwitcher instance. */
	modeSwitcherInstance: InstanceType<typeof ViewModeSwitcher> | undefined;

	override prepare_data(r: { message: GetResponse }): void {
		// Store the structured {projects, tasks} response for the Vue app.
		this.taskViewData = r.message;
		// ListView base class expects this.data to be a flat array (for
		// get_count_str, render_count, etc.).  Feed it the tasks list.
		this.data = r.message.tasks.map((task) => ({ ...task }));
	}

	override setup_defaults(): void {
		super.setup_defaults();
		this.page_title = `${this.doctype} Task View`;
		this.page_name = "task-view";
		this.list_view_settings = {};
		this.method = "erpnext_taskview.erpnext_taskview.api.get";
		// Default to Manual (idx) sort — matches our drag-and-drop ordering
		this.sort_by = "idx";
		this.sort_order = "asc";
	}

	override setup_page(): void {
		super.setup_page();

		frappe.call<ListViewDBSettings>({
			method: "frappe.desk.listview.get_list_settings",
			args: {
				doctype: this.doctype,
			},
			callback: (doc) => {
				this.list_view_settings = doc.message || {};

				// Primary action: create a new doc of whichever list this view backs
				// (Project list → "New Project", Task list → "New Task").
				const newLabel = this.doctype === "Project" ? __("New Project") : __("New Task");
				this.page.set_primary_action(newLabel, () => {
					frappe.new_doc(this.doctype);
				});
			},
			error: (error) => {
				console.error("Failed to get list settings:", error);
			},
		});

		// ── View mode toggle (Vue) ──────────────────────────
		this.mountModeSwitcher();
	}

	override setup_sort_selector(): void {
		if (this.hide_sort_selector || !this.$filter_section) return;
		this.sort_selector = new TaskViewSortSelector({
			parent: this.$filter_section,
			doctype: this.doctype,
			args: {
				sort_by: this.sort_by,
				sort_order: this.sort_order,
			},
			onchange: this.on_sort_change.bind(this),
		});
	}

	override on_sort_change(sort_by: string, sort_order: string): void {
		this.sort_by = sort_by;
		this.sort_order = sort_order;
		const isManual = sort_by === "idx";
		void fetchData().then((data) => {
			if (this.taskViewInstance) {
				this.taskViewInstance.setSortMode(isManual);
				this.taskViewInstance.premount(data);
			}
		});
	}

	mountModeSwitcher(): void {
		const el = document.createElement("div");
		this.page.$title_area.append(el);

		const app = createApp(ViewModeSwitcher, {
			"onUpdate:mode": (mode: ViewMode) => {
				this.taskViewInstance?.setViewMode(mode);
			},
		});
		this.modeSwitcherInstance = app.mount(el) as InstanceType<typeof ViewModeSwitcher>;
	}

	// WE DON'T NEED SKELETONS.
	override show_skeleton(): void {}
	override hide_skeleton(): void {}

	// Consider projects as data too — tasks may be empty while projects exist.
	override toggle_result_area(): void {
		const hasData = (this.taskViewData?.projects.length ?? 0) > 0 || this.data.length > 0;
		this.$result.parent(".result-container").toggle(hasData);
		this.$result.toggle(hasData);
		this.$paging_area.toggle(hasData);
		this.$no_result.toggle(!hasData);
		if (hasData) {
			const show_more = this.start + this.page_length <= this.data.length;
			this.$paging_area.find(".btn-more").toggle(show_more);
		}
	}

	// Disable ListView's keyboard shortcuts (space, enter, arrows) which
	// conflict with the Vue tree's inline text editors.
	override setup_keyboard_navigation(): void {}

	// The base ListView's update_url_with_filters checks
	// `frappe.get_route_str() == this.page_name` which never matches for
	// our custom view (route is "List/<doctype>/Tasks", page_name is "task-view").
	// Override to use the correct route check.
	override update_url_with_filters(): void {
		const route = frappe.get_route();
		if (route && route[0] === "List" && route[2] === "Tasks") {
			window.history.replaceState(null, "", this.get_url_with_filters());
		}
	}

	override render_header(_refresh_header = false): void {
		const resultEl = this.$result[0];
		resultEl?.querySelectorAll(".list-row-head").forEach((el) => el.remove());
	}

	override render_list(): void {
		const resultEl = this.$result[0];
		if (!resultEl) return;
		// Clear everything out of the result area
		resultEl.innerHTML = "";

		// Enable Frappe's scrolling container CSS (fixed-height .result-container)
		const mainParent = this.parent.page.main[0]?.parentElement;
		if (mainParent) mainParent.classList.add("list-view");

		// Make a new Vue container to hold the header and rows
		const container = document.createElement("div");
		resultEl.appendChild(container);

		locals.nodes = {};

		// Mount TaskView directly as the root component
		const app = createApp(TaskView, { docs: this.taskViewData });
		const view = app.mount(container) as InstanceType<typeof TaskView>;
		this.taskViewInstance = view;
		view.setSortMode(this.sort_by === "idx");
		// Restore view mode from the switcher (survives filter-triggered re-renders)
		if (this.modeSwitcherInstance?.activeMode) {
			view.setViewMode(this.modeSwitcherInstance.activeMode);
		}
	}
}
frappe.views.TasksView = TasksView;

// Override the global ListViewSelect with TaskViewSelect
frappe.views.ListViewSelect = TaskViewSelect;
