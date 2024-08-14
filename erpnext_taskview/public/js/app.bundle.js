frappe.provide("frappe.views");

let old_this;

// if (frappe.views.ListViewSelect.doctype === "Task") {
//     frappe.views.ListViewSelect.add_view_to_menu(
//         "Tasks",
//         () => {
//             this.set_route("tasks");
//         }
//     );
// }

frappe.views.TaskViewSelect = class TaskViewSelect extends frappe.views.ListViewSelect {
    setup_views() {
        // Start by calling the original setup_views to get the initial views object
        super.setup_views();
		
		if (this.doctype === "Task") {
			// Add the Task view to the views object
			this.add_view_to_menu(
				"Tasks",
				() => {
                    // console.log('this.page');
                    // console.log(this.page);
                    // console.log(this.list_view.data);
                    this.set_route("tasks");
					// Instantiate the custom TaskView
					// this.task_view = new frappe.views.TasksView({
					// 	doctype: this.doctype,
					// 	parent: this.parent,
					// 	page: this.page,
					// 	// the data already loaded with the default List view
					// 	data: this.list_view.data,
					// });
                    // current view handler
                    // () => {
                    //     // const accounts = this.get_email_accounts();
                    //     // let default_action;
                    //     // if (has_common(frappe.user_roles, ["System Manager", "Administrator"])) {
                    //     //     default_action = {
                    //     //         label: __("New Email Account"),
                    //     //         action: () => frappe.new_doc("Email Account"),
                    //     //     };
                    //     // }
                    //     // this.setup_dropdown_in_sidebar("Inbox", accounts, default_action);
                        
                    // }
				}
            );
		}
    }
};



//     // setup_views() {
//     //     super.setup_views();
//     //     this.task_view_select = new frappe.views.TaskViewSelect({
//     //         doctype: this.doctype,
//     //         parent: this.page.main,
//     //         page: this
//     //     });
//     // }
// };


frappe.router.list_views.push("tasks");
frappe.router.list_views_route["tasks"] = "Tasks";
// frappe.views.view_modes.push("Tasks");

// console.log(frappe.router);


// frappe.router.add_route("task-view", () => {
//     let view = new frappe.views.TaskView({
//         doctype: "Task", // or this.doctype
//         parent: frappe.container.page,
//     });
//     view.render();
// });

frappe.views.TasksView = class TasksView extends frappe.views.ListView {
    // constructor(opts) {
    //     console.log('TasksView');
    //     console.log(opts);
    //     super(opts);
    // }
    setup_defaults() {
        old_this = this;
        console.log('old_this1');
        console.log(old_this);
        super.setup_defaults();
        // console.log('setup_defaults');
        // console.log(this);
        this.page_title = __("Task View");
        this.page_name = "task-view";
        this.show_hide_filters = false;
        this.list_view_settings = {
            fields: null,
        };
        this.old_this = old_this;
        console.log('this.old_this2');
        console.log(this.old_this);
    }

    refresh() {
		let args = this.get_call_args();
		if (this.no_change(args)) {
			// console.log('throttled');
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

        console.log('this.old_this3');
        console.log(this.old_this);
        
        // console.log('setup_page1');
        // console.log(this);
        // console.log(this.page);
        // console.log(this.parent);
        // console.log(this.data);
        
        // this.page = this.parent.page || {};
        
        super.setup_page();
        // this.refresh();

        console.log('this.old_this4');
        console.log(old_this);

        this.data = this.old_this.data;
        console.log('data from old_this5');
        console.log(old_this.data);
        console.log(this.data);
        
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
    
                // Other dependent code can go here
                // console.log('setup_page2');
                // console.log(this);
            })
            .catch((error) => {
                console.error("Failed to get list settings:", error);
            });
    }
    
    // WE DON'T NEED SKELETONS.
    show_skeleton() {}
    hide_skeleton() {}
    
    render_list() {
		// clear rows
		// this.$result.find(".list-row-container").remove();
        console.log('render_list');
        console.log(this)

		// if (this.data.length > 0) {
		// 	// append rows
		// 	console.log(this.data);
		// }
	}

    // render() {
    //     super.render();
    //     this.render_list();
    // }
};

// Override the global ListViewSelect with TaskViewSelect
frappe.views.ListViewSelect = frappe.views.TaskViewSelect;
