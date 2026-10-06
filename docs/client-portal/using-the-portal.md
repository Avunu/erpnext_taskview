---
title: Using the client portal
description: "A guide for clients to the project portal: sign in, read the overview and the hours meter, work with tasks on a list or board, and comment or attach files."
nav_title: Using the portal
order: 7
updated: 2026-10-06
---

The client portal is a page on the ERPNext site of the team you work with, where you can follow your projects, see where the hours are going, and add tasks, comments and files without leaving the browser. This guide is written for a client who has been given access. If you do not have access yet, ask that team: the administrator's steps are in [Giving customers access](administering-access.md).

## Sign in

Open the `/projects` page on the site, for example `https://erp.example.com/projects`, and sign in with the account you were given. If you open the page while signed out, you are sent to the login page first and brought back to `/projects` afterwards.

The left sidebar lists your projects. Below them, an **Account** section holds the other pages the team has switched on, such as orders, invoices and issues. The menu at the top of the sidebar has **My account** and **Log out**.

## What you can see

### Which projects appear

You see a project when any one of these is true:

- Your Contact is linked to the project's customer.
- You are listed in the **Portal Users** of that customer.
- You are listed in the **Users** of the project itself.

Cancelled projects are not listed. If a project name is wrong or belongs to someone else, the portal answers "You do not have access to this project." in both cases, so nobody can find out which projects exist.

### The project list

`/projects` shows one card per project, most recently updated first. Each card has the project title, its ID and customer, a status badge, an hours meter, how many tasks sit in each column (Open, Working, Pending Review and Completed) and when it was last updated. If you see "You don't have any projects yet.", nothing has been shared with you.

### The project overview

Click a project to open its **Overview** tab. It has three parts:

- **Tasks:** the four counts above. Click one to jump to the board.
- **Phases:** each top-level group of tasks, with "X of Y tasks done" and its own hours meter. Click a phase to see only its tasks.
- **Recent activity:** the latest comments, files, status changes, time entries and new tasks, newest first.

### Reading the hours meter

A meter reads like `12.5 / 20 h`. It turns amber at 80% of the budget and red once the hours logged go over it. Hover over it to see how much is left or how far over you are.

- A task's budget is its **Expected Time**. If a task has none, the portal adds up its subtasks.
- A project's budget is its **Budgeted Hours**. If that is blank, the portal adds up the top-level tasks.
- Logged hours are live. They include draft and submitted timesheets, timers that are running now, and everything logged on subtasks.

Work with hours logged but no budget shows the hours alone, such as `12 h`.

### Tasks as a list or a board

The **Tasks** tab has a **List** and a **Board** switch. Your choice is kept in the address (`?view=board`), so you can bookmark or share the link.

- **List:** an indented tree, with each phase followed by its tasks. A row shows comment and file counts, the due date, an hours meter and a status badge.
- **Board:** four columns, Open, Working, Pending Review and Completed. Only tasks are cards. A card shows its phase, any Overdue, High or Urgent badge, its due date, its meter, who it is assigned to and how many comments and files it has.

Use the phase menu and the search box (it matches a title or a task ID) to narrow what you see. Cancelled tasks and internal task templates are never listed.

A task past its due date, or one ERPNext has marked Overdue, gets a red **Overdue** badge. A task that ERPNext has marked Overdue is placed on the board in Working if hours have been logged on it, and in Open if not.

The project reloads itself every minute while the tab is visible, and again when you come back to the browser window.

### The task panel

Click any task to open its panel. The ID in the header and the breadcrumb show where the task sits under its phase. The panel holds:

- **Status, priority, due date and assignees.**
- **Time budget**, when the task has one.
- **Description**, as written by the team.
- **Files** attached to the task.
- **Time logged:** a table of date, who, the work done and hours, with a total. A **Not billed** badge marks time that will not be invoiced, and **In progress** marks a timer that is running now. The log covers the task and all of its subtasks.
- **Comments:** the whole conversation on the task. Replies from the team carry a **Team** badge.

Press Escape to close the panel.

## What you can do

### Add a task

Click **New task** at the top of the project. Give it a title, and optionally a phase, a priority (Low, Medium, High or Urgent) and a description. New tasks start as Open and go to the end of their phase, and the panel opens on the new task.

You can only add tasks under an open phase, and not at all once the project is Completed or Cancelled. When the project is closed the **New task** button is hidden.

### Comment

Open a task, type in the editor at the bottom of the panel and click **Comment**. Your comment is visible to everyone with access to the project, including the team.

The editor offers headings, bold, italic, strikethrough, bulleted and numbered lists, links, quotes and code blocks. Images cannot be pasted into a comment or description: attach them as files instead.

### Attach files

Click **Attach file** in the panel. Files are stored privately and can be opened only by people who can open that task. You can attach JPG, PNG, GIF, PDF, TXT and CSV files and Microsoft Office documents, up to 25 MB each. The site may set a lower limit. Images show a thumbnail, PDFs and images open in the browser, and other types download.

### Move a task between statuses

Drag a card to another column on the board, or use the **Status** menu in the task panel. Moving a task to Completed records the date and who did it, and moving it back clears that. Phases cannot be moved, since they follow their tasks.

The move is refused, with a message, when the site's rules do not allow it, for example when a task that this one depends on is not yet completed or cancelled. The board then returns the card to where it was.

## Who is told

When you add a task, comment, attach a file or move a task, the team is notified in ERPNext and may be emailed. They see your name and what you did.

## If something does not work

| You see | What it means |
| --- | --- |
| "You do not have access to this project." | The project does not exist or is not shared with you. Ask the team. |
| "This project is closed to new tasks." | The project is Completed or Cancelled. |
| "Tasks can only be added under an open phase of this project." | Pick a phase that is not Completed, or choose no phase. |
| "Files must be 25 MB or smaller." | Make the file smaller, or share it another way. |
| "You can only upload JPG, PNG, GIF, PDF, TXT, CSV or Microsoft documents." | Convert the file to one of those types. |
| "You hit the rate limit because of too many requests. Please try after sometime." | You, or someone on the same network, added 60 tasks, 60 comments or 60 files within an hour. Wait a little. |
