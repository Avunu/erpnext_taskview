/**
 * @module timerDialog
 *
 * Shared "Log Timer" dialog used by both {@link TimerWidget} and {@link Task}
 * when a running timer is stopped.
 *
 * The dialog is responsible only for UI (fields, layout, wiring).  The actual
 * backend calls (pause / stop / resume) are delegated to the caller via the
 * {@link StopTimerDialogOptions.onSubmit} and
 * {@link StopTimerDialogOptions.onCancel} hooks.
 */

export interface StopTimerValues {
	activity_type: string;
	hrs: number;
	description: string;
	is_billable: 0 | 1;
	completed: 0 | 1;
}

export interface StopTimerDialogOptions {
	/** Pre-computed elapsed hours to pre-fill the Hrs field. */
	elapsedHrs: number;
	/** Current description to pre-fill the Description field. */
	currentDesc: string;
	/** Task subject for the context header. */
	taskSubject: string;
	/** Project name for the context header. */
	projectName: string;
	/** Customer name for the context header (optional). */
	customer?: string | null;
	/** Called when the user submits the form. Should stop the timer and return status messages. */
	onSubmit: (values: StopTimerValues) => Promise<{ alert?: string; notice?: string }>;
	/** Called when the user cancels. Should resume the timer. */
	onCancel: () => Promise<void>;
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
 * Show the "Log Timer" confirmation dialog.
 *
 * The timer should already be paused before this is called.  On submit the
 * caller's {@link StopTimerDialogOptions.onSubmit} hook receives the form
 * values.  On cancel the caller's {@link StopTimerDialogOptions.onCancel}
 * hook is invoked so the timer can be resumed.
 */
export function showStopTimerDialog(options: StopTimerDialogOptions): void {
	const { elapsedHrs, currentDesc, taskSubject, projectName, customer, onSubmit, onCancel } = options;

	const labeledPart = (label: string, value: string | null | undefined) =>
		value ? `<span class="text-muted" style="margin-right:12px;"><span style="font-size:10px;text-transform:uppercase;letter-spacing:0.05em;opacity:0.7;">${label}:</span> ${frappe.utils.escape_html(value)}</span>` : "";

	const contextHtml = `
		<div style="border-left:3px solid var(--primary-color);padding:6px 10px;margin-bottom:1rem;">
			<div style="font-weight:600;font-size:13px;">${frappe.utils.escape_html(taskSubject)}</div>
			<div style="margin-top:3px;font-size:12px;">${labeledPart("Project", projectName)}${labeledPart("Customer", customer)}</div>
		</div>`;

	const d = new frappe.ui.Dialog({
		title: "Log Timer",
		fields: [
			{ fieldname: "context", fieldtype: "HTML", options: contextHtml },
			{ label: "Activity Type", fieldname: "activity_type", fieldtype: "Link", options: "Activity Type" },
			{ label: "Hrs", fieldname: "hrs", fieldtype: "Float", default: elapsedHrs },
			{ label: "Description", fieldname: "description", fieldtype: "Small Text", default: currentDesc },
			{ label: "Is Billable", fieldname: "is_billable", fieldtype: "Check" },
			{ label: "Completed", fieldname: "completed", fieldtype: "Check" },
		],
		size: "small",
		primary_action_label: "Submit",
		primary_action: async (values: Record<string, any>) => {
			try {
				const status = await onSubmit(values as StopTimerValues);
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
			await onCancel();
			d.hide();
		},
	});

	d.show();
}
