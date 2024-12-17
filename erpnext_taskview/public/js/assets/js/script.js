export default function callBackendHandler (action, node, updateObject) {
    frappe.call({
        method: "erpnext_taskview.erpnext_taskview.backend_handler",
        args: {
            action: action,
            node: node,
            update_object: updateObject
        },
        callback: function(r) {
            return r
        }
    });
}
