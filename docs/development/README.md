---
title: Develop TaskView for ERPNext
description: Set up a bench checkout, build the Vue and frappe-ui bundles, run the Python tests and JavaScript checks, and see what CI and pre-commit enforce.
nav_title: Development
order: 9
updated: 2026-10-26
---

This page is for people changing the app. [How it works](architecture.md) explains the design behind the code, and [Source and changes](../README.md#source-and-changes) says where to find what changed. The rules every Avunu Frappe app follows (managed files, gates, release flow) are in the frappe-nix [app standards documentation](https://docs.avunu.net/frappe-nix/docs/app-standards/); this page covers what is specific to this repository.

## Set up

You need a bench with Frappe v16 and ERPNext, plus Node 24 or newer and yarn. Work in the app's folder inside the bench, because the build writes into the bench's `sites/assets`:

```bash
cd apps/erpnext_taskview
yarn install
yarn build
```

`yarn build` builds the desk bundles and the portal, then runs `scripts/vite-register.mjs`, which registers the bundles in the bench's `sites/assets/assets.json`. It finds the bench from the app folder (`apps/erpnext_taskview`) or `$FRAPPE_BENCH_ROOT`, and skips itself outside one. The first `bench build` of the app installs the dependencies and runs the same command: see [Install and upgrade](../install.md#install).

## Commands

Run these from the app folder.

| Command                            | What it does                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------- |
| `yarn build`                       | Builds the desk bundles and the portal, then updates `sites/assets/assets.json` |
| `yarn dev`                         | Rebuilds the Task View bundle whenever a file changes                           |
| `yarn dev:dock`                    | Rebuilds the timer dock bundle whenever a file changes                          |
| `yarn dev:portal`                  | Runs the portal on the Vite dev server, proxied to the bench                    |
| `yarn build:taskview`              | Builds the Task View bundle only                                                |
| `yarn build:timerdock`             | Builds the timer dock bundle only                                               |
| `yarn build:portal`                | Builds the portal only                                                          |
| `yarn typecheck`                   | Type-checks the desk code and the portal code                                   |
| `yarn lint`, `yarn lint:fix`       | Runs oxlint on `erpnext_taskview/public/js` and `portal/src`                    |
| `yarn format`, `yarn format:check` | Runs oxfmt on the same two folders                                              |

The Python tests are run with `bench`: see [Tests](#tests).

`yarn dev:portal` finds the bench by walking up from the app folder to a folder that holds `sites` and `apps`, reads the web server port from `sites/common_site_config.json` (8000 when there is none), and serves the portal on the matching Vite port: 8080 for web port 8000, 8081 for 8001, and so on. It proxies `/api`, `/app`, `/assets` and the other Frappe routes to the bench. Under the dev server it takes its boot data from `erpnext_taskview.www.projects.get_context_for_dev` instead of the Jinja page, and that method answers only on a site in developer mode.

## Where things live

```text
erpnext_taskview/
  hooks.py                          app hooks: bundles, class overrides, portal routes
  install.py                        creates the Client Portal Notification Type
  patches/v1_0/setup_client_portal.py   runs install.setup_client_portal once on existing sites
  erpnext_taskview/                 the app's module
    api.py                          desk endpoints: tree data, saves, timers, pinning
    budget.py                       budget and logged-hours rollup
    models.py                       Pydantic models of the desk API
    custom/                         custom fields, property settings and class overrides
  portal/                           portal API
    access.py                       who may open what
    api.py                          endpoints behind /projects
    html.py                         sanitising rich text in and out
    notify.py                       notifying the team
    models.py                       Pydantic models of the portal API
  www/projects.py                   page shell and boot data for the portal
  public/js/                        desk bundles: TaskView.vue, components/, timer store
  tests/                            Python tests and their builders
portal/                             the portal app (Vue 3, frappe-ui)
vite.config.ts                      desk bundles
vite.portal.config.ts               portal build
scripts/vite-register.mjs           registers the Vite bundles in sites/assets/assets.json (managed)
```

## How the build fits together

- **Desk bundles.** `vite.config.ts` builds two IIFE bundles from `erpnext_taskview/public/js`: `taskview.entry.ts` and `timerdock.entry.ts`. The sources are not named `*.bundle.*`, so Frappe's esbuild leaves them to Vite. Frappe is declared external, because the desk provides it as a global. Both write into `erpnext_taskview/public/dist` one after the other, so neither empties the folder. `scripts/vite-register.mjs`, which frappe-nix manages, then reads the Vite manifests and writes the `taskview.bundle.js`, `taskview.bundle.css`, `timerdock.bundle.js` and `timerdock.bundle.css` keys that `hooks.py` lists in `app_include_js` and `app_include_css` into the bench's `sites/assets/assets.json`. Outside a bench it skips itself, so `yarn build` works in a bare checkout.
- **Portal.** `vite.portal.config.ts` builds `portal/` into `erpnext_taskview/public/portal/` and copies its `index.html` to `erpnext_taskview/www/projects.html`. Frappe renders that file as a Jinja template with the context from `www/projects.py`, and frappe-ui's build plugin turns every key of `context.boot` into a `window` global. Both outputs are generated and git-ignored. Do not name portal files `*.bundle.*`: Frappe's esbuild compiles every such file under `public/` on its own.
- **Two TypeScript versions.** The app's `typescript` is the native TypeScript 7 build, which has no JavaScript API. `vue-tsc` and Vue's single-file-component compiler need one, so `typescript5` is an alias of TypeScript 5. `scripts/vue-tsc.cjs` runs `vue-tsc` against it, and `vite.portal.config.ts` registers it with the SFC compiler, which frappe-ui's components need to resolve their prop types.
- **Frappe's types.** The desk code is checked against [frappe-types](https://github.com/Avunu/frappe-types) (`tsconfig.json` extends its strict preset and loads its `frappe` global). What the app hangs on frappe's namespaces (`frappe.views.TasksView`, `frappe.views.TaskViewSelect`, `frappe.ui.TaskViewSortSelector`) is declared in `types/erpnext_taskview.augment.d.ts`, together with the one frappe member frappe-types does not declare yet.
- **Tailwind 3.** frappe-ui is still a Tailwind 3 consumer, so Dependabot is told to ignore Tailwind 4 and later.

## Tests

The Python tests are Frappe `IntegrationTestCase`s in `erpnext_taskview/tests/`, with record builders in `fixtures.py`:

| File                        | Covers                                                                                                                                                                                                                                       |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `test_api.py`               | The desk endpoints: filters and sorting, every `save_doc` route (projects, tasks, drag and drop, timers, manual logs), bulk creation, deleting, assigning and pinned order                                                                   |
| `test_hooks.py`             | The install hook, the hooks the app registers, and the Task extension's permission bypass                                                                                                                                                    |
| `test_budget.py`            | Rollup of budgets and logged hours, own estimates beating subtask sums, Cancelled Timesheets, open timers, rollup by `parent_task`, and a parent cycle that must not hang                                                                    |
| `test_portal.py`            | Who can open what, template tasks hidden, project and task reads, status changes and closing assignments, creating tasks, comments, attachments, boot data and the legacy link redirect                                                      |
| `test_pinned.py`            | Quick entry, placing after an anchor, giving a task a project, and the cases that are refused                                                                                                                                                |
| `test_timesheet_guard.py`   | A submitted Timesheet never moves a task backwards                                                                                                                                                                                           |
| `test_timer_permissions.py` | Who may start, pause, stop, discard and log time and complete a task: no Task write, another person's timer or Timesheet, project user permissions, portal users, and Task validation on completion, the task's project and draft Timesheets |
| `test_save_permissions.py`  | Who may change a task or project through the Task and Project routes of `save_doc`: status, renames, drags, new parents and children, and new subtasks                                                                                       |
| `test_copy_markdown.py`     | `get_task_descriptions`: HTML descriptions become Markdown, relative URLs become absolute, empty descriptions are left out                                                                                                                   |
| `test_demo.py`              | The demo data in `demo.py`, which frappe-demo and the screenshots use, and that running it twice changes nothing                                                                                                                             |
| `test_json_functions.py`    | The Query Builder SQL functions in `utils/json_functions.py`, which other apps import                                                                                                                                                        |

Frappe only runs tests on a site that allows them. Use a development or test site, never production:

```bash
bench --site <TEST_SITE> set-config allow_tests true
bench --site <TEST_SITE> run-tests --app erpnext_taskview
bench --site <TEST_SITE> run-tests --module erpnext_taskview.tests.test_budget
```

In the frappe-nix dev shell, `frappe-test --reuse-site` runs the same tests with coverage of the app alone (the floor is `fail_under` in `pyproject.toml`), checks that every whitelisted method and hook ran, and that the controller extensions compose with other apps'.

There are no JavaScript unit tests. `yarn typecheck`, `yarn lint` and `yarn format:check` are the front-end gates.

## Continuous integration

`.github/workflows/ci.yml` is managed by frappe-nix (`frappe-init --sync` writes it) and runs the shared quality gates on every pull request, every push to `main` and once a day. Each gate is a check named `ci / <gate>`:

- `ci / lint`: the pre-commit hooks below, run with prek.
- `ci / typecheck`: `yarn typecheck`.
- `ci / test`: the Python tests with coverage (`frappe-test`), and `ty`.
- `ci / marketplace`: the registry checks of `frappe-listing check` on `marketplace/listing.toml`, `hooks.py` and the logo.

`pr-policy.yml` adds `ci / pr-policy`, which checks a pull request's base, title and commits. `nightly.yml` runs the integration suites each night and is never a required check, and `release.yml` runs release-please and moves the release branch forward. The frappe-nix [app standards documentation](https://docs.avunu.net/frappe-nix/docs/app-standards/) describes each.

Dependabot updates the dependencies in groups. `deps.yml` relocks and syncs after a flake bump and turns on auto-merge for those pull requests.

## Releases

`release.yml` runs [release-please](https://github.com/googleapis/release-please) on every push to `main` and once a day. It keeps a release pull request open that bumps the version in `package.json` and `erpnext_taskview/__init__.py` and writes `CHANGELOG.md` from the conventional commits since the last release. Merging that pull request tags the release (`v` and the version, for example `v0.1.0`), publishes it on the [releases page](https://github.com/Avunu/erpnext_taskview/releases) and moves the `version-16` branch, the one the [install command](../install.md#install) names, forward to it. No release has been made yet: the manifest is at `0.0.1`.

Commit subjects decide the next version, so write them as conventional commits (`feat:`, `fix:`, `docs:`, `chore:`). `chore: bump` pull requests from Dependabot change `package.json`, `yarn.lock` and the lock files only.

A database change ships as a custom field or property setting in `custom/*.json`, which every `bench migrate` syncs, or as a patch in `patches.txt`, which runs once. See [Upgrade](../install.md#upgrade).

The `Docs` workflow (`.github/workflows/docs.yml`) checks this documentation when `docs/` changes. It is described below.

## Conventions

- Server code uses the Frappe ORM and Query Builder only, never raw SQL.
- Python is formatted with ruff: tabs, double quotes and a line length of 110. Every source file starts with the copyright header the `validate_copyright` pre-commit hook checks.
- The API shapes are written twice, in Pydantic and in TypeScript, and kept in step by hand: `erpnext_taskview/erpnext_taskview/models.py` with `erpnext_taskview/public/js/types.ts`, and `erpnext_taskview/portal/models.py` with `portal/src/types.ts`. Change both together.
- The Python dependencies are Pydantic, nh3 and BeautifulSoup, declared in `pyproject.toml` within the ranges Frappe v16 pins (`pydantic>=2.12,<3`, `nh3>=0.3,<1`, `beautifulsoup4>=4.13,<5`), so they add nothing a v16 bench does not already have. Frappe and ERPNext come from the bench and are declared under `[tool.bench.frappe-dependencies]`.
- Patches are listed in `patches.txt`. A fresh install marks every patch as done without running it, so anything a new site needs must also happen in `after_install` (`install.py`). The portal set-up is one idempotent function, `install.setup_client_portal`, that both `after_install` and the `setup_client_portal` patch call: see [Install and upgrade](../install.md#what-installing-sets-up).

### Pre-commit

`.pre-commit-config.yaml` is managed by frappe-nix (`frappe-init --sync` writes it from the app standards profile) and runs with [prek](https://github.com/j178/prek). It runs ruff, ssort, oxlint and oxfmt, the standard file checks, workflow and shell linting, the conventional-commit check, `frappe-nix compat`, and Frappe's `test_utils` hooks (`validate_copyright`, `validate_patches`, `static_analysis` and others). ruff and the other Python tools are pinned in `tools/uv.lock`, oxlint and oxfmt in `package.json`. The dev shell (`direnv allow`, or `nix develop --no-pure-eval`) installs the hooks; `uv run --frozen --project tools prek run --all-files` runs them by hand. The documentation is excluded from the hooks that would otherwise rewrite it: `validate_copyright` stamps a copyright comment above the frontmatter of every Markdown file, so it skips `docs/`.

## Working on these docs

The documentation is Markdown in `docs/`. It is published with the other Avunu projects at [docs.avunu.net/erpnext-taskview/](https://docs.avunu.net/erpnext-taskview/) by [Avunu/site-docs](https://github.com/Avunu/site-docs), which picks up the latest release of this repository. Write the files so that they read well on GitHub too: frontmatter, GitHub alerts and relative links.

To check a change as the pull request check does, clone Avunu/site-docs beside this repository and, from its folder (Node 22.19 or newer), run:

```bash
npm ci --ignore-scripts && npm run build
node build/cli.js check --only erpnext-taskview --source erpnext-taskview=../erpnext_taskview
```

Use `build --lenient` instead of `check` to write a preview of the site into `dist/`. See [previewing](https://github.com/Avunu/site-docs/blob/main/docs/guide/previewing.md).
