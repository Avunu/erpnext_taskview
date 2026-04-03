import { createApp } from "vue";
import TaskView from "./TaskView.vue";
import ViewModeSwitcher from "./components/ViewModeSwitcher.vue";
import type { ViewMode } from "./components/ViewModeSwitcher.vue";

frappe.provide("frappe.views");
frappe.provide("frappe.ui.toolbar");
frappe.provide("frappe.ui.form");

frappe.views.TaskViewSelect = class TaskViewSelect extends frappe.views.ListViewSelect {
  setup_views() {
    // Start by calling the original setup_views to get the initial views object
    super.setup_views();

    if (this.doctype === "Task" || this.doctype === "Project") {
      // Add the Task view to the views object

      // TODO: change all tasks/Tasks references to Task/Task without breaking the app

      this.add_view_to_menu("Tasks", () => {
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
    this.page_title = "Task View";
    this.page_name = "task-view";
    this.show_hide_filters = false;
    this.list_view_settings = {
      fields: null,
    };
    this.method = "erpnext_taskview.erpnext_taskview.api.get";

    // TODO: set Task View as the current view in the dropdown and add list view to the list of views
    // use setup_view_menu() from base_list.js?
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
  show_skeleton() {}
  hide_skeleton() {}

  // Disable ListView's keyboard shortcuts (space, enter, arrows) which
  // conflict with the Vue tree's inline text editors.
  setup_keyboard_navigation() {}

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
  }
};

// Override the global ListViewSelect with TaskViewSelect
frappe.views.ListViewSelect = frappe.views.TaskViewSelect;
