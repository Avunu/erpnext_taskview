// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

import type { Action, ShotSpec } from "./shots.d.ts";

// The demo from erpnext_taskview/demo.py. On a fresh site the first project, "Website Relaunch", is PROJ-0001.
// Task View is opened from the Project list: the Task list's default "Open" status filter would hide
// the tasks in Working and Pending Review.
const TASK_VIEW = "/app/project/view/tasks";
const PROJECT = "/projects/PROJ-0001";
const ROW = ".tree-container .outer-task";

// The tree opens collapsed in a new browser. Open every project and phase, one level per pass.
const EXPAND_ALL: Action[] = [1, 2, 3].flatMap((): Action[] => [
	{
		eval: "document.querySelectorAll('.tree-container .he-tree__open-icon:not(.open)').forEach((a) => a.click());",
	},
	{ wait: 600 },
]);

// The demo's timers are paused, so their clocks stand still; relative times still move.
const CLOCKS = [".frappe-timestamp"];

export default {
	demo: { date: "2026-01-15", seed: 1 },
	shots: [
		{
			name: "task-view",
			route: TASK_VIEW,
			alt: "Task View: three projects as trees of phases and tasks, with hour budget meters, assignees, timer buttons and the timer dock holding two paused timers",
			waitFor: ROW,
			actions: [...EXPAND_ALL, { eval: "document.activeElement?.blur();" }],
			mask: CLOCKS,
			readme: "hero",
			featured: true,
		},
		{
			name: "pinned",
			route: TASK_VIEW,
			alt: "The Pinned view: a personal list of tasks across projects, with quick entry and a task that has no project yet",
			waitFor: ROW,
			actions: [
				{ click: ".taskview-mode-buttons button:nth-child(3)" },
				{ waitFor: ".pinned-container" },
				{ wait: 800 },
			],
			mask: CLOCKS,
			readme: "feature",
			featured: true,
		},
		{
			name: "log-time",
			route: TASK_VIEW,
			alt: "The Log Time dialog, opened from a task row's Log time button, for logging hours without a timer",
			waitFor: ROW,
			actions: [
				...EXPAND_ALL,
				{ click: `${ROW} .task-btn--log` },
				{ waitFor: ".modal.show [data-fieldname='hrs'] input" },
				{ wait: 600 },
				{ type: { selector: ".modal.show [data-fieldname='hrs'] input", text: "1.5" } },
				{
					type: {
						selector: ".modal.show [data-fieldname='description'] textarea",
						text: "Call with the client about the launch date",
					},
				},
				{ wait: 400 },
			],
			mask: CLOCKS,
			readme: "feature",
		},
		{
			name: "portal-board",
			route: `${PROJECT}/tasks?view=board`,
			alt: "The customer portal's kanban board for a project, with Open, Working, Pending Review and Completed columns",
			waitForFn: "document.querySelectorAll('.w-72 header').length >= 4",
			actions: [{ wait: 800 }],
			mask: CLOCKS,
			readme: "feature",
			featured: true,
		},
		{
			name: "portal-overview",
			route: PROJECT,
			alt: "The customer portal's project overview, with the hour budget per phase and recent activity",
			waitForFn: "document.body.innerText.includes('Website Relaunch')",
			actions: [{ wait: 1200 }],
			mask: CLOCKS,
			readme: "feature",
		},
	],
} satisfies ShotSpec;
