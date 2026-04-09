import { createApp } from "vue";
import TaskView from "./TaskView.vue";
import ViewModeSwitcher from "./components/ViewModeSwitcher.vue";
import type { ViewMode } from "./components/ViewModeSwitcher.vue";
import { fetchData } from "./types";

frappe.provide("frappe.views");
frappe.provide("frappe.ui.toolbar");
frappe.provide("frappe.ui.form");

class TaskViewSortSelector extends (frappe.ui.SortSelector as any) {
	constructor(opts: Record<string, any>) {
		super(opts);
	}
	get_label(fieldname: string): string {
		if (fieldname === "idx") {
			return __("Manual");
		} else {
			return (this as any).labels[fieldname] || frappe.meta.get_label((this as any).doctype, fieldname);
		}
	}
}
(frappe.ui as any).TaskViewSortSelector = TaskViewSortSelector;


frappe.views.TaskViewSelect = class TaskViewSelect extends frappe.views.ListViewSelect {
    setup_views() {
        // Start by calling the original setup_views to get the initial views object
        super.setup_views();

        if (this.doctype === "Task" || this.doctype === "Project") {
            // Add the Task view to the views object
            this.add_view_to_menu("Task View", () => {
                this.set_route("tasks");
            });
        }
        // Add the "List" view to let the user switch back to the default list view
        this.add_view_to_menu("List", () => {
            this.set_route("List");
        });
    }
};

// add Task view to the router
frappe.router.list_views.push("tasks");
frappe.router.list_views_route["tasks"] = "Tasks";

frappe.views.TasksView = class TasksView extends frappe.views.ListView {
    /** Structured response consumed by the Vue TaskView component. */
    taskViewData: any;
    /** Reference to the mounted Vue TaskView instance for view mode switching. */
    taskViewInstance: any;
    /** Reference to the mounted ViewModeSwitcher instance. */
    modeSwitcherInstance: any;

    prepare_data(r: any) {
        // Store the structured {projects, tasks} response for the Vue app.
        this.taskViewData = r.message;
        // ListView base class expects this.data to be a flat array (for
        // get_count_str, render_count, etc.).  Feed it the tasks list.
        this.data = r.message.tasks || [];
    }

    setup_defaults() {
        super.setup_defaults();
        this.page_title = `${this.doctype} Task View`;
        this.page_name = "task-view";
        this.show_hide_filters = false;
        this.list_view_settings = {
            fields: null,
        };
        this.method = "erpnext_taskview.erpnext_taskview.api.get";
        // Default to Manual (idx) sort — matches our drag-and-drop ordering
        this.sort_by = "idx";
        this.sort_order = "asc";
    }

    setup_page() {
        super.setup_page();

        frappe.call({
            method: "frappe.desk.listview.get_list_settings",
            args: {
                doctype: this.doctype,
            },
            callback: (doc: any) => {
                this.list_view_settings = doc.message || {};

                // Safely handle undefined fields
                if (this.list_view_settings.fields === undefined) {
                    this.list_view_settings.fields = null;
                }

                // Primary action setup
                this.page.set_primary_action("New Task", () => {
                    frappe.new_doc("Task");
                });
            },
            error: (error: any) => {
                console.error("Failed to get list settings:", error);
            },
        });

        // ── View mode toggle (Vue) ──────────────────────────
        this.mountModeSwitcher();
    }

	setup_sort_selector() {
		if (this.hide_sort_selector) return;
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

	on_sort_change(sort_by: string, sort_order: string) {
		this.sort_by = sort_by;
		this.sort_order = sort_order;
		const isManual = sort_by === "idx";
		fetchData().then((data) => {
			if (this.taskViewInstance) {
				this.taskViewInstance.setSortMode(isManual);
				this.taskViewInstance.premount(data);
			}
		});
	}

    mountModeSwitcher() {
        const el = document.createElement("div");
        // page_form is a jQuery object; access underlying DOM node
        (this.page.$title_area[0] as HTMLElement).appendChild(el);

        const app = createApp(ViewModeSwitcher, {
            "onUpdate:mode": (mode: ViewMode) => {
                if (this.taskViewInstance?.setViewMode) {
                    this.taskViewInstance.setViewMode(mode);
                }
            },
        });
        this.modeSwitcherInstance = app.mount(el);
    }

    // WE DON'T NEED SKELETONS.
    show_skeleton() { }
    hide_skeleton() { }

    // Consider projects as data too — tasks may be empty while projects exist.
    toggle_result_area() {
        const hasData =
            (this.taskViewData?.projects?.length ?? 0) > 0 || this.data.length > 0;
        (this.$result as any).parent(".result-container").toggle(hasData);
        (this.$result as any).toggle(hasData);
        (this.$paging_area as any).toggle(hasData);
        (this.$no_result as any).toggle(!hasData);
        if (hasData) {
            const show_more = this.start + this.page_length <= this.data.length;
            (this.$paging_area as any).find(".btn-more").toggle(show_more);
        }
    }

    setup_view_menu() {
        super.setup_view_menu();
        // `ListView.view_name` always returns "List", so the button group label is
        // always "List View". Patch it to "Task View" after the super call.
        if (this.views_menu) {
            (this.views_menu as any)
                .closest(".custom-btn-group")
                .find(".custom-btn-group-label")
                .text(__("Task View"));
        }
    }

    // Disable ListView's keyboard shortcuts (space, enter, arrows) which
    // conflict with the Vue tree's inline text editors.
    setup_keyboard_navigation() { }

    render_header(_refresh_header = false) {
        const resultEl = this.$result[0] as HTMLElement;
        resultEl.querySelectorAll(".list-row-head").forEach((el) => el.remove());
    }

    render_list() {
        const resultEl = this.$result[0] as HTMLElement;
        // Clear everything out of the result area
        resultEl.innerHTML = "";

        // Enable Frappe's scrolling container CSS (fixed-height .result-container)
        const mainParent = (this.parent.page.main[0] as HTMLElement).parentElement;
        if (mainParent) mainParent.classList.add("list-view");

        // Make a new Vue container to hold the header and rows
        const container = document.createElement("div");
        resultEl.appendChild(container);

        locals.nodes = {};

        // Mount TaskView directly as the root component
        const app = createApp(TaskView, { docs: this.taskViewData });
        this.taskViewInstance = app.mount(container);
        this.taskViewInstance.setSortMode(this.sort_by === "idx");
    }
};

// Override the global ListViewSelect with TaskViewSelect
frappe.views.ListViewSelect = frappe.views.TaskViewSelect;
