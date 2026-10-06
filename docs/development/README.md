---
title: Develop ERPNext TaskView
description: Set up a bench checkout, build the Vue and frappe-ui bundles, run the Python tests and JavaScript checks, and see what CI and pre-commit enforce.
nav_title: Development
order: 9
updated: 2026-10-06
---

This page is for people changing the app. [How it works](architecture.md) explains the design behind the code, and the [changelog](changelog.md) says where to find what changed.

## Set up

You need a bench with Frappe v16 and ERPNext, plus Node 22 or newer and yarn. Work in the app's folder inside the bench, because the build writes into the bench's `sites/assets`:

```bash
cd apps/erpnext_taskview
yarn install
yarn build
```

`yarn build` builds the desk bundles and the portal, then runs `update-assets.mjs`, which resolves `../../sites` from the app folder, so the app has to live at `apps/erpnext_taskview` of a bench. The first `bench build` of the app installs the dependencies and runs the same command: see [Install and upgrade](../install.md#install).

## Commands

Run these from the app folder.

| Command | What it does |
| --- | --- |
| `yarn build` | Builds the desk bundles and the portal, then updates `sites/assets/assets.json` |
| `yarn dev` | Rebuilds the Task View bundle whenever a file changes |
| `yarn dev:dock` | Rebuilds the timer dock bundle whenever a file changes |
| `yarn dev:portal` | Runs the portal on the Vite dev server, proxied to the bench |
| `yarn build:taskview` | Builds the Task View bundle only |
| `yarn build:timerdock` | Builds the timer dock bundle only |
| `yarn build:portal` | Builds the portal only |
| `yarn typecheck` | Type-checks the desk code and the portal code |
| `yarn lint`, `yarn lint:fix` | Runs oxlint on `erpnext_taskview/public/js` and `portal/src` |
| `yarn format`, `yarn format:check` | Runs oxfmt on the same two folders |

The Python tests are run with `bench`: see [Tests](#tests).

`yarn dev:portal` finds the bench by walking up from the app folder to a folder that holds `sites` and `apps`, reads the web server port from `sites/common_site_config.json` (8000 when there is none), and serves the portal on the matching Vite port: 8080 for web port 8000, 8081 for 8001, and so on. It proxies `/api`, `/app`, `/assets` and the other Frappe routes to the bench. Under the dev server it takes its boot data from `erpnext_taskview.www.projects.get_context_for_dev` instead of the Jinja page, and that method answers only on a site in developer mode.

## Where things live

```text
erpnext_taskview/
  hooks.py                          app hooks: bundles, class overrides, portal routes
  install.py                        creates the Client Portal Notification Type
  patches/v1_0/setup_client_portal.py   one-time portal switch-over for existing sites
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
update-assets.mjs                   copies the desk bundles into sites/assets
```

## How the build fits together

- **Desk bundles.** `vite.config.ts` builds two IIFE bundles from `erpnext_taskview/public/js`: `taskview.bundle.ts` and `timerdock.bundle.ts`. Frappe is declared external, because the desk provides it as a global. Both write into `erpnext_taskview/public/dist` one after the other, so neither empties the folder. `update-assets.mjs` then copies the hashed files into `sites/assets` and writes the `taskview.bundle.js`, `taskview.bundle.css`, `timerdock.bundle.js` and `timerdock.bundle.css` keys that `hooks.py` lists in `app_include_js` and `app_include_css`.
- **Portal.** `vite.portal.config.ts` builds `portal/` into `erpnext_taskview/public/portal/` and copies its `index.html` to `erpnext_taskview/www/projects.html`. Frappe renders that file as a Jinja template with the context from `www/projects.py`, and frappe-ui's build plugin turns every key of `context.boot` into a `window` global. Both outputs are generated and git-ignored. Do not name portal files `*.bundle.*`: Frappe's esbuild compiles every such file under `public/` on its own.
- **Two TypeScript versions.** The app's `typescript` is the native TypeScript 7 build, which has no JavaScript API. `vue-tsc` and Vue's single-file-component compiler need one, so `typescript5` is an alias of TypeScript 5. `scripts/vue-tsc.cjs` runs `vue-tsc` against it, and `vite.portal.config.ts` registers it with the SFC compiler, which frappe-ui's components need to resolve their prop types.
- **Tailwind 3.** frappe-ui is still a Tailwind 3 consumer, so Dependabot is told to ignore Tailwind 4 and later.

## Tests

The Python tests are Frappe `IntegrationTestCase`s in `erpnext_taskview/tests/`, with record builders in `fixtures.py`:

| File | Covers |
| --- | --- |
| `test_budget.py` | Rollup of budgets and logged hours, own estimates beating subtask sums, Cancelled Timesheets, open timers, rollup by `parent_task`, and a parent cycle that must not hang |
| `test_portal.py` | Who can open what, template tasks hidden, project and task reads, status changes and closing assignments, creating tasks, comments, attachments, boot data and the legacy link redirect |
| `test_pinned.py` | Quick entry, placing after an anchor, giving a task a project, and the cases that are refused |
| `test_timesheet_guard.py` | A submitted Timesheet never moves a task backwards |

Frappe only runs tests on a site that allows them. Use a development or test site, never production:

```bash
bench --site <TEST_SITE> set-config allow_tests true
bench --site <TEST_SITE> run-tests --app erpnext_taskview
bench --site <TEST_SITE> run-tests --module erpnext_taskview.tests.test_budget
```

There are no JavaScript unit tests. `yarn typecheck`, `yarn lint` and `yarn format:check` are the front-end gates.

## Continuous integration

The `check` workflow (`.github/workflows/check.yml`) runs on every pull request and every push to `main`. Its `build` job uses Node 22 and runs, in order:

1. `yarn install --frozen-lockfile`
2. `yarn typecheck`, `yarn lint` and `yarn format:check`
3. `yarn build:taskview`, `yarn build:timerdock` and `yarn build:portal`, rather than `yarn build`, because `update-assets.mjs` rewrites a bench's `assets.json` and there is no bench in CI
4. A check that `erpnext_taskview/www/projects.html` exists and does not contain `.__`, because Frappe renders it as a Jinja template and refuses any template that does

Dependabot updates the JavaScript dependencies daily, in one group, and a workflow turns on auto-merge for its pull requests, so a pull request merges once its required checks pass.

The `Docs` workflow (`.github/workflows/docs.yml`) builds this documentation when `docs/` or `docs-site/` changes. It is described below.

## Conventions

- Server code uses the Frappe ORM and Query Builder only, never raw SQL.
- Python is formatted with ruff: tabs, double quotes and a line length of 110. Every source file starts with the copyright header the `validate_copyright` pre-commit hook checks.
- The API shapes are written twice, in Pydantic and in TypeScript, and kept in step by hand: `erpnext_taskview/erpnext_taskview/models.py` with `erpnext_taskview/public/js/types.ts`, and `erpnext_taskview/portal/models.py` with `portal/src/types.ts`. Change both together.
- The Python code declares no dependencies of its own. It uses Pydantic, nh3 and BeautifulSoup, which Frappe v16 already depends on.
- Patches are listed in `patches.txt`. A fresh install marks every patch as done without running it, so anything a new site needs must also happen in `after_install` (`install.py`): see [Install and upgrade](../install.md#finish-the-portal-set-up).

### Pre-commit

`.pre-commit-config.yaml` runs ruff, ssort, oxlint and oxfmt, the standard file checks, and Frappe's `test_utils` hooks (`validate_copyright`, `bylines`, `validate_patches` and others). The documentation is excluded from the hooks that would otherwise rewrite it: `validate_copyright` stamps a copyright comment above the frontmatter of every Markdown file, so it skips `docs/`, and the formatters and linters skip `docs-site/`.

## Working on these docs

The documentation is Markdown in `docs/`, built by the shared Avunu docs site in `docs-site/` and published at [erpnext-taskview.avunu.net](https://erpnext-taskview.avunu.net). Write the files so that they read well on GitHub too: frontmatter, GitHub alerts and relative links.

```bash
cd docs-site
bun install
bun run dev --port 3417
bun run check
```

`bun run dev` serves the site with live reload and `bun run check` is what the `Docs` workflow runs: tests, a strict build and a link check. While Jx has not published the release that carries the features the site needs, the site's build stops with a message that says how to use a Jx checkout. `docs-site/README.md` has the details, the list of Markdown the site cannot render, and how to update the site from its template.
