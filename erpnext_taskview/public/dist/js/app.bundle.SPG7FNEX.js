(() => {
  // ../erpnext_taskview/erpnext_taskview/public/js/app.bundle.js
  frappe.provide("frappe.views");
  frappe.views.TaskViewSelect = class TaskViewSelect extends frappe.views.ListViewSelect {
    setup_views() {
      super.setup_views();
      let views = {
        Task: {
          condition: this.doctype === "Task",
          action: () => {
            console.log("Task view selected");
            console.log(this);
            this.task_view = new frappe.views.TaskView({
              doctype: this.doctype,
              parent: this.page.main,
              page: this.page,
              data: this.list_view.data
            });
            this.task_view.render_list();
          }
        },
        List: {
          condition: true,
          action: () => this.set_route("list")
        },
        Report: {
          condition: true,
          action: () => this.set_route("report"),
          current_view_handler: () => {
            const reports = this.get_reports();
            let default_action = {};
            if (frappe.get_route().length > 3) {
              default_action = {
                label: __("Report Builder"),
                action: () => this.set_route("report")
              };
            }
            this.setup_dropdown_in_sidebar("Report", reports, default_action);
          }
        },
        Dashboard: {
          condition: true,
          action: () => this.set_route("dashboard")
        },
        Calendar: {
          condition: frappe.views.calendar[this.doctype],
          action: () => this.set_route("calendar", "default"),
          current_view_handler: () => {
            this.get_calendars().then((calendars) => {
              this.setup_dropdown_in_sidebar("Calendar", calendars);
            });
          }
        },
        Gantt: {
          condition: frappe.views.calendar[this.doctype],
          action: () => this.set_route("gantt")
        },
        Inbox: {
          condition: this.doctype === "Communication" && frappe.boot.email_accounts.length,
          action: () => this.set_route("inbox"),
          current_view_handler: () => {
            const accounts = this.get_email_accounts();
            let default_action;
            if (has_common(frappe.user_roles, ["System Manager", "Administrator"])) {
              default_action = {
                label: __("New Email Account"),
                action: () => frappe.new_doc("Email Account")
              };
            }
            this.setup_dropdown_in_sidebar("Inbox", accounts, default_action);
          }
        },
        Image: {
          condition: this.list_view.meta.image_field,
          action: () => this.set_route("image")
        },
        Tree: {
          condition: frappe.treeview_settings[this.doctype] || frappe.get_meta(this.doctype).is_tree,
          action: () => this.set_route("tree")
        },
        Kanban: {
          condition: this.doctype != "File",
          action: () => this.setup_kanban_boards(),
          current_view_handler: () => {
            frappe.views.KanbanView.get_kanbans(this.doctype).then(
              (kanbans) => this.setup_kanban_switcher(kanbans)
            );
          }
        },
        Map: {
          condition: this.list_view.settings.get_coords_method || this.list_view.meta.fields.find((i) => i.fieldname === "latitude") && this.list_view.meta.fields.find((i) => i.fieldname === "longitude") || this.list_view.meta.fields.find(
            (i) => i.fieldname === "location" && i.fieldtype == "Geolocation"
          ),
          action: () => this.set_route("map")
        }
      };
      let ammended_views = frappe.views.view_modes;
      ammended_views.unshift("Task");
      ammended_views.forEach((view) => {
        if (views[view] && this.current_view !== view && views[view].condition) {
          this.add_view_to_menu(view, views[view].action);
        }
        if (views[view] && this.current_view == view) {
          views[view].current_view_handler && views[view].current_view_handler();
        }
      });
    }
  };
  frappe.views.TaskView = class TaskView extends frappe.views.ListView {
    setup_defaults() {
      super.setup_defaults();
      this.page_title = __("Task View");
      this.page_name = "task-view";
      this.show_hide_filters = false;
    }
    setup_page() {
      super.setup_page();
      console.log(this);
      this.page.set_primary_action(__("New Task"), () => {
        frappe.new_doc("Task");
      });
    }
    show_skeleton() {
    }
    hide_skeleton() {
    }
    render_list() {
      console.log(this);
    }
  };
  frappe.views.ListViewSelect = frappe.views.TaskViewSelect;
})();
//# sourceMappingURL=app.bundle.SPG7FNEX.js.map
