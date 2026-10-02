// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/** Typed wrappers over `erpnext_taskview.portal.api` (see that module for access rules). */

import type {
  NewTaskArgs,
  PortalComment,
  PortalProject,
  PortalProjectDetail,
  PortalTaskDetail,
} from "./types";

const METHOD = "erpnext_taskview.portal.api.";

/** A failed API call, carrying Frappe's user-facing messages. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly messages: string[],
    readonly excType?: string,
  ) {
    super(message);
  }
}

/**
 * POST to a whitelisted method and resolve its `message`.
 *
 * Not frappe-ui's `call()`: that pins `X-Frappe-Site-Name` to the browser's
 * hostname, which picks the wrong site (or none) whenever the public host
 * differs from the site name.  Here the Host header decides, as for any page.
 */
async function call<T>(method: string, args: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(`/api/method/${method}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json; charset=utf-8",
      "X-Frappe-CSRF-Token": (window as unknown as { csrf_token?: string }).csrf_token ?? "",
    },
    body: JSON.stringify(args),
  });
  let data: {
    message?: T;
    _server_messages?: string;
    exc_type?: string;
    exception?: string;
  } | null = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON body (proxy error page and the like)
  }
  if (res.ok && data) return data.message as T;

  const messages = serverMessages(data?._server_messages);
  const fallback =
    data?.exception?.split(": ").slice(1).join(": ") || `${res.status} ${res.statusText}`;
  throw new ApiError(messages[0] || fallback, res.status, messages, data?.exc_type);
}

export const UPLOAD_ENDPOINT = `/api/method/${METHOD}upload_attachment`;

export function getProjects(): Promise<PortalProject[]> {
  return call(METHOD + "get_projects");
}

export function getProject(project: string): Promise<PortalProjectDetail> {
  return call(METHOD + "get_project", { project });
}

export function getTask(task: string): Promise<PortalTaskDetail> {
  return call(METHOD + "get_task", { task });
}

export function setTaskStatus(
  task: string,
  status: string,
): Promise<{ name: string; status: string }> {
  return call(METHOD + "set_task_status", { task, status });
}

export function createTask(args: NewTaskArgs): Promise<{ name: string }> {
  return call(METHOD + "create_task", { ...args });
}

export function addComment(task: string, content: string): Promise<PortalComment> {
  return call(METHOD + "add_comment", { task, content });
}

/** Messages from a raw Frappe error body's `_server_messages` (as the file uploader rejects with). */
function serverMessages(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    return (JSON.parse(raw) as string[]).map((m) => {
      try {
        return JSON.parse(m).message as string;
      } catch {
        return m;
      }
    });
  } catch {
    return [];
  }
}

/** Best human-readable message from a frappe-ui `call()` or upload rejection. */
export function errorMessage(error: unknown): string {
  const e = error as { messages?: string[]; message?: string; _server_messages?: string } | null;
  const text =
    e?.messages?.find(Boolean) ||
    serverMessages(e?._server_messages).find(Boolean) ||
    e?.message ||
    "Something went wrong";
  // Server messages may carry HTML (e.g. <strong> from frappe.bold).
  const div = document.createElement("div");
  div.innerHTML = text;
  return div.textContent || text;
}
