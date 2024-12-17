export default function callBackendHandler(action, node, updateObject) {
    return new Promise((resolve, reject) => {
        frappe.call({
            method: "erpnext_taskview.erpnext_taskview.backend_handler",
            args: {
                action: action,
                node: node,
                update_object: updateObject
            },
            callback: function(r) {
                resolve(r); // Resolve the Promise when the response is returned
            },
            error: function(err) {
                reject(err); // Reject the Promise if there's an error
            }
        });
    });
}