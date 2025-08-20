// Type definitions for Frappe framework
declare global {
  interface Window {
    frappe: any;
  }
  
  var frappe: {
    call: (options: {
      method: string;
      args?: any;
      callback?: (response: any) => void;
      error?: (error: any) => void;
    }) => void;
    msgprint: (message: string) => void;
    show_alert: (options: { message: string; indicator?: string }) => void;
    session: {
      user: string;
    };
    db: {
      get_value: (doctype: string, filters: any, fieldname: string) => any;
      exists: (doctype: string, filters: any) => any;
    };
    get_doc: (doctype: string, name: string) => any;
    provide: (namespace: string) => void;
    new_doc: (doctype: string) => any;
    router: {
      list_views: string[];
      list_views_route: Record<string, string>;
    };
    views: any;
    ui: any;
  };
  
  var locals: {
    nodes: Record<string, boolean>;
  };
}

export {};