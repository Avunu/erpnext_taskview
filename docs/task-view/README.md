---
title: Work the task tree
description: Open Task View, switch between All Tasks, My Tasks and Pinned, add, reorder and complete tasks in the tree, and copy a selection as Markdown.
nav_title: Task View
order: 3
updated: 2026-10-06
---

Task View is how staff plan and work through projects in the ERPNext desk. This page covers arranging projects and tasks. Timing work is in [Timers and timesheets](timers.md) and budgets are in [Hour budgets](hour-budgets.md).

## Open Task View

Task View is the default list view for both Task and Project. If you land on a plain list, open the view menu next to the page title and choose **Task View**. Choose **List** to go back.

Three buttons beside the title change what the tree shows:

- **All Tasks** shows every project with its task tree.
- **My Tasks** shows the tasks assigned to you, plus the parents above them so you can see where each one lives. A task you add in this view is assigned to you, so it does not disappear the moment it is saved.
- **Pinned** shows a flat list of the tasks you have pinned, across projects. See [Pinned tasks](#pinned-tasks).

The list's filters and sort selector apply as in any list view. Completed and Cancelled tasks are hidden unless you filter on status. Their logged hours still count toward budgets (see [Hour budgets](hour-budgets.md#how-hours-are-counted)).

**New Project** or **New Task** (the page's main button, depending on which list you opened) starts the standard form. The list view's own sort selector calls the stored order **Manual**, and it is the default.

> [!NOTE]
> Dragging only works while the sort is **Manual**. Choose another sort and the tree stays readable but rows cannot be dragged.

## Work the tree

Projects are the top level and each row reads `PROJ-0001: Title`. Tasks sit under them, and any task can have subtasks.

### Add

- **A task, inline.** Click a project to get an **Add task...** row at the end of its tasks, or click a task to get one as its last subtask and another directly below it as a sibling. Click the row, type a title and press Enter to save and keep typing the next one. Pressing a letter key with no field focused also opens **Add task...** for typing in the highlighted project.
- **Many subtasks at once.** The clipboard-list button on a row asks for one title per line and adds them under that project or task.
- **A project.** The **Add project...** row at the bottom of the tree. A project added while the Project list is filtered by customer gets that customer.

### Reorder and re-parent

Drag a row to change its position, or drop it inside another task to make it a subtask. Drag a task into a different project and its subtasks move with it. Drag projects to reorder them. A task cannot be dropped at the top level, only inside a project or another task. Completed or filtered-out siblings keep their place relative to the rows you can see.

### Edit

- **Rename.** Double-click the title, then press Enter to save or Escape to cancel.
- **Open the full form.** The panel button on a row opens the Task or Project form in a side panel. This is where you set [budgets](hour-budgets.md#set-a-budget). **Save** in the panel header is enabled once you change something, and the breadcrumb links to the list and to the full-page form.
- **Assign.** The **+** on a task row lists the enabled staff users. Click a name to assign, or the **x** on an assignee's avatar to remove them.
- **Complete.** Tick the checkbox on an Open task to complete it. The row stays on screen, struck through, until the next refresh, so you can tick several in a row.
- **Delete.** The trash button on a task row asks you to confirm and then deletes the task.

> [!NOTE]
> The checkbox switches a task between Open and Completed only. On a task in any other status, such as Working, ticking it sets the status to Open. To complete such a task, change its status in the side panel, or tick **Completed** when you log time with the timer.

The expanded and collapsed state of the tree is remembered in your browser, per user.

## Copy a selection as Markdown

Select rows, then copy them as a nested outline to paste into a note or a message.

1. Ctrl-click (Cmd-click on a Mac) rows to add or remove them. Shift-click selects the range of visible tasks from the last row you clicked.
2. Press Ctrl+C or Cmd+C. A notice confirms "Copied N task(s) to clipboard".
3. Press Escape to clear the selection.

Selecting a task includes all of its subtasks. A project appears as a plain line without a checkbox (its ID and title, as on its row) when anything under it is selected, and tasks appear as checklist items, ticked when they are Completed.

```markdown
- PROJ-0001: Website redesign
  - [x] Agree the sitemap
  - [ ] Draft the home page
    - [ ] Write the hero copy
```

Ctrl+C does nothing while you are typing in a field, so click a row first.

## Pinned tasks

**Pinned** is your personal shortlist, kept in order across projects and independent of the tree. Pin a task with the pin icon on its row, and drag rows in the list to reorder them.

> [!IMPORTANT]
> Pinning a task also **assigns it to you**. Unpinning removes it from your list but leaves you assigned. The pin and its position are yours alone, but the assignment is visible to everyone.

### Quick entry

The **Add a pinned task...** field in the Pinned list is for capturing work fast. It sits at the end of the list, and moves below any row you click.

1. Type a title and press Enter. The task is created, assigned to you and pinned, and the field stays focused for the next one.
2. The new task goes where the field is: directly below the last row you clicked, or at the end of the list.
3. Paste several lines to add one task per line, in order. Escape clears the field.

A task added this way has **no project yet**. Until it has one it cannot run a timer, get subtasks or be unpinned.

### Give a task a project

Click the project chip on a pinned row (it reads **+ Project** while empty) and search the open projects by project ID, title or customer. Every word you type must match. Use the arrow keys and Enter, or click.

Choosing a project moves the task and all of its subtasks into it, at the end of that project's top-level tasks. The row then shows the project's customer. Only a top-level task can be moved this way, and you must stop its running timers first. Time already logged on the task stays on the project it was logged to, as it does when you drag a task to another project in the tree.

## Keyboard summary

| Keys | Where | Does |
| --- | --- | --- |
| Any printable key | Anywhere in Task View with no field focused | Starts a new task in the highlighted project, or focuses quick entry in **Pinned** |
| Enter | Adding or renaming | Saves, and in **Add task...** moves on to the next blank row |
| Escape | Renaming | Cancels the edit |
| Ctrl or Cmd, click | A row | Adds the row to the selection |
| Shift, click | A row | Selects the range of visible tasks |
| Ctrl+C or Cmd+C | With a selection | Copies it as Markdown |
| Escape | With a selection | Clears it |

## Next

- [Timers and timesheets](timers.md)
- [Hour budgets](hour-budgets.md)
