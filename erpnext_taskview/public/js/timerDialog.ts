// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * @module timerDialog
 *
 * Shared time-logging dialog.  {@link TimerWidget} and {@link Task} open it as
 * "Log Timer" when a running timer is stopped, and {@link Task} opens it as
 * "Log Time" to log hours on a task that has no timer.
 *
 * The dialog is responsible only for UI (fields, layout, wiring).  The actual
 * backend calls (pause / stop / resume) are delegated to the caller via the
 * {@link StopTimerDialogOptions.onSubmit} and
 * {@link StopTimerDialogOptions.onCancel} hooks.
 */

import type { Dialog } from "frappe-types";
import type { SaveDocResponse } from "./types";

/**
 * The Is Billable field's `onchange`: once it is ticked, seed Billable Time
 * from Hrs.
 */
export function seedBillableTime(d: Dialog): void {
	if (d.get_value("is_billable") && !d.get_value("billing_hrs")) {
		void d.set_value("billing_hrs", d.get_value("hrs") || 0);
	}
}

export interface StopTimerValues {
	task: string;
	activity_type: string;
	hrs: number;
	billing_hrs: number;
	description: string;
	is_billable: 0 | 1;
	completed: 0 | 1;
}

export interface StopTimerDialogOptions {
	/** Dialog title.  Defaults to "Log Timer". */
	title?: string;
	/** Pre-computed elapsed hours to pre-fill the Hrs field; omit to leave it empty. */
	elapsedHrs?: number;
	/**
	 * Refuse to submit until Hrs is above zero.  For a manual log, which has no
	 * clock for the server to fall back on.
	 */
	requireHours?: boolean;
	/** Current description to pre-fill the Description field. */
	currentDesc: string;
	/** Task name (document name) for the Task field default. */
	taskName: string;
	/** Task subject for the context header. */
	taskSubject: string;
	/** Project doc name (e.g. "PROJ-0001") used to filter the Task link field. */
	project: string;
	/** Project title for the context header display. */
	projectName: string;
	/** Customer name for the context header (optional). */
	customer?: string | null;
	/** Called when the user submits the form. Should stop the timer and return status messages. */
	onSubmit: (values: StopTimerValues) => Promise<Pick<SaveDocResponse, "alert" | "notice">>;
	/** Called when the user cancels, e.g. to resume the timer.  Optional. */
	onCancel?: () => Promise<void>;
}

/**
 * Compute total elapsed hours from a timer's accumulated state.
 *
 * For a running (non-paused) timer the current segment is added to the
 * already-accumulated paused seconds.  For a paused timer only the
 * accumulated seconds are used.
 */
export function calcElapsedHrs(
	pausedTimeInSeconds: number,
	paused: number | boolean,
	startTime: string | null,
): number {
	let totalSeconds = pausedTimeInSeconds || 0;
	if (!paused && startTime) {
		const segmentMs = Date.now() - new Date(startTime).getTime();
		totalSeconds += Math.max(0, Math.floor(segmentMs / 1000));
	}
	return Math.round(totalSeconds / 36) / 100;
}

/**
 * Show the "Log Timer" (or, with a `title`, "Log Time") dialog.
 *
 * When stopping, the timer should already be paused before this is called.
 * On submit the caller's {@link StopTimerDialogOptions.onSubmit} hook receives
 * the form values.  On cancel the caller's {@link StopTimerDialogOptions.onCancel}
 * hook, if any, is invoked so the timer can be resumed.
 */
export function showStopTimerDialog(options: StopTimerDialogOptions): void {
	const {
		title = "Log Timer",
		elapsedHrs,
		requireHours = false,
		currentDesc,
		taskName,
		taskSubject,
		project,
		projectName,
		customer,
		onSubmit,
		onCancel,
	} = options;

	const labeledPart = (label: string, value: string | null | undefined) =>
		value
			? `<span class="text-muted" style="margin-right:12px;"><span style="font-size:10px;text-transform:uppercase;letter-spacing:0.05em;opacity:0.7;">${label}:</span> ${frappe.utils.escape_html(value)}</span>`
			: "";

	const contextHtml = `
		<div style="border-left:3px solid var(--primary-color);padding:6px 10px;margin-bottom:1rem;">
			<div style="font-weight:var(--weight-semibold);font-size:var(--text-sm);">${frappe.utils.escape_html(taskSubject)}</div>
			<div style="margin-top:3px;font-size:var(--text-xs);">${labeledPart("Project", projectName)}${labeledPart("Customer", customer)}</div>
		</div>`;

	const d = new frappe.ui.Dialog({
		title,
		fields: [
			{ fieldname: "context", fieldtype: "HTML", options: contextHtml },
			{
				label: "Task",
				fieldname: "task",
				fieldtype: "Link",
				options: "Task",
				default: taskName,
				get_query: () => ({ filters: { project } }),
			},
			{
				label: "Activity Type",
				fieldname: "activity_type",
				fieldtype: "Link",
				options: "Activity Type",
			},
			{ label: "Hrs", fieldname: "hrs", fieldtype: "Float", default: elapsedHrs, reqd: requireHours ? 1 : 0 },
			{
				label: "Description",
				fieldname: "description",
				fieldtype: "Small Text",
				default: currentDesc,
			},
			{
				label: "Is Billable",
				fieldname: "is_billable",
				fieldtype: "Check",
				// When Is Billable is toggled on, seed Billable Time from current Hrs
				onchange: () => seedBillableTime(d),
			},
			{
				label: "Billable Time",
				fieldname: "billing_hrs",
				fieldtype: "Float",
				depends_on: "eval:doc.is_billable == 1",
				description: "Defaults to Hrs when Billable is checked. Edit independently if needed.",
			},
			{ label: "Completed", fieldname: "completed", fieldtype: "Check" },
		],
		size: "small",
		primary_action_label: "Submit",
		primary_action: async (values) => {
			// The dialog's values, keyed by the fieldnames above.
			const logValues = values as unknown as StopTimerValues;
			if (requireHours && !(logValues.hrs > 0)) {
				frappe.msgprint({ message: "Enter the hours to log.", title: title, indicator: "orange" });
				return;
			}
			try {
				const status = await onSubmit(logValues);
				d.hide();
				if (status?.alert) {
					frappe.show_alert({ message: status.alert, indicator: "green" });
				}
				if (status?.notice) {
					frappe.msgprint({ message: status.notice, title: "Notice" });
				}
			} catch (err) {
				frappe.throw(String(err));
			}
		},
		secondary_action_label: "Cancel",
		secondary_action: async () => {
			await onCancel?.();
			d.hide();
		},
	});

	d.show();
}
