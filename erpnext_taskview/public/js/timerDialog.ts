// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * @module timerDialog
 *
 * Shared time-logging dialog.  {@link TimerWidget} and {@link Task} open it as
 * "Log Timer" when a running timer is stopped, and {@link Task} opens it as
 * "Log Time" to log time on a task that has no timer.
 *
 * The dialog asks for the start and the duration (hours and minutes) and
 * hands the caller one {@link LoggedTime}.  The actual backend calls (pause /
 * stop / resume) are delegated to the caller via the
 * {@link StopTimerDialogOptions.onSubmit} and
 * {@link StopTimerDialogOptions.onCancel} hooks.
 */

import type { Dialog } from "frappe-types";
import type { SaveDocResponse } from "./types";

/**
 * The dialog's fields.  A field left empty is absent from the values the
 * dialog submits, so they arrive `Partial`.
 */
export interface StopTimerValues {
	task: string;
	activity_type: string;
	/** Start, as a Datetime field holds it: system time zone, `YYYY-MM-DD HH:mm:ss`. */
	from_time: string;
	/** Whole hours of the duration. */
	hours: number;
	/** Minutes of the duration on top of {@link hours}, 0 to 59. */
	minutes: number;
	billing_hrs: number;
	description: string;
	is_billable: 0 | 1;
	completed: 0 | 1;
}

/** The time the dialog confirmed, as {@link StopTimerDialogOptions.onSubmit} receives it. */
export interface LoggedTime {
	/** Empty when the user cleared Task: the server then refuses the entry. */
	task: string | undefined;
	activity_type: string;
	/** Start, in the system time zone (`YYYY-MM-DD HH:mm:ss`). */
	from_time: string;
	/** End: {@link from_time} plus {@link hours}, in the system time zone. */
	to_time: string;
	/**
	 * Duration in hours.  0 only when a timer is stopped with an empty
	 * duration: the server then measures the time from the clock.
	 */
	hours: number;
	/** Billable Time, or {@link hours} when that is empty; 0 when not billable. */
	billing_hours: number;
	description: string;
	is_billable: 0 | 1;
	completed: 0 | 1;
}

export interface StopTimerDialogOptions {
	/** Dialog title.  Defaults to "Log Timer". */
	title?: string;
	/** Elapsed seconds, to fill Hours and Minutes; omit to leave them empty. */
	elapsedSeconds?: number;
	/**
	 * When the work started, in the system time zone, such as a timer's From
	 * Time.  Omitted, Start follows the duration so that the entry ends now,
	 * until the user changes Start.
	 */
	startTime?: string | null;
	/**
	 * Refuse to submit until the duration is above zero.  For a manual log,
	 * which has no clock for the server to fall back on.
	 */
	requireDuration?: boolean;
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
	onSubmit: (logged: LoggedTime) => Promise<Pick<SaveDocResponse, "alert" | "notice">>;
	/** Called when the user cancels, e.g. to resume the timer.  Optional. */
	onCancel?: () => Promise<void>;
}

/**
 * Compute total elapsed seconds from a timer's accumulated state.
 *
 * For a running (non-paused) timer the current segment is added to the
 * already-accumulated paused seconds.  For a paused timer only the
 * accumulated seconds are used.
 */
export function calcElapsedSeconds(
	pausedTimeInSeconds: number,
	paused: number | boolean,
	startTime: string | null,
): number {
	let totalSeconds = pausedTimeInSeconds || 0;
	if (!paused && startTime) {
		const segmentMs = Date.now() - new Date(startTime).getTime();
		totalSeconds += Math.max(0, Math.floor(segmentMs / 1000));
	}
	return totalSeconds;
}

/** {@link calcElapsedSeconds} in hours, rounded to two decimals. */
export function calcElapsedHrs(
	pausedTimeInSeconds: number,
	paused: number | boolean,
	startTime: string | null,
): number {
	return Math.round(calcElapsedSeconds(pausedTimeInSeconds, paused, startTime) / 36) / 100;
}

/** Split seconds into whole hours and minutes, rounded to the nearest minute. */
function splitDuration(seconds: number): { hours: number; minutes: number } {
	const total = Math.max(0, Math.round(seconds / 60));
	return { hours: Math.floor(total / 60), minutes: total % 60 };
}

const WALL_CLOCK = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/;

/**
 * Read a `YYYY-MM-DD HH:mm[:ss]` time as milliseconds, without a time zone.
 * For arithmetic on system-time values only, as the server does with them.
 */
function wallClockMs(value: string | null | undefined): number | null {
	const m = value ? WALL_CLOCK.exec(value) : null;
	if (!m) return null;
	const [year = 0, month = 1, day = 1, hour = 0, minute = 0, second = 0] = m
		.slice(1)
		.map((part) => Number(part ?? 0));
	return Date.UTC(year, month - 1, day, hour, minute, second);
}

/** Write milliseconds from {@link wallClockMs} back as `YYYY-MM-DD HH:mm:ss`. */
function wallClockStr(ms: number): string {
	return new Date(ms).toISOString().slice(0, 19).replace("T", " ");
}

/** The start of an entry of `minutes` that ends now (to the minute), in the system time zone. */
function startEndingNow(minutes: number): string {
	const now = wallClockMs(frappe.datetime.system_datetime()) ?? Date.now();
	return wallClockStr(Math.floor(now / 60_000) * 60_000 - minutes * 60_000);
}

/** The duration in the Hours and Minutes fields, in minutes. */
function durationMinutes(d: Dialog<StopTimerValues>): number {
	const hours = Math.max(0, Number(d.get_value("hours")) || 0);
	const minutes = Math.max(0, Number(d.get_value("minutes")) || 0);
	return hours * 60 + minutes;
}

/**
 * The Is Billable field's `onchange`: once it is ticked, seed Billable Time
 * from the duration.
 */
export function seedBillableTime(d: Dialog<StopTimerValues>): void {
	if (d.get_value("is_billable") && !d.get_value("billing_hrs")) {
		void d.set_value("billing_hrs", durationMinutes(d) / 60);
	}
}

/**
 * Show the "Log Timer" (or, with a `title`, "Log Time") dialog.
 *
 * When stopping, the timer should already be paused before this is called.
 * On submit the caller's {@link StopTimerDialogOptions.onSubmit} hook receives
 * the confirmed {@link LoggedTime}.  On cancel the caller's
 * {@link StopTimerDialogOptions.onCancel} hook, if any, is invoked so the
 * timer can be resumed.
 */
export function showStopTimerDialog(options: StopTimerDialogOptions): void {
	const {
		title = "Log Timer",
		elapsedSeconds,
		startTime,
		requireDuration = false,
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

	const elapsed = elapsedSeconds === undefined ? undefined : splitDuration(elapsedSeconds);
	// A timer's start is kept to the second; drop any fraction.
	const fixedStart = startTime ? startTime.slice(0, 19) : null;

	// Without a fixed start, Start follows the duration so the entry ends now.
	// `autoStart` is the value it was last given, and null once the user has
	// changed Start: from then on it stays where they put it.
	let autoStart: string | null = fixedStart
		? null
		: startEndingNow(elapsed ? elapsed.hours * 60 + elapsed.minutes : 0);

	const followDuration = (): void => {
		if (autoStart === null) return;
		const next = startEndingNow(durationMinutes(d));
		if (next === autoStart) return;
		autoStart = next;
		void d.set_value("from_time", next);
	};

	// Typing 90 in Minutes means 1 hour 30 minutes.
	const normalizeDuration = (): void => {
		const hours = Number(d.get_value("hours")) || 0;
		const minutes = Number(d.get_value("minutes")) || 0;
		if (hours < 0) void d.set_value("hours", 0);
		if (minutes >= 60) {
			void d.set_value("hours", Math.max(0, hours) + Math.floor(minutes / 60));
			void d.set_value("minutes", minutes % 60);
		} else if (minutes < 0) {
			void d.set_value("minutes", 0);
		}
		followDuration();
	};

	const d: Dialog<StopTimerValues> = new frappe.ui.Dialog({
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
			{
				label: "Start",
				fieldname: "from_time",
				fieldtype: "Datetime",
				reqd: 1,
				default: fixedStart ?? autoStart ?? undefined,
				// Name the time zone only when the user's differs from the site's.
				hide_timezone: frappe.datetime.is_system_time_zone() ? 1 : 0,
				onchange: () => {
					// Compared to the minute: the field may not show seconds.
					const value = String(d.get_value("from_time") ?? "");
					if (autoStart !== null && value.slice(0, 16) !== autoStart.slice(0, 16)) {
						autoStart = null;
					}
				},
			},
			{ fieldname: "duration_section", fieldtype: "Section Break", hide_border: 1 },
			{
				label: "Hours",
				fieldname: "hours",
				fieldtype: "Int",
				default: elapsed?.hours,
				onchange: normalizeDuration,
			},
			{ fieldname: "duration_column", fieldtype: "Column Break" },
			{
				label: "Minutes",
				fieldname: "minutes",
				fieldtype: "Int",
				default: elapsed?.minutes,
				onchange: normalizeDuration,
			},
			{ fieldname: "details_section", fieldtype: "Section Break", hide_border: 1 },
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
				// When Is Billable is toggled on, seed Billable Time from the duration
				onchange: () => seedBillableTime(d),
			},
			{
				label: "Billable Time",
				fieldname: "billing_hrs",
				fieldtype: "Float",
				depends_on: "eval:doc.is_billable == 1",
				description:
					"In hours. Defaults to the duration when Billable is checked. Edit independently if needed.",
			},
			{ label: "Completed", fieldname: "completed", fieldtype: "Check" },
		],
		size: "small",
		primary_action_label: "Submit",
		primary_action: async (values: Partial<StopTimerValues>) => {
			const minutes = durationMinutes(d);
			if (requireDuration && minutes <= 0) {
				frappe.msgprint({ message: "Enter the time to log.", title, indicator: "orange" });
				return;
			}
			// Still following the duration: end the entry at the moment of submitting.
			// A timer's start left as it was keeps its seconds, which the field may not show.
			const fromTime =
				autoStart !== null
					? startEndingNow(minutes)
					: fixedStart && values.from_time?.slice(0, 16) === fixedStart.slice(0, 16)
						? fixedStart
						: values.from_time;
			const startMs = wallClockMs(fromTime);
			if (!fromTime || startMs === null) {
				frappe.msgprint({ message: "Enter when the work started.", title, indicator: "orange" });
				return;
			}
			const hours = minutes / 60;
			const isBillable = values.is_billable ? 1 : 0;
			try {
				const status = await onSubmit({
					task: values.task,
					activity_type: values.activity_type || "",
					from_time: fromTime,
					to_time: wallClockStr(startMs + minutes * 60_000),
					hours,
					billing_hours: isBillable ? values.billing_hrs || hours : 0,
					description: values.description || "",
					is_billable: isBillable,
					completed: values.completed ? 1 : 0,
				});
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
