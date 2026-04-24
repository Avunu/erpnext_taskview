// Type definitions for Frappe framework
declare global {
  interface Window {
    frappe: typeof frappe;
  }

  interface FrappeMeta {
    name: string;
    doctype: string;
    istable?: 0 | 1;
    hide_toolbar?: 0 | 1;
    in_dialog?: 0 | 1;
    is_submittable?: 0 | 1;
    track_changes?: 0 | 1;
    quick_entry?: 0 | 1;
    fields: FrappeDocField[];
    [key: string]: any;
  }

  interface FrappeDocField {
    fieldname: string;
    fieldtype: string;
    label?: string;
    options?: string;
    reqd?: 0 | 1;
    read_only?: 0 | 1;
    hidden?: 0 | 1;
    in_list_view?: 0 | 1;
    in_filter?: 0 | 1;
    [key: string]: any;
  }

  interface FrappeDialogField {
    label?: string;
    fieldname: string;
    fieldtype: string;
    default?: any;
    options?: string;
    reqd?: 0 | 1 | boolean;
    read_only?: 0 | 1 | boolean;
    hidden?: 0 | 1 | boolean;
    depends_on?: string;
    description?: string;
    get_query?: () => { filters: Record<string, any> };
  }

  interface FrappeDialogOptions {
    title: string;
    fields?: FrappeDialogField[];
    size?: "small" | "large" | "extra-large";
    primary_action_label?: string;
    primary_action?: (values: Record<string, any>) => void;
    secondary_action_label?: string;
    secondary_action?: () => void;
    minimizable?: boolean;
  }

  interface FrappeDialogFieldInstance {
    /** The field's descriptor / definition object. Mutate to change behaviour (e.g. add onchange). */
    df: FrappeDialogField & {
      onchange?: () => void;
      [key: string]: any;
    };
    refresh(): void;
    set_value(value: any): void;
    get_value(): any;
  }

  interface FrappeDialog {
    show(): void;
    hide(): void;
    get_value(fieldname: string): any;
    set_value(fieldname: string, value: any): Promise<void>;
    get_field(fieldname: string): FrappeDialogFieldInstance;
    clear(): void;
    set_title(title: string): void;
    /** Keyed map of every field instance in the dialog, indexed by fieldname. */
    fields_dict: Record<string, FrappeDialogFieldInstance>;
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
      fields: FrappeDialogField[],
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
      set_value: (doctype: string, name: string, fieldname: string, value: any) => Promise<void>;
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
      on: (
        doctype: string,
        fieldname: string,
        handler: (fieldname: string, value: unknown, doc: any) => void,
      ) => void;
      off: (doctype: string, fieldname: string) => void;
      get_doc_title: (doc: Record<string, any>) => string;
    };

    get_doc: <T extends Record<string, any> = Record<string, any>>(
      doctype: string,
      name: string,
    ) => T;
    get_meta: (doctype: string) => FrappeMeta;
    meta: {
      get_label: (doctype: string, fieldname: string) => string;
      [key: string]: any;
    };
    provide: (namespace: string) => void;
    new_doc: (doctype: string, options?: Record<string, unknown>) => void;

    router: {
      list_views: string[];
      list_views_route: Record<string, string>;
    };

    get_route: () => string[];
    get_route_str: () => string;

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
      Dialog: new (options: FrappeDialogOptions) => FrappeDialog;
      toolbar: any;
      SortSelector: new (opts: {
        parent: any;
        doctype?: string;
        args?: Record<string, any>;
        change?: (sort_by: string, sort_order: string) => void;
        onchange?: (sort_by: string, sort_order: string) => void;
        [key: string]: any;
      }) => {
        sort_by: string;
        sort_order: string;
        args: { options: Array<{ fieldname: string; label?: string }>; [key: string]: any };
        wrapper: any;
        labels: Record<string, string>;
        doctype: string;
        set_value(sort_by: string, sort_order: string): void;
        get_label(fieldname: string): string;
        [key: string]: any;
      };
      TaskViewSortSelector: any;
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
