---
title: Changelog
description: "Where to find what changed in ERPNext TaskView: the merged pull requests and the commit history, since the project has no tagged releases yet."
nav_title: Changelog
order: 11
updated: 2026-10-06
---

ERPNext TaskView does not keep a `CHANGELOG` file and has not published a tagged release, so the record of what changed is the repository itself:

- [Merged pull requests](https://github.com/Avunu/erpnext_taskview/pulls?q=is%3Apr+is%3Amerged) say what each change did and why.
- [Commits on `main`](https://github.com/Avunu/erpnext_taskview/commits/main) are written as conventional commits (`feat:`, `fix:`, `chore:`), so the prefix tells you the kind of change.
- [Releases](https://github.com/Avunu/erpnext_taskview/releases) lists tagged versions if any are ever published.

## Milestones so far

| Date | Change |
| --- | --- |
| 2026-10-02 | Hour budgets in Task View and the customer project portal (pull request 27) |
| 2026-10-05 | The portal moves to frappe-ui 1.0 |
| 2026-10-05 | Quick task entry and a project picker in the Pinned view |
| 2026-10-05 | Complete MIT licence text and portal documentation in the README (pull request 30) |

## Upgrading

Every upgrade is the same two commands: `bench migrate` and `bench build --app erpnext_taskview`. Database changes arrive as custom fields and property settings that sync on migrate, or as a patch that runs once. See [Install and upgrade](../install.md#upgrade).

> [!NOTE]
> Dependabot keeps the JavaScript dependencies current, so `chore: bump` pull requests appear in the history often. They change `package.json` and `yarn.lock` only.
