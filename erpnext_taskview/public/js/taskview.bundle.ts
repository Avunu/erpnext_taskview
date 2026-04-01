/// <reference path="./types/frappe.d.ts" />
import { createApp, h } from "vue";
import TaskView from "./TaskView.vue";

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

            this.add_view_to_menu(
                "Tasks",
                () => {
                    this.set_route("tasks");
                }
            );
        }
        // Add the "List" view to let the user switch back to the default list view
        this.add_view_to_menu(
            "List",
            () => {
                this.set_route("List");
            }
        );
    }
};

// add Task view to the router
frappe.router.list_views.push("tasks");
frappe.router.list_views_route["tasks"] = "Tasks";

frappe.views.TasksView = class TasksView extends frappe.views.ListView {

    prepare_data(r: any) {
        this.data = r.message;
    }

    setup_defaults() {
        super.setup_defaults();
        this.page_title = "Task View";
        this.page_name = "task-view";
        this.show_hide_filters = false;
        this.list_view_settings = {
            fields: null,
        };
        this.method = "erpnext_taskview.erpnext_taskview.api.get"

        // TODO: set Task View as the current view in the dropdown and add list view to the list of views
        // use setup_view_menu() from base_list.js?

    }

    setup_page() {
        super.setup_page();
        frappe
            .call({
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
                }
            });
    }

    // WE DON'T NEED SKELETONS.
    show_skeleton() { }
    hide_skeleton() { }

    render_header(_refresh_header = false) {
        this.$result.find(".list-row-head").remove();
    }

    render_list() {
        // Clear everything out of the result area
        this.$result.empty();

        // Make a new Vue container to hold the header and rows
        const container = document.createElement('div');
        this.$result.append(container);

        locals.nodes = {};

        // Pass the data to TaskView
        createApp({
            render: () => h(TaskView, { docs: this.data })
        }).mount(container);
    }
};

// Override the global ListViewSelect with TaskViewSelect
frappe.views.ListViewSelect = frappe.views.TaskViewSelect;