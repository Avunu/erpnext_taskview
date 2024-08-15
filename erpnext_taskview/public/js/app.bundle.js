frappe.provide("frappe.views");
import { createApp, watchEffect, h } from "vue";
// import { createPinia } from "pinia";
// import { useStore } from "./store";
import TaskView from "./TaskView.vue";


frappe.views.TaskViewSelect = class TaskViewSelect extends frappe.views.ListViewSelect {
    setup_views() {
        // Start by calling the original setup_views to get the initial views object
        super.setup_views();
		
		if (this.doctype === "Task") {
			// Add the Task view to the views object
			this.add_view_to_menu(
				"Tasks",
				() => {
                    this.set_route("tasks");
				}
            );
		}
    }
};

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
        // set Task View as the current view
        // this.current_view = "Tasks";
        // add List to the list of views
        
    }

    refresh() {
		let args = this.get_call_args();
		if (this.no_change(args)) {
			return Promise.resolve();
		}
		this.freeze(true);
		// fetch data from server
		return frappe.call(args).then((r) => {
			// render
			this.prepare_data(r);
			this.toggle_result_area();
			this.before_render();
			this.render();
			this.after_render();
			this.freeze(false);
			this.reset_defaults();
			if (this.settings.refresh) {
				this.settings.refresh(this);
			}
		});
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
		// if (refresh_header) {
		// 	this.$result.find(".list-row-head").remove();
		// }
		// if (this.$result.find(".list-row-head").length === 0) {
		// 	// append header once
		// 	this.$result.prepend(this.get_header_html());
		// }
        this.$result.find(".list-row-head").remove();
	}
    
    render_list() {
        console.log('render_list');
        console.log(this);
    
        // Clear everything out of the result area
        this.$result.empty();
    
        if (this.data.length > 0) {
            // Make a new Vue container to hold the header and rows
            const container = document.createElement('div');
            this.$result.append(container);
    
            // Pass the entire data array to TaskView as docs
            createApp({
                render: () => h(TaskView, { docs: this.data })
            }).mount(container);
        }
    }    
    // render() {
    //     super.render();
    //     this.render_list();
    // }
};

// Override the global ListViewSelect with TaskViewSelect
frappe.views.ListViewSelect = frappe.views.TaskViewSelect;
