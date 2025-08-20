export interface BackendHandlerResponse {
  message: any;
}

export interface NodeData {
  docName?: string;
  text?: string;
  parent?: string;
  project?: string;
  status?: string;
  isProject?: boolean;
  isBlank?: boolean;
  timerStatus?: string;
  timesheetDetail?: string;
  expanded?: boolean;
  autoFocus?: boolean;
  children?: NodeData[];
}

export interface UpdateObject {
  [key: string]: any;
}

export interface PremountFunction {
  (newDocs?: NodeData[]): void;
}

export default function useBackendHandler(premount: PremountFunction | null = null) {
  const callBackendHandler = (
    action: string, 
    node: NodeData | null, 
    updateObject: UpdateObject | null
  ): Promise<BackendHandlerResponse> => {
    return new Promise((resolve, reject) => {
      frappe.call({
        method: "erpnext_taskrunner.erpnext_taskrunner.backend_handler",
        args: {
          action: action,
          node: node,
          update_object: updateObject
        },
        callback: function(r: BackendHandlerResponse) {
          resolve(r); // Resolve the Promise when the response is returned
        },
        error: function(err: any) {
          reject(err); // Reject the Promise if there's an error
        }
      });
    });
  }

  const catchError = async (error: any): Promise<void> => {
    console.error('Error updating data:', error);
    frappe.msgprint(`Error updating data: ${error}`);
    try {
      if (premount) {
        const r = await callBackendHandler('get', null, null);
        premount(r.message);
      } else {
        console.error('No premount function provided');
        frappe.msgprint('No premount function provided');
      }
    } catch (error) {
      console.error('Error getting updated docs:', error);
      frappe.msgprint(`Error getting updated docs: ${error}`);
    }
  }

  return {
    catchError,
    callBackendHandler
  }
}