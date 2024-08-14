(() => {
  // ../erpnext_taskview/erpnext_taskview/public/js/app.bundle.js
  frappe.provide("frappe.views");
  var old_this;
  frappe.views.TaskViewSelect = class TaskViewSelect extends frappe.views.ListViewSelect {
    setup_views() {
      super.setup_views();
      if (this.doctype === "Task") {
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
      old_this = this;
      console.log("old_this1");
      console.log(old_this);
      super.setup_defaults();
      this.page_title = __("Task View");
      this.page_name = "task-view";
      this.show_hide_filters = false;
      this.list_view_settings = {
        fields: null
      };
      this.old_this = old_this;
      console.log("this.old_this2");
      console.log(this.old_this);
    }
    refresh() {
      let args = this.get_call_args();
      if (this.no_change(args)) {
        return Promise.resolve();
      }
      this.freeze(true);
      return frappe.call(args).then((r) => {
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
      console.log("this.old_this3");
      console.log(this.old_this);
      super.setup_page();
      console.log("this.old_this4");
      console.log(old_this);
      this.data = this.old_this.data;
      console.log("data from old_this5");
      console.log(old_this.data);
      console.log(this.data);
      frappe.call("frappe.desk.listview.get_list_settings", {
        doctype: this.doctype
      }).then((doc) => {
        this.list_view_settings = doc.message || {};
        if (this.list_view_settings.fields === void 0) {
          this.list_view_settings.fields = null;
        }
        this.page.set_primary_action(__("New Task"), () => {
          frappe.new_doc("Task");
        });
      }).catch((error) => {
        console.error("Failed to get list settings:", error);
      });
    }
    show_skeleton() {
    }
    hide_skeleton() {
    }
    render_list() {
      console.log("render_list");
      console.log(this);
    }
  };
  frappe.views.ListViewSelect = frappe.views.TaskViewSelect;
})();
//# sourceMappingURL=app.bundle.VTX5VR7G.js.map
