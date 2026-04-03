// Type definitions for Frappe framework
declare global {
  interface Window {
    frappe: typeof frappe;
  }

  var frappe: {
    call: <T = any>(options: {
      method: string;
      args?: Record<string, unknown>;
      async?: boolean;
      freeze?: boolean;
      freeze_message?: string;
      callback?: (response: { message: T }) => void;
      error?: (error: Error) => void;
    }) => Promise<{ message: T }>;

    xcall: <T = any>(method: string, args?: Record<string, unknown>) => Promise<T>;

    confirm: (message: string, onyes?: () => void, onno?: () => void) => void;

    prompt: (
      fields: Array<{
        label: string;
        fieldname: string;
        fieldtype: string;
        reqd?: boolean;
        default?: string;
      }>,
      callback: (values: Record<string, any>) => void,
      title?: string,
      primary_label?: string,
    ) => void;

    msgprint: (message: string | { message: string; title?: string; indicator?: string }) => void;
    show_alert: (options: { message: string; indicator?: string }, duration?: number) => void;

    throw: (message: string) => never;

    session: {
      user: string;
    };

    boot: {
      user: {
        name: string;
        full_name: string;
        user_image: string | null;
        email: string;
      };
    };

    db: {
      get_value: <T = any>(
        doctype: string,
        filters: string | Record<string, unknown>,
        fieldname: string | string[],
      ) => Promise<T>;
      get_list: <T = any>(doctype: string, args?: Record<string, unknown>) => Promise<T[]>;
      exists: (doctype: string, name: string | Record<string, unknown>) => Promise<boolean>;
      delete_doc: (doctype: string, name: string) => Promise<void>;
      count: (doctype: string, filters?: Record<string, unknown>) => Promise<number>;
    };

    utils: {
      escape_html: (text: string) => string;
      is_url: (text: string) => boolean;
      xss_sanitise: (text: string, options?: Record<string, unknown>) => string;
      get_absolute_url: (path: string) => string;
      is_mac: () => boolean;
    };

    model: {
      with_doctype: (doctype: string) => Promise<void>;
      with_doc: (doctype: string, name: string) => Promise<void>;
      can_read: (doctype: string) => boolean;
      can_write: (doctype: string) => boolean;
      can_delete: (doctype: string) => boolean;
      can_create: (doctype: string) => boolean;
    };

    get_doc: <T = any>(doctype: string, name: string) => Promise<T>;
    provide: (namespace: string) => void;
    new_doc: (doctype: string, options?: Record<string, unknown>) => void;

    router: {
      list_views: string[];
      list_views_route: Record<string, string>;
    };

    views: any;

    ui: {
      form: {
        Form: new (
          doctype: string,
          wrapper: HTMLElement,
          read_only: boolean,
          docname: string,
        ) => any;
      };
      toolbar: any;
      keys: {
        handlers: Record<string, ((e: KeyboardEvent) => void)[]>;
        add_shortcut: (options: {
          shortcut: string;
          action: (e: KeyboardEvent) => boolean | void;
          description?: string;
          page?: any;
          condition?: () => boolean;
          ignore_inputs?: boolean;
        }) => void;
        on: (key: string, handler: (e: KeyboardEvent) => void) => void;
        off: (key: string, page?: any) => void;
      };
    };
  };

  var locals: {
    nodes: Record<string, boolean>;
  };

  // Frappe translation helper
  function __(message: string, replace?: Record<string, string> | null, context?: string): string;
}

export {};
