---
title: Timers and timesheets
description: Start, pause and stop a timer on a task, confirm the time in the Log Timer dialog, and see where the hours land in ERPNext Timesheets.
nav_title: Timers
order: 4
updated: 2026-10-06
---

Timers live on task rows in [Task View](README.md). Every timer is a row in the time logs of an ordinary ERPNext Timesheet, so submitting, billing and reporting work as they do in stock ERPNext.

## Before you start

- The task needs a project. Project rows have no timer buttons, because time is always logged against a task. A pinned task that has no project yet cannot be timed until you [give it one](README.md#give-a-task-a-project).
- Your user must be the **User ID** of an Employee. Timesheets are created for that Employee.

## Time a task

1. Click the play button on a task row. The tree opens up to the task so you can see it.
2. Work. The floating timer dock appears on every desk page, not only in Task View, and shows each open timer with a live `HH:MM:SS` clock.
3. Click pause when you step away, and play to resume.
4. Click stop (the square) when you finish. The **Log Timer** dialog opens with the elapsed hours filled in.
5. Check the dialog and click **Submit**.

The stop button only appears on a row while it has a timer. Timers are kept on the server, so a running timer survives a page reload and is the same on every device you sign in from.

Only one timer runs at a time. Starting or resuming a timer pauses whichever one was running. Paused timers stay in the dock until you stop or discard them.

## The Log Timer dialog

Stopping pauses the clock first, then asks you to confirm.

| Field | Notes |
| --- | --- |
| Task | Defaults to the timed task. You can move the time to another task in the same project. |
| Activity Type | Optional. |
| Hrs | Filled from the clock. What you leave here is what gets logged, so edit it if the clock ran while you were away. |
| Description | What you did. |
| Is Billable | Marks the entry billable. |
| Billable Time | Appears when Is Billable is ticked, and starts at the same value as Hrs. |
| Completed | Marks the log complete and sets the task to Completed. |

**Cancel** closes the dialog and resumes the timer, even if you had paused it before you pressed stop.

If you tick **Completed** on a task that still has subtasks that are not Completed, the time is logged, the task is not completed, and a notice tells you how many subtasks are in the way. A Cancelled subtask counts as not Completed.

The row's To Time is set to its From Time plus the hours you confirmed, so the stored time range always agrees with the hours.

> [!NOTE]
> Stopping from a task row saves the **Billable Time** you enter. Stopping from a card in the dock does not send it. If Billable Time must differ from Hrs, stop from the task row.

## The timer dock

The dock is a small floating window that shows every open timer you own, whatever project it belongs to. It hides itself when there are none.

- Drag its header to move it, and drag its side edges to resize it. Its position and width are kept for your browser session.
- The chevron collapses it to one line that still shows the running timer and its clock.
- Click a card to expand it and write a description ("What are you working on?"). It saves when you leave the field, or 30 seconds after you start typing, and it carries into the Log Timer dialog.

> [!WARNING]
> The trash button means different things in two places. On a **task row** it deletes the task. On a **dock card** it discards the timer: the time entry is deleted, and so is the draft Timesheet if that was its only entry. Check which one you are pointing at.

## Where the time goes

When you start a timer, TaskView looks for a draft Timesheet that has your Employee and the project, and appends a row to it. If there is none it creates one, with the project's customer filled in. Later timers on the same project reuse that draft until you submit it. To change that policy, a developer can use the [`taskview_find_timesheet` hook](../configuration.md#choose-which-timesheet-receives-time).

Each row records the project and the task, which is how [budgets](hour-budgets.md) and the [client portal](../client-portal/README.md) find it. The app adds four read-only fields to Timesheet Detail to hold timer state: Paused, Start Time, Paused Time and Task Subject.

### Submitting a Timesheet

Submitting moves a task forward only: Open becomes Working, and a task that is Pending Review or Completed stays where it is. A task someone has already approved does not slip back to Working because a Timesheet was submitted. If every log of a task on the Timesheet has **Completed** ticked, submitting also completes the task.

### Adding time without a timer

Task View has no manual time form. To add hours you did not time, add a row to a Timesheet in ERPNext and fill in its **Project** and **Task**: budgets and the portal count a row only through those fields.

## Reporting

TaskView does not add a report. Read the meters on the project and its phases for a quick answer, and use the standard Timesheet list or report view, filtered by project, employee or date, for the entries themselves. Billing from Timesheets works as in stock ERPNext.

> [!NOTE]
> Customers see the same figures in the portal, including the descriptions on time entries and a budget per phase. See [Giving customers access](../client-portal/administering-access.md#what-customers-can-see).
