frappe.provide("frappe.views");
import { createApp, h } from "vue";
import TaskView from "./TaskView.vue";


frappe.views.TaskViewSelect = class TaskViewSelect extends frappe.views.ListViewSelect {
    setup_views() {
        // Start by calling the original setup_views to get the initial views object
        super.setup_views();
		
		if (this.doctype === "Task") {
			// Add the Task view to the views object
            // TODO: change all tasks/Tasks references to Task/Task without breaking the app
			this.add_view_to_menu(
				"Tasks",
				() => {
                    this.set_route("tasks");
                    // WHY DOES THIS ONLY SHOW UP WHEN SWITCHING BACK TO LIST VIEW?
                    // const labelElement = document.querySelector('.custom-btn-group-label');
                    // if (labelElement) {
                    //     labelElement.textContent = "Tasks View";
                    // }
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
    setup_defaults() {
        super.setup_defaults();
        this.page_title = __("Task View");
        this.page_name = "task-view";
        this.show_hide_filters = false;
        this.list_view_settings = {
            fields: null,
        };
        // this.method = "erpnext_taskview.erpnext_taskview.get"

        // TODO: set Task View as the current view in the dropdown and add list view to the list of views
        // find the dropdown element
        // set the text to "Task View"
        // const labelElement = document.querySelector('.custom-btn-group-label');
        // if (labelElement) {
        //     labelElement.textContent = "Task View";
        // }
        
    }

    setup_page() {
        super.setup_page();        
        frappe
            .call("frappe.desk.listview.get_list_settings", {
                doctype: this.doctype,
            })
            .then((doc) => {
                this.list_view_settings = doc.message || {};
    
                // Safely handle undefined fields
                if (this.list_view_settings.fields === undefined) {
                    this.list_view_settings.fields = null;
                }
    
                // Primary action setup
                this.page.set_primary_action(__("New Task"), () => {
                    frappe.new_doc("Task");
                });
            })
            .catch((error) => {
                console.error("Failed to get list settings:", error);
            });
    }
    
    // WE DON'T NEED SKELETONS.
    show_skeleton() {}
    hide_skeleton() {}

    render_header(refresh_header = false) {
        this.$result.find(".list-row-head").remove();
	}
    
    async render_list() {
        // Clear everything out of the result area
        this.$result.empty();

        // we need to get the projects first and make them the root nodes, with all tasks being children of the projects
        // /workspace/development/frappe-bench/apps/erpnext_taskview/erpnext_taskview/erpnext_taskview/__init__.py
        const projects = await frappe.call({
            method: 'erpnext_taskview.erpnext_taskview.get_projects',
            args: {}
        });
        if (this.data.length > 0 && projects.message) {
            // Make a new Vue container to hold the header and rows
            const container = document.createElement('div');
            this.$result.append(container);

            console.log('rendering TaskView');
            console.log(this);
            console.log(projects);

            locals.nodes = {};
    
            // Pass the data to TaskView
            createApp({
                render: () => h(TaskView, { docs: this.data, projects: projects.message })
            }).mount(container);
        }
    
    
    }
};

// Override the global ListViewSelect with TaskViewSelect
frappe.views.ListViewSelect = frappe.views.TaskViewSelect;
