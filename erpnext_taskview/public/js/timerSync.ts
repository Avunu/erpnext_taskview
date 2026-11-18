// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * @module timerSync
 *
 * Keeps the timers in step across every desk session of the user: other tabs, other
 * browsers, the phone.
 *
 * The server publishes `erpnext_taskview_timers` to the user whenever a Timesheet or one of
 * its time logs changes (`timer_sync.py`).  The event carries no data; each session answers
 * by fetching its timers again, which publishes the list to both bundles (`timerStore`).
 *
 * The event can be missed (the tab was asleep, the socket dropped or gave up after its few
 * reconnection attempts, realtime is off), so a session also fetches when it reconnects,
 * comes back online or is shown again after a while.
 *
 * Only the dock bundle starts this.  The taskview bundle has its own copy of the store, and
 * hears of a new list through the document event, so listening there too would fetch twice.
 */

import { fetchTimers, timersAge } from "./timerStore";

/** Must match `TIMERS_EVENT` in `timer_sync.py`. */
const TIMERS_EVENT = "erpnext_taskview_timers";

/**
 * Events come in bursts (one change saves a few rows, and the session that made it hears its
 * own too): they are answered by one fetch, this long after the last.
 */
const COALESCE_MS = 250;

/**
 * A reconnect right after the page loaded needs no fetch: the dock has just made one.  After
 * a longer gap events may have been missed.
 */
const RECENT_MS = 5_000;

/** A session shown again after this long fetches, whether or not it heard of a change. */
const STALE_MS = 60_000;

/** The part of the socket.io client that is used; `frappe.realtime.socket` is not typed. */
interface RealtimeSocket {
	on(event: "connect", callback: () => void): void;
}

let started = false;
let timer: ReturnType<typeof setTimeout> | undefined;
/** A change was heard while the tab was hidden; it is fetched when the tab is shown. */
let pendingWhileHidden = false;

function refresh(): void {
	fetchTimers().catch((error: unknown) => {
		console.warn("erpnext_taskview: timer refresh failed", error);
	});
}

/** Fetch soon, once for however many changes are heard meanwhile; later if the tab is hidden. */
function refreshSoon(): void {
	if (document.hidden) {
		// A background tab gains nothing from the request, and there may be many of them.
		pendingWhileHidden = true;
		return;
	}
	clearTimeout(timer);
	timer = setTimeout(refresh, COALESCE_MS);
}

function onVisible(): void {
	if (document.hidden) return;
	if (pendingWhileHidden || timersAge() > STALE_MS) {
		pendingWhileHidden = false;
		refreshSoon();
	}
}

function listen(): void {
	frappe.realtime.on(TIMERS_EVENT, refreshSoon);

	const socket = (frappe.realtime as { socket?: RealtimeSocket }).socket;
	// Every connect after the first is a reconnect, and the first can come after the page's own fetch.
	socket?.on("connect", () => {
		if (timersAge() > RECENT_MS) refreshSoon();
	});
}

/**
 * Start listening.  Safe to call more than once.
 *
 * `frappe.realtime.on` does nothing until the desk has created the socket, which it does
 * when it starts up; this can run before that.
 */
export function startTimerSync(): void {
	if (started) return;
	started = true;

	document.addEventListener("visibilitychange", onVisible);
	window.addEventListener("online", refreshSoon);

	if ((frappe.realtime as { socket?: RealtimeSocket }).socket) listen();
	else $(document).one("startup", listen);
}
