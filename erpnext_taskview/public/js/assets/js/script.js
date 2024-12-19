export default function useBackendHandler(premount = null) {

    const callBackendHandler = (action, node, updateObject) => {
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

    const catchError = async (error) => {
        console.error('Error updating data:', error);
        frappe.msgprint(`Error updating data: ${error}`);
        try {
            if (premount) {
                const r = await callBackendHandler('get', null, null);
                premount(newDocs = r.message);
            }
            else {
                console.error('No premount function provided');
                frappe.msgprint('No premount function provided');
            }
        }
        catch (error) {
            console.error('Error getting updated docs:', error);
            frappe.msgprint(`Error getting updated docs: ${error}`);
        }
    }

    return {
        catchError,
        callBackendHandler
    }
}