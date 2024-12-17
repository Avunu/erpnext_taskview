function call_backend_handler (args, callback) {
    frappe.call({
        method: "erpnext_taskview.erpnext_taskview.backend_handler",
        args: args,
        callback: callback
    });
}

export default call_backend_handler;