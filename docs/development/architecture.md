---
title: How it works
description: "The design behind ERPNext TaskView: how the desk tree and timers talk to the server, how budgets are computed, and how the portal checks access."
nav_title: How it works
order: 10
updated: 2026-10-06
---

This page describes the design behind the code, for developers. For commands and the build, see [Develop ERPNext TaskView](README.md).

## The pieces

| Piece | Built with | Entry point |
| --- | --- | --- |
| Task View | Vue 3 and `@he-tree/vue` for the tree, `vue3-side-panel` for the side panel, mounted inside Frappe's list view | `erpnext_taskview/public/js/taskview.bundle.ts` |
| Timer dock | Vue 3, mounted once on every desk page | `erpnext_taskview/public/js/timerdock.bundle.ts` |
| Client portal | Vue 3, Vue Router, frappe-ui and Tailwind 3, served at `/projects` | `portal/src/main.ts` |
| Python API | Frappe whitelisted methods, Pydantic models, the Frappe Query Builder | `erpnext_taskview/erpnext_taskview/api.py` and `erpnext_taskview/portal/api.py` |

`taskview.bundle.ts` registers a list view named `tasks` and subclasses Frappe's `ListView` (`TasksView`) to mount the tree in place of the result list. It also overrides Frappe's view menu so that Task and Project offer **Task View** next to **List**, and relabels the `idx` sort as **Manual**. The two property settings in `custom/task.json` and `custom/project.json` make `Tasks` the default view for each document.

## The desk API

`api.get` is the one read. It returns flat lists of projects and tasks and leaves building the tree to the browser: the lists arrive already sorted, by `idx` unless the list view says otherwise, and the browser attaches each task to its parent in one pass, which keeps that order among siblings. It hides Completed and Cancelled tasks unless the list has a status filter, applies the list's own filters, adds each task's ToDo for the current user (the pin), and merges in budgets. It also returns the current user's pinned tasks that have no project yet, which the tree skips and the Pinned view lists.

Every mutation goes through one of a small set of endpoints, and each returns a fresh `get` response so the browser never needs a follow-up read. `save_doc` takes a JSON `SaveDocRequest` and routes on the document's `doctype`:

| Doctype | What it does |
| --- | --- |
| Project | Inserts or renames, and rewrites the project order |
| Task | Inserts or updates, re-parents with its subtasks and rewrites sibling order |
| Timesheet Detail | Runs every timer operation |

The timer operation is inferred from the fields in the payload rather than named. No `name` and no `to_time` starts a timer, no `name` with both times is a manual entry, a `name` with `to_time` stops, a `name` with `paused` set to 1 pauses, with `paused` set to 0 resumes, `delete` discards, and `update_description` saves only the text. The backend, not the browser, keeps at most one timer running: starting or resuming pauses the others.

Ordering uses an explicit list. After a drag the browser sends the names of the visible siblings in their new order, and `_write_interleaved_idx` writes a dense 1-based `idx`, re-anchoring hidden siblings (Completed, or filtered out) after the visible row they followed. Re-parenting is done with `frappe.db.set_value`, which leaves the nested set (`lft` and `rgt`) stale, so nothing here relies on it beyond a fallback sort. Walks over descendants follow `parent_task`.

The other endpoints are `bulk_create_tasks`, `delete_task`, `assign_task`, `unassign_task`, `pin_task`, `unpin_task`, `create_pinned_task`, `reorder_pinned_tasks`, `set_task_project`, `get_active_timers` and `budget.get_budget_summary`. They all live in `erpnext_taskview/erpnext_taskview/` and are called as `erpnext_taskview.erpnext_taskview.api.<name>`, apart from the budget summary in `erpnext_taskview.erpnext_taskview.budget`. Pinning is a ToDo for the user with the `pin` field set, created through Frappe's own assignment code, which is why pinning also assigns the task.

### Timers across two bundles

The tree and the dock are separate bundles, each with its own copy of Vue, so they cannot share reactive state. `timerStore.ts` keeps a local store in each bundle, publishes the timer list on `window.__erpnext_taskview_timers__` and signals changes with an `erpnext_taskview:timers_changed` event on `document`. Each bundle rebuilds its store when it hears the event. When an open timer disappears, the tree asks `get_budget_summary` for fresh budgets instead of rebuilding.

## Budgets

`budget.py` is shared by the desk and the portal. `compute_budgets` makes three queries however many projects it is given (tasks, closed time rows aggregated, open timers) and does the rollup in Python, children before parents, safe against cycles in `parent_task`. A task's budget is its `expected_time`, else the sum of its children's budgets, else none, and a Cancelled task contributes none. Logged hours include descendants. A project's budget is `budgeted_hours`, else the sum of its root tasks, and its logged hours are every row on the project.

Open timers are rows with `to_time` empty and a `start_time`: they count their accumulated seconds plus the running segment unless paused. The desk passes `exclude_open_owner` so that the current user's own timers are left out of the server figure: the browser adds them live and nothing is counted twice. The user-facing rules are in [Hour budgets](../task-view/hour-budgets.md).

## ERPNext classes the app extends

`hooks.py` registers three overrides with `extend_doctype_class`.

- **Task.** `TaskviewTask` makes ERPNext's nested writes ignore permissions when, and only when, the outer save ignores them: closing assignments on completion or cancellation, adding a child to its parent's dependencies, and rescheduling dependent tasks. Those writes check permissions on their own, and a customer holds no Task permission.
- **Timesheet.** `TaskviewTimesheet.update_task_and_project` keeps ERPNext's time and costing refresh but only moves a task forward along Open, Working, Pending Review, Completed (`forward_status`). Cancelled and Template are never touched.
- **Timesheet Detail.** Typed fields for the timer state.

## The portal API

Customers are Website Users and hold no permissions on Project or Task, and `frappe.has_permission` never consults website permissions. So every portal endpoint first passes through `portal/access.py` and only then reads or writes with permission checks off:

- `is_staff` is true for System Users, who preview the portal with their own permissions.
- `get_customer_names` finds the customers a user belongs to, through a Contact (matched on its user, its email address or any row of its Email IDs, case-insensitively) or through the customer's Portal Users.
- `get_accessible_projects` returns the non-Cancelled projects the user may open: the project's own users, or projects of the user's customers. For staff it is whatever `frappe.get_list` allows, newest activity first.
- `assert_project_access` and `assert_task_access` raise one message for "missing" and "not yours", so names cannot be probed. A template task, or a task without a project, is never exposed.

The endpoints are all in `erpnext_taskview.portal.api`:

| Endpoint | Kind | Does |
| --- | --- | --- |
| `get_projects` | Read | Accessible projects with budgets and a count per board column |
| `get_project` | Read | Everything the overview, list and board need in one call: phases, task cards, recent activity and whether tasks can be created |
| `get_task` | Read | The panel: description, ancestors, comments, time log and attachments |
| `set_task_status` | Write (POST) | Moves a leaf task between the four board columns |
| `create_task` | Write (POST) | Adds a task, optionally under an open phase |
| `add_comment` | Write (POST) | Adds a comment as the current user |
| `upload_attachment` | Write (POST) | Saves a private file on a task |
| `download_file` | Read (GET) | Streams a file attached to a task or project the user can open |

`create_task`, `add_comment` and `upload_attachment` are rate limited to 60 calls per hour. Frappe's `rate_limit` decorator keys on the request's IP address and counts each endpoint separately.

A few details worth knowing:

- **Board columns.** ERPNext's daily job overwrites a late task's status with Overdue, losing the previous one, so `board_column` puts an Overdue task in Working if it has logged hours and in Open if not. The Overdue badge is shown for that status and for any open task whose expected end date has passed.
- **HTML.** What a customer writes is cleaned by `nh3` with an allow-list of tags: no `span` (so a customer cannot forge a desk @mention), no images and no styles. Descriptions and comments written in the desk go through Frappe's `sanitize_html`, and links and images that point at private files are rewritten to `download_file`, which a customer's browser can use.
- **Files.** Uploads are private Files attached to the Task. Customers are limited to Frappe's `ALLOWED_MIMETYPES`; staff are not. `download_file` allows a file only when the user may open the Task or Project it is attached to.
- **Notifications.** After a customer's write, `notify_team` creates a `Client Portal` notification through Frappe's `enqueue_create_notification`. Recipients come from `get_recipients`: the task's assignees, else its parent's, else the project team, restricted to enabled System Users and never the actor.
- **The page.** `www/projects.py` redirects a guest to `/login` with the address to return to, redirects the legacy `/projects?project=X` to `/projects/X`, commits the lazily created CSRF token before rendering (the first POST would otherwise fail), and builds the boot data: user, theme, the site's logo and name, and the portal menu without the routes the app replaces.

The shapes of the responses are the Pydantic models in `portal/models.py`, mirrored by hand in `portal/src/types.ts`.

## Customisations as data

`custom/project.json`, `custom/task.json`, `custom/timesheet_detail.json` and `custom/todo.json` hold the custom fields and property settings, with `sync_on_migrate` set so that a migration keeps them in step. Their effect is listed in [Configuration](../configuration.md#what-the-app-adds-to-your-site).
