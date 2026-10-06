---
title: The client portal
description: What the customer portal at /projects shows and lets customers do, the pages it has, the limits it enforces, and how the team is told about customer activity.
nav_title: Client portal
order: 6
updated: 2026-10-06
---

The client portal is a page on your ERPNext site, at `/projects`, where customers follow their projects, see where the hours are going, and add tasks, comments and files without needing access to the desk. It ships in the same app as [Task View](../task-view/README.md) and shows the same budgets and time logs.

Two guides follow this overview:

- [Using the client portal](using-the-portal.md) is written for the customer.
- [Giving customers access](administering-access.md) is written for the administrator who grants it, and explains who can see what.

## Pages

| Address | Page |
| --- | --- |
| `/projects` | The projects you can open |
| `/projects/<project>` | Project overview: tasks per column, budget per phase and recent activity |
| `/projects/<project>/tasks` | Tasks as a list or a kanban board |
| `/projects/<project>/tasks/<task>` | A task's details, time log, files and comments, in a panel over the list |

`<project>` and `<task>` are the document names, such as `PROJ-0001`. Older ERPNext links such as `/projects?project=PROJ-0001` and the old `/project` list redirect to the new portal. Someone who is not signed in is sent to the login page and brought back afterwards.

The left sidebar lists the person's projects. Below them, an **Account** section carries the other portal pages your site has enabled in Portal Settings, such as orders, invoices and issues. The menu at the top of the sidebar has **My account** and **Log out**, and **Open desk** for staff. The sidebar shows your site's logo and application name, and the portal follows the person's desk theme setting (Light, Dark or Automatic).

## What customers can do

- Follow every project they have access to, with its status, budget and task counts.
- Read a task's description, time entries, files and the whole comment thread.
- Add a task, optionally under an open phase, unless the project is Completed or Cancelled.
- Comment on any task, and attach files.
- Move a task between Open, Working, Pending Review and Completed by dragging its card on the board or with the **Status** menu in the task panel. Phases follow their tasks and cannot be moved.

A customer holds no permissions on the Project or Task documents themselves. Every portal call is checked against [the access rules](administering-access.md#who-can-open-a-project) first, and only then reads or writes on the customer's behalf. This is why a customer can comment on a task without being able to open it in the desk.

## What stays out of sight

- Cancelled projects: they are not listed, and a customer cannot open one by its address.
- Template tasks: they are never shown or opened.
- Cancelled tasks are left out of the lists, the board and the counts.

## Limits the portal enforces

| Limit | Value |
| --- | --- |
| New tasks, comments and file uploads | 60 of each per hour from one IP address |
| File types a customer can attach | JPG, PNG, GIF, PDF, TXT, CSV and Microsoft Office documents |
| File size | 25 MB checked in the browser; your site's own limit applies on top |
| Comment and description formatting | Headings, bold, italic, strikethrough, lists, links, quotes and code blocks. Images cannot be pasted: attach them as files |
| Refresh | An open project reloads every minute while its tab is visible, and when the tab regains focus |

Staff who use the portal are not held to the list of file types.

## How the team is told

When a customer adds a task, comments, attaches a file or moves a task, the team gets a **Client Portal** notification in ERPNext, and an email according to each person's Notification Settings. The people notified are, in order of preference:

1. The people assigned to the task.
2. If nobody is, the people assigned to its parent phase.
3. If nobody is, the project team: the project owner, anyone assigned to the project, the project's users and staff assigned to its open tasks.

Only enabled staff accounts (System Users) are notified, never the person who made the change, and staff who work through the portal themselves do not trigger notifications.

> [!NOTE]
> Whether an email leaves your server depends on your site's outgoing email set-up and on each person's Notification Settings. That part was not tested for these docs.
