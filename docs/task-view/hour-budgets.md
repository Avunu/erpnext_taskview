---
title: Hour budgets
description: Set hour budgets on tasks and projects, understand how budgets roll up and which hours count, and read the budget meters in Task View and the portal.
nav_title: Hour budgets
order: 5
updated: 2026-10-06
---

A budget meter compares the hours logged on a task or project with the hours set aside for it. Task View shows meters on task and project rows, and the [client portal](../client-portal/README.md) shows the same figures to customers.

## Set a budget

You set budgets on the forms, which the side panel button on a row opens (see [Work the task tree](README.md#edit)):

- **Task:** the standard **Expected Time (in hours)** field.
- **Project:** **Budgeted Hours**, a field TaskView adds to the Project form below Estimated Cost. Its help text says to leave it at 0 to use the sum of the task estimates.

Both are optional. When you leave one empty (or 0) the budget is added up from what is below it.

| Level | Budget | If left empty |
| --- | --- | --- |
| Task | Its Expected Time | The sum of its subtasks' budgets |
| Project | Its Budgeted Hours | The sum of its top-level tasks' budgets |

A top-level task with subtasks works as a phase. Give it an Expected Time to cap the phase, or leave it empty and let its subtasks add up. An explicit figure always wins: a phase set to 20 hours stays at 20 even when its subtasks add up to more, and a project with Budgeted Hours stays at that figure whatever its tasks add up to. A Cancelled task contributes no budget.

### Example

| Item | Expected Time | Budget shown | Why |
| --- | --- | --- | --- |
| Project `PROJ-0001`, Budgeted Hours empty | | 45 h | The top-level tasks below: 10 + 30 + 5 |
| Phase "Discovery" | empty | 10 h | Its subtasks: Interviews 6 h and Sitemap 4 h |
| Phase "Build" | 30 h | 30 h | Its own figure, although Templates (20 h) and Content (15 h) add up to 35 |
| Task "Launch" | 5 h | 5 h | Its own figure |

## Read the meters

A task or project with a budget shows a small bar and a label, for example `12.5 / 20 h`. Rows without a budget show no meter. Hover over a meter for a sentence such as "12.5 of 20 h logged (63%), 7.5 h remaining", or "22 of 20 h logged (110%), 2 h over budget".

The bar changes colour as the budget is used.

| State | When | Colour |
| --- | --- | --- |
| Normal | Logged is under 80% of the budget | Blue |
| Warning | Logged is at least 80% of the budget | Amber |
| Over | Logged is more than 100% of the budget | Red, with the label in bold |

The bar fills to 100% and stops, so use the label and the hover text to see how far over you are. Hours show with one decimal below 100 (a trailing `.0` is dropped) and as whole hours from 100.

Your own running timers tick on the meters of the task, its parents and the project, and refresh about every 30 seconds. Other people's open timers are included when the view loads.

In the portal, a project card or a phase that has time logged but no budget shows the hours alone, such as `12 h`.

## How hours are counted

- Every row on a draft or submitted Timesheet counts. Cancelled Timesheets do not.
- A row counts through its **Project** field, and through its **Task** field for task meters. A row with no Project is not counted anywhere.
- Open timers count for the time they have actually run. The time a timer spent paused is not counted.
- A task's logged hours include all of its subtasks. A project's logged hours include every row on the project, including rows with no task.
- Completed tasks, hidden tasks and the time logged on Cancelled tasks still count. Template tasks are ignored.

> [!NOTE]
> ERPNext's own **Actual Time** on a Task or Project counts only submitted Timesheets, so it can lag by days while your draft Timesheet is still open. The meters count drafts, which is why the two numbers can differ.

## Related

- [Timers and timesheets](timers.md) for where the hours come from
- [Reading the hours meter in the portal](../client-portal/using-the-portal.md#reading-the-hours-meter)
