---
title: Configuration
description: The settings that shape ERPNext TaskView, the hook that chooses which Timesheet receives time, and a reference of everything the app adds to a site.
nav_title: Configuration
order: 2
updated: 2026-10-06
---

TaskView has no settings page of its own. It is configured through fields on documents you already use, a few standard ERPNext settings, and one hook for developers. This page lists them, then lists everything the app adds to your site.

## For staff and project managers

| Setting | Where | What it does |
| --- | --- | --- |
| **Expected Time (in hours)** | Task form | The task's hour budget. Without one, the task uses the sum of its subtasks. See [Hour budgets](task-view/hour-budgets.md). |
| **Budgeted Hours** | Project form, below Estimated Cost | The project's hour budget. Without one, the project uses the sum of its top-level tasks. |
| **User ID** | Employee form | Timers log to the Employee whose **User ID** is the person's login, so each person who times work needs one. |
| **Customer** | Project form | Decides which customer's contacts and portal users can see the project in the [client portal](client-portal/administering-access.md). |

The side panel in Task View opens the Task or Project form, so these are one click from the tree.

## For administrators

| Setting | Where | What it does |
| --- | --- | --- |
| Customer access | Customer: **Portal Users**; **Contact** linked to the Customer; Project: **Users** | Who may open which project on the portal. See [Giving customers access](client-portal/administering-access.md). |
| **Default Portal Home**, **Portal Menu** | Portal Settings | Where customers land after signing in, and whether ERPNext's own **Projects** row (`/project`) is still listed. A fresh install leaves both to you: see [Install and upgrade](install.md#finish-the-portal-set-up). |
| **Client Portal** Notification Type | Notification Type | The kind of notification the team receives when a customer acts on the portal. Whether it also goes out by email follows each user's **Notification Settings**. |
| Outgoing email | Email Account | Notification emails need your site's outgoing email to be set up. This was not tested for these docs. |
| File size limit | Site configuration | The portal rejects files over 25 MB in the browser and leaves the real limit to your site's own file size setting. |

Some behaviour is fixed in the code and cannot be changed from the desk: the four board columns (Open, Working, Pending Review, Completed), the portal's list of accepted file types for customers, the limits of 60 new tasks, 60 comments and 60 uploads per hour from one IP address, and the one-minute refresh of an open project. [The client portal](client-portal/README.md) describes each.

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

| Document | Change |
| --- | --- |
| Project | A **Budgeted Hours** field (`budgeted_hours`, Float, not negative) after Estimated Cost. Its description reads "Hours budgeted for the whole project. Leave 0 to use the sum of the task estimates." |
| Project | Default view set to Task View. **Customer** is shown in the list view, the standard filters, the filters and the preview. |
| Task | Default view set to Task View. **Track Changes** is switched on, which records the status changes the portal's activity feed shows. **Show Title Field in Link** is switched on. |
| Timesheet Detail | Four read-only fields: **Paused**, **Start Time**, **Paused Time** (`paused_time_in_seconds`, editable after submit) and **Task Subject** (fetched from the task). They hold the timer state. |
| ToDo | A read-only **Pinned** check (`pin`) after Priority. Pinned tasks are ToDos with this box set. |

### Behaviour

| Where | Change |
| --- | --- |
| Task | The Task class is extended so that the portal can save a task, close its assignments and update its parent and dependent tasks on behalf of a customer, who holds no Task permission. Saves that do not ignore permissions take ERPNext's normal path. |
| Timesheet | Submitting a Timesheet moves a task **forward only**: Open becomes Working, and a task in Pending Review or Completed stays where it is. ERPNext's own code would set every task back to Working. |
| Timesheet Detail | The class carries the typed timer fields above. |
| Notification Type | A **Client Portal** type is created when the app is installed or the site is migrated. |
| Website | `/projects` and everything under it is served by the portal. The portal menu gets a **Projects** entry for users with the Customer role. `/project` redirects to `/projects`. |
| Desk | The Task View and timer dock bundles load on every desk page. |

## Related

- [Install and upgrade](install.md)
- [How it works](development/architecture.md) for the code behind each row above
