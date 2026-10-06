<!-- Copyright (c) 2026, Avunu LLC and contributors
For license information, please see license.txt-->

# ERPNext TaskView

A task workspace for ERPNext (Frappe v16). Staff get a project and task tree in the desk with timers and hour budgets. Customers get a portal where they can follow and work on their projects.

**Documentation:** [erpnext-taskview.avunu.net](https://erpnext-taskview.avunu.net). The Markdown source is in [`docs/`](docs/README.md) and reads well on GitHub too: [install](docs/install.md), [Task View](docs/task-view/README.md), [timers](docs/task-view/timers.md), [hour budgets](docs/task-view/hour-budgets.md), [the client portal](docs/client-portal/README.md) and [development](docs/development/README.md).

## Features

### Task View (desk)

A **Task View** list view for Task and Project, which is the default view for both. It shows projects as a tree of tasks and subtasks.

- Drag and drop to reorder and re-parent tasks.
- Inline add and edit, plus quick entry for several subtasks at once.
- Assign and pin tasks; switch between **All Tasks**, **My Tasks** and **Pinned**.
- Quick entry in **Pinned**: type a title and press Enter to add a pinned task, then keep typing. New tasks go below the last task you clicked, or at the end. Choose a project from the chip on the task later; the project also sets the customer. Until it has a project, a task can't run a timer or be unpinned.
- Open a task's full form in a side panel.
- Select several tasks and copy them as Markdown.

### Timers

Start, pause and stop a timer on any task. Time is logged to a draft Timesheet as you go, and a timer dock on every desk page shows the running timers.

Apps can choose which Timesheet a log is added to through the `taskview_find_timesheet` hook. See [Timers and timesheets](docs/task-view/timers.md) and [Configuration](docs/configuration.md#choose-which-timesheet-receives-time).

### Hour budgets

Tasks and projects with a budget show a meter such as `12.5 / 20 h`. It turns amber at 80% and red when over budget.

- **Task budget:** the task's *Expected Time*. A task without one uses the sum of its subtasks' budgets.
- **Project budget:** the project's *Budgeted Hours*. If that's blank, it uses the sum of its top-level tasks' budgets.
- **Logged hours** are live. They count draft and submitted timesheets plus running timers, and include all subtasks.

See [Hour budgets](docs/task-view/hour-budgets.md).

### Customer portal (`/projects`)

A portal for customers, linked from the standard portal menu. Guests are sent to the login page. Customers see only their own projects: an overview with a budget per phase, tasks as a list or a kanban board, time logs, comments and files. They can:

- drag cards between the board columns (Open, Working, Pending Review, Completed); phases move with their tasks and can't be dragged;
- add tasks, optionally under an open phase, unless the project is Completed or Cancelled;
- comment on tasks and attach files (JPG, PNG, GIF, PDF, TXT, CSV or Microsoft documents).

A portal user sees a project when their Contact is linked to the project's customer, they are in the customer's *Portal Users*, or they are listed in the project's *Users*. Cancelled projects and template tasks are not shown. Staff can open the portal too, and see what their own permissions allow. When a customer adds a task, comments, moves a task or attaches a file, the team gets a "Client Portal" notification.

See [The client portal](docs/client-portal/README.md), [Using the client portal](docs/client-portal/using-the-portal.md) and [Giving customers access](docs/client-portal/administering-access.md).

## Installation

```bash
bench get-app https://github.com/Avunu/erpnext_taskview
bench --site <site> install-app erpnext_taskview
bench build --app erpnext_taskview
```

`bench build` runs the app's `yarn build`, which builds the desk bundles and the portal. See [Install and upgrade](docs/install.md).

On a site that already had the app, `bench migrate` runs a one-time patch that does the following:

- points the portal's Projects menu and default home at `/projects`;
- removes any redirect from `/projects` to the old `/project` list;
- opts existing users into the Client Portal notification emails.

A fresh `install-app` marks the app's patches as done without running them, so on a new site make those settings by hand: [Finish the portal set-up](docs/install.md#finish-the-portal-set-up).

## Development

Requires Node 22+ and yarn.

| Command | What it does |
| --- | --- |
| `yarn build` | Builds the desk bundles and the portal, then updates `sites/assets/assets.json` |
| `yarn dev` / `yarn dev:dock` | Rebuilds the Task View or timer dock bundle on change |
| `yarn dev:portal` | Runs the portal on the Vite dev server, proxied to the bench |
| `yarn typecheck` | Type-checks the desk and portal code |
| `yarn lint` / `yarn format` | Runs oxlint and oxfmt |
| `bench --site <site> run-tests --app erpnext_taskview` | Runs the Python tests |

Where things live:

- `erpnext_taskview/public/js/`: desk bundles (Task View, timer dock).
- `portal/`: the portal app (frappe-ui). It builds into `erpnext_taskview/public/portal/` and `erpnext_taskview/www/projects.html`, which are generated files and not committed.
- `erpnext_taskview/erpnext_taskview/api.py`, `budget.py`: the desk API and the budget calculations.
- `erpnext_taskview/portal/`: the portal API. Every endpoint checks access in `access.py` first.

Server code uses the Frappe ORM and Query Builder only, never raw SQL. More in [Develop ERPNext TaskView](docs/development/README.md) and [How it works](docs/development/architecture.md).

## License

[MIT](license.txt), Copyright (c) 2026 Avunu LLC.
