---
title: Configuration
description: The settings that shape TaskView for ERPNext, the hook that chooses which Timesheet receives time, and a reference of everything the app adds to a site.
nav_title: Configuration
order: 2
updated: 2026-10-26
---

TaskView has no settings page of its own. It is configured through fields on documents you already use, a few standard ERPNext settings, and one hook for developers. This page lists them, then lists everything the app adds to your site.

## For staff and project managers

| Setting                      | Where                              | What it does                                                                                                                                                                                                |
| ---------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Expected Time (in hours)** | Task form                          | The task's hour budget. Without one, the task uses the sum of its subtasks. See [Hour budgets](task-view/hour-budgets.md).                                                                                  |
| **Budgeted Hours**           | Project form, below Estimated Cost | The project's hour budget. Without one, the project uses the sum of its top-level tasks.                                                                                                                    |
| **User ID**                  | Employee form                      | Timers log to the Employee whose **User ID** is the person's login, so each person who times work needs one.                                                                                                |
| **Roles**                    | User form                          | To time a task or log time on it, a person needs read on its Project and write on the Task. To change a task or project in the tree, they need write on it. ERPNext's **Projects User** gives all of these. |
| **Customer**                 | Project form                       | Decides which customer's contacts and portal users can see the project in the [client portal](client-portal/administering-access.md).                                                                       |

The side panel in Task View opens the Task or Project form, so these are one click from the tree.

## For administrators

| Setting                                                        | Where                                                                              | What it does                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Customer access                                                | Customer: **Portal Users**; **Contact** linked to the Customer; Project: **Users** | Who may open which project on the portal. See [Giving customers access](client-portal/administering-access.md).                                                                                                                                                                           |
| **Default Portal Home**, **Portal Menu**                       | Portal Settings                                                                    | Where customers land after signing in, and whether ERPNext's own **Projects** row (`/project`) is still listed. Installing the app sets the first to `/projects` (unless the site already has one) and unticks the second: see [Install and upgrade](install.md#what-installing-sets-up). |
| **Client Portal** Notification Type                            | Notification Type                                                                  | The kind of notification the team receives when a customer acts on the portal. Whether it also goes out by email follows each user's **Notification Settings**.                                                                                                                           |
| Outgoing email                                                 | Email Account                                                                      | Notification emails need your site's outgoing email to be set up. This was not tested for these docs.                                                                                                                                                                                     |
| **Ignore User Time Overlap**, **Ignore Employee Time Overlap** | Projects Settings                                                                  | Both must be ticked for timers to work. A paused timer's time log overlaps the timer that ran in the meantime, and ERPNext otherwise refuses the Timesheet. See [Allow overlapping time logs](install.md#allow-overlapping-time-logs).                                                    |
| File size limit                                                | Site configuration                                                                 | The portal rejects files over 25 MB in the browser and leaves the real limit to your site's own file size setting.                                                                                                                                                                        |

The app reads no keys of its own from `site_config.json`. The one site setting it looks at is Frappe's `developer_mode`, and only for the portal's development server: see [Development](development/README.md#commands).

Some behaviour is fixed in the code and cannot be changed from the desk: the four board columns (Open, Working, Pending Review, Completed), the portal's list of accepted file types for customers, the limits of 60 new tasks, 60 comments and 60 uploads per hour from one IP address, and the one-minute refresh of an open project. [The client portal](client-portal/README.md) describes each.

## Roles and permissions the app checks

The app adds no roles. It checks ERPNext's own permissions, and the portal its own access rules:

| Action                                                  | What is checked                                                                                                                                                                                  |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Start, pause, stop, discard or log time                 | Read on the Project and write on the Task. A new row's Task must belong to that Project. The Timesheet must be a draft and be your Employee's, one you created, or one your role lets you write. |
| Rename, re-status or drag a task or project in the tree | Write on each Task or Project the change touches: for a drag, the task, its new parent and every subtask that moves with it, and read on the Project it moves to.                                |
| Add a subtask                                           | Write on the parent task. New documents are inserted normally, so ERPNext checks create.                                                                                                         |
| Tick **Completed** in the timer dialogs                 | The Task is saved as a normal document, so write on it and ERPNext's validation apply.                                                                                                           |
| Open a project or task on the portal                    | The access rules in [Giving customers access](client-portal/administering-access.md#who-can-open-a-project), for Website Users. System Users get their normal ERPNext permissions.               |
| See the **Projects** entry in the portal menu           | The **Customer** role.                                                                                                                                                                           |

## Choose which Timesheet receives time

By default, a timer adds its time to the draft Timesheet that matches the Employee and the project, and creates one when there is none. A developer can replace that choice with the `taskview_find_timesheet` hook, for example to keep one Timesheet per calendar month per project.

The hook is called with the keyword arguments `employee` and `project` and returns the name of a draft Timesheet to reuse, or `None` to create a new one. `employee` is `None` when the user has no Employee. If several apps register the hook, the last registered one is used.

```python
# hooks.py of your own app
taskview_find_timesheet = "my_app.timesheets.find_timesheet"
```

```python
# my_app/timesheets.py
import frappe


def find_timesheet(employee: str | None, project: str) -> str | None:
	return frappe.db.exists(
		"Timesheet",
		{"employee": employee, "parent_project": project, "docstatus": 0},
	)
```

> [!WARNING]
> Name the parameters `employee` and `project` exactly: TaskView passes them by keyword. Return only a Timesheet that is still a draft, because the timer appends a row to whatever you return and saves it.

## What the app adds to your site

This is the complete list, so you can see what a bench migration changes.

### Fields and property settings

| Document         | Change                                                                                                                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project          | A **Budgeted Hours** field (`budgeted_hours`, Float, not negative) after Estimated Cost. Its description reads "Hours budgeted for the whole project. Leave 0 to use the sum of the task estimates." |
| Project          | Default view set to Task View. **Customer** is shown in the list view, the standard filters, the filters and the preview.                                                                            |
| Task             | Default view set to Task View. **Track Changes** is switched on, which records the status changes the portal's activity feed shows. **Show Title Field in Link** is switched on.                     |
| Timesheet Detail | Four read-only fields: **Paused**, **Start Time**, **Paused Time** (`paused_time_in_seconds`, editable after submit) and **Task Subject** (fetched from the task). They hold the timer state.        |
| ToDo             | A read-only **Pinned** check (`pin`) after Priority. Pinned tasks are ToDos with this box set.                                                                                                       |

### Behaviour

| Where             | Change                                                                                                                                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Task              | The Task class is extended so that the portal can save a task, close its assignments and update its parent and dependent tasks on behalf of a customer, who holds no Task permission. Saves that do not ignore permissions take ERPNext's normal path. |
| Timesheet         | Submitting a Timesheet moves a task **forward only**: Open becomes Working, and a task in Pending Review or Completed stays where it is. ERPNext's own code would set every task back to Working.                                                      |
| Timesheet Detail  | The class carries the typed timer fields above. Timer calls check read on the Project, write on the Task, that a new row's Task is in its Project, and access to the draft Timesheet before they write a row.                                          |
| Notification Type | A **Client Portal** type is created when the app is installed or the site is migrated, and installing the app adds it to existing users' email preferences.                                                                                            |
| Website           | `/projects` and everything under it is served by the portal. The portal menu gets a **Projects** entry for users with the Customer role. `/project` redirects to `/projects`.                                                                          |
| Desk              | The Task View and timer dock bundles load on every desk page.                                                                                                                                                                                          |
| Install, migrate  | `after_install` runs the portal set-up described in [Install and upgrade](install.md#what-installing-sets-up). `after_migrate` creates the **Client Portal** Notification Type if it is missing.                                                       |

The app adds no DocTypes, roles, reports, workspaces or scheduled jobs, and uses no `doc_events`, `override_doctype_class` or `doctype_js`.

### Endpoints

These whitelisted methods are what the desk and the portal call. Each checks permissions as described above.

| Method                                                                                                                           | Used by                                                           |
| -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `erpnext_taskview.erpnext_taskview.api.get`                                                                                      | Task View: the projects and tasks of the tree                     |
| `erpnext_taskview.erpnext_taskview.api.save_doc`                                                                                 | Task View: saving a project or task, and every timer operation    |
| `erpnext_taskview.erpnext_taskview.api.bulk_create_tasks`, `delete_task`, `assign_task`, `unassign_task`                         | Task View: adding subtasks in bulk, deleting, assigning           |
| `erpnext_taskview.erpnext_taskview.api.pin_task`, `unpin_task`, `create_pinned_task`, `reorder_pinned_tasks`, `set_task_project` | The **Pinned** view                                               |
| `erpnext_taskview.erpnext_taskview.api.get_active_timers`                                                                        | The timer dock                                                    |
| `erpnext_taskview.erpnext_taskview.api.get_task_descriptions`                                                                    | Copying tasks as Markdown                                         |
| `erpnext_taskview.erpnext_taskview.budget.get_budget_summary`                                                                    | Refreshing the budget meters                                      |
| `erpnext_taskview.portal.api.get_projects`, `get_project`, `get_task`                                                            | The portal's pages                                                |
| `erpnext_taskview.portal.api.set_task_status`, `create_task`, `add_comment`, `upload_attachment`                                 | The portal's writes (POST only)                                   |
| `erpnext_taskview.portal.api.download_file`                                                                                      | Files and images on the portal (GET only)                         |
| `erpnext_taskview.www.projects.get_context_for_dev`                                                                              | The portal's development server, on a site in developer mode only |

## Related

- [Install and upgrade](install.md)
- [How it works](development/architecture.md) for the code behind each row above
