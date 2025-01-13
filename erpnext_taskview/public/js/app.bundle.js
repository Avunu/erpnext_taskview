frappe.provide("frappe.views");
frappe.provide("frappe.ui.toolbar");
frappe.provide("frappe.ui.form");
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

// custom form to handle the sidebar form
// frappe.ui.form.Form = class FrappeForm
frappe.ui.form.CustomForm = class CustomForm extends frappe.ui.form.Form {
    constructor(...args) {
        super(...args);
        // console.log("CustomForm initialized");
    }
    async is_new() {
        // if this.doc is null, see if the doc exists in the db 
        if (!this.doc) {
            let docExists = await frappe.db.exists(this.doctype, this.docname);
            if (docExists) {
                this.doc = await frappe.get_doc(this.doctype, this.docname);
                return false;
            } else {
                return true;
            }
        }
        return this.doc.__islocal;
    };
}

// custom toolbar to handle the sidebar form
frappe.ui.form.CustomToolbar = class CustomToolbar extends frappe.ui.form.Toolbar {
    constructor(...args) {
        super(...args);
        // console.log("CustomToolbar initialized");
    }

    async custom_form_get_doc_patch() {

        console.log("custom_form_get_doc_patch called");
        console.log('this.frm.doc', this.frm.doc);
        console.log('this.frm.doctype', this.frm.doctype);
        console.log('this.frm.docname', this.frm.docname);

        if (!this.frm.doc) {
            const docExists = await frappe.db.exists(this.frm.doctype, this.frm.docname);
            if (docExists) {
                // this.frm.doc = await frappe.get_doc(this.frm.doctype, this.frm.docname);
                const doc = await frappe.get_doc(this.frm.doctype, this.frm.docname);
                return doc;
            }
            else {
                return null;
            }
        }
        else {
            return this.frm.doc;
        }
    }

    async get_docinfo() {
        console.log("get_docinfo called");
        console.log('this.doctype', this.doctype);
        console.log('this.docname', this.docname);
		return frappe.model.docinfo[this.doctype][this.docname];
	}


    async refresh() {

        // custom code to try to get the doc if it doesn't in the frm yet
        // if (!this.frm.doc) {
        //     let docExists = await frappe.db.exists(this.frm.doctype, this.frm.docname);
        //     if (docExists) {
        //         this.frm.doc = await frappe.get_doc(this.frm.doctype, this.frm.docname);
        //     }
        // }
        this.frm.doc = await this.custom_form_get_doc_patch();

		this.make_menu();
		this.set_title();
		this.page.clear_user_actions();
		this.show_title_as_dirty();
		this.set_primary_action();

		if (this.frm.meta.hide_toolbar) {
			this.page.hide_menu();
		} else {
			if (this.frm.doc.__islocal) {
				this.page.hide_menu();
				this.print_icon && this.print_icon.addClass("hide");
			} else {
				this.page.show_menu();
				this.print_icon && this.print_icon.removeClass("hide");
			}
		}
	}

    async make_menu_items() {
        // Print
        const me = this;
        const p = this.frm.perm[0];
        // if (!this.frm.doc) {
        //     this.frm.doc = await frappe.get_doc(this.frm.doctype, this.frm.docname);
        // }
        this.frm.doc = await this.custom_form_get_doc_patch();
        const docstatus = cint(this.frm.doc.docstatus);
        const is_submittable = frappe.model.is_submittable(this.frm.doc.doctype);

        const print_settings = frappe.model.get_doc(":Print Settings", "Print Settings");
        const allow_print_for_draft = cint(print_settings.allow_print_for_draft);
        const allow_print_for_cancelled = cint(print_settings.allow_print_for_cancelled);

        if (
            !is_submittable ||
            docstatus == 1 ||
            (allow_print_for_cancelled && docstatus == 2) ||
            (allow_print_for_draft && docstatus == 0)
        ) {
            if (frappe.model.can_print(null, me.frm) && !this.frm.meta.issingle) {
                this.page.add_menu_item(
                    __("Print"),
                    function () {
                        me.frm.print_doc();
                    },
                    true
                );
                this.print_icon = this.page.add_action_icon(
                    "printer",
                    function () {
                        me.frm.print_doc();
                    },
                    "",
                    __("Print")
                );
            }
        }

        // email
        if (frappe.model.can_email(null, me.frm) && me.frm.doc.docstatus < 2) {
            this.page.add_menu_item(
                __("Email"),
                function () {
                    me.frm.email_doc();
                },
                true,
                {
                    shortcut: "Ctrl+E",
                    condition: () => !this.frm.is_new(),
                }
            );
        }

        // go to field modal
        this.page.add_menu_item(
            __("Jump to field"),
            function () {
                me.show_jump_to_field_dialog();
            },
            true,
            "Ctrl+J"
        );

        // Linked With
        if (!me.frm.meta.issingle) {
            this.page.add_menu_item(
                __("Links"),
                function () {
                    me.show_linked_with();
                },
                true
            );
        }

        // duplicate
        if (frappe.boot.user.can_create.includes(me.frm.doctype) && !me.frm.meta.allow_copy) {
            this.page.add_menu_item(
                __("Duplicate"),
                function () {
                    me.frm.copy_doc();
                },
                true,
                "Shift+D"
            );
        }

        // copy doc to clipboard
        this.page.add_menu_item(
            __("Copy to Clipboard"),
            function () {
                frappe.utils.copy_to_clipboard(JSON.stringify(me.frm.doc));
            },
            true
        );

        // rename
        if (this.can_rename()) {
            this.page.add_menu_item(
                __("Rename"),
                function () {
                    me.frm.rename_doc();
                },
                true
            );
        }

        // reload
        this.page.add_menu_item(
            __("Reload"),
            function () {
                me.frm.reload_doc();
            },
            true
        );

        // delete
        if (
            cint(me.frm.doc.docstatus) != 1 &&
            !me.frm.doc.__islocal &&
            !frappe.model.is_single(me.frm.doctype) &&
            frappe.model.can_delete(me.frm.doctype)
        ) {
            this.page.add_menu_item(
                __("Delete"),
                function () {
                    me.frm.savetrash();
                },
                true,
                {
                    shortcut: "Shift+Ctrl+D",
                    condition: () => !this.frm.is_new(),
                }
            );
        }

        this.page.add_menu_item(
            __("Remind Me"),
            () => {
                let reminder_maanger = new ReminderManager({ frm: this.frm });
                reminder_maanger.show();
            },
            true,
            {
                shortcut: "Shift+R",
                condition: () => !this.frm.is_new(),
            }
        );
        //
        // Undo and redo
        this.page.add_menu_item(
            __("Undo"),
            () => {
                this.frm.undo_manager.undo();
            },
            true,
            {
                shortcut: "Ctrl+Z",
                condition: () => !this.frm.is_form_builder(),
                description: __("Undo last action"),
            }
        );
        this.page.add_menu_item(
            __("Redo"),
            () => {
                this.frm.undo_manager.redo();
            },
            true,
            {
                shortcut: "Ctrl+Y",
                condition: () => !this.frm.is_form_builder(),
                description: __("Redo last action"),
            }
        );

        this.make_customize_buttons();

        // Auto Repeat
        if (this.can_repeat()) {
            this.page.add_menu_item(
                __("Repeat"),
                function () {
                    frappe.utils.new_auto_repeat_prompt(me.frm);
                },
                true
            );
        }

        // New
        if (p[CREATE] && !this.frm.meta.issingle && !this.frm.meta.in_create) {
            this.page.add_menu_item(
                __("New {0}", [__(me.frm.doctype)]),
                function () {
                    frappe.new_doc(me.frm.doctype, true);
                },
                true,
                {
                    shortcut: "Ctrl+B",
                    condition: () => !this.frm.is_new(),
                }
            );
        }
    }
}

frappe.views.TasksView = class TasksView extends frappe.views.ListView {

    prepare_data(r) {
        this.data = r.message;
    }

    setup_defaults() {
        super.setup_defaults();
        this.page_title = __("Task View");
        this.page_name = "task-view";
        this.show_hide_filters = false;
        this.list_view_settings = {
            fields: null,
        };
        this.method = "erpnext_taskview.erpnext_taskview.get"
        // TODO: set Task View as the current view in the dropdown and add list view to the list of views
        // use setup_view_menu() from base_list.js?

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
    show_skeleton() { }
    hide_skeleton() { }

    render_header(refresh_header = false) {
        this.$result.find(".list-row-head").remove();
    }

    render_list() {
        // Clear everything out of the result area
        this.$result.empty();

        // Make a new Vue container to hold the header and rows
        const container = document.createElement('div');
        this.$result.append(container);

        locals.nodes = {};

        // console.log(this.data);

        // Pass the data to TaskView
        createApp({
            render: () => h(TaskView, { docs: this.data })
        }).mount(container);

        // createApp({
        //     render: () => h(Sidebar, { data: this.data })
        // }).use(VueSidePanel).mount(sidebarElement);
    }
};

// Override the global ListViewSelect with TaskViewSelect
frappe.views.ListViewSelect = frappe.views.TaskViewSelect;

// Override the global Form with CustomForm
frappe.ui.form.Form = frappe.ui.form.CustomForm;

// Override the global Toolbar with CustomToolbar
frappe.ui.form.Toolbar = frappe.ui.form.CustomToolbar;
