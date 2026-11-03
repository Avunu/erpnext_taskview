<template>
	<div v-if="visible" ref="dockEl" class="timer-dock" :style="dockStyle">
		<div class="timer-dock__resize timer-dock__resize--left" @pointerdown="startResize($event, 'left')"></div>
		<div
			class="timer-dock__resize timer-dock__resize--right"
			@pointerdown="startResize($event, 'right')"
		></div>
		<div class="timer-dock__handle" @pointerdown="startDrag">
			<span class="timer-dock__title"> <Timer :size="14" /> Timers ({{ timerCount }}) </span>
			<span v-if="collapsed && runningTimer" class="timer-dock__running-info">
				<span class="timer-dock__running-task">{{ runningTimer.task_subject || runningTimer.task }}</span>
				<span class="timer-dock__running-time">{{ runningElapsed }}</span>
			</span>
			<button class="timer-dock__toggle" @click.stop="collapsed = !collapsed">
				<ChevronDown v-if="collapsed" :size="14" />
				<ChevronUp v-else :size="14" />
			</button>
		</div>
		<div v-if="!collapsed" class="timer-dock__body">
			<TimerWidget v-for="timer in timerList" :key="timer.name" :timer="timer" @error="handleError" />
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TimerWidget from "./TimerWidget.vue";
import { Timer, ChevronDown, ChevronUp } from "lucide-vue-next";
import { timers, loaded, fetchTimers, getRunningTimer, type ActiveTimer } from "../timerStore";

/**
 * The desk's top bar in both of its forms: the `<header>` frappe renders at
 * the top of `.main-section` (a theme may mount its own fixed header into it),
 * and the `.sticky-top` navbar frappe swaps it for in read-only, impersonation,
 * announcement and mobile modes.
 */
const TOP_BAR_SELECTOR = ".main-section > header, .main-section > .sticky-top";

/** How much of the dock (its header bar) must stay above the viewport's bottom edge. */
const MIN_VISIBLE_HEIGHT = 60;

/**
 * The bottom edge of the desk's top bar, or 0 when there is none.
 *
 * The bar is pinned to the top of the viewport and stacks above the dock, so a
 * dock dragged under it has its drag handle covered and can't be dragged back.
 */
function topBarBottom(): number {
	let bottom = 0;
	for (const el of document.querySelectorAll<HTMLElement>(TOP_BAR_SELECTOR)) {
		const { position } = getComputedStyle(el);
		if (position !== "fixed" && position !== "sticky") continue;
		const rect = el.getBoundingClientRect();
		if (rect.height > 0 && rect.top <= 1) bottom = Math.max(bottom, rect.bottom);
	}
	return bottom;
}

/**
 * Floating, draggable timer dock — persistent global overlay.
 *
 * Renders a stack of {@link TimerWidget}s showing all active (open)
 * timers for the current user.  The dock:
 *
 * - Auto-hides when no timers are active.
 * - Is draggable via the header handle (pointer events).
 * - Persists position in `sessionStorage`.
 * - Can be collapsed to just the header bar.
 * - Fetches initial state from `get_active_timers` on mount.
 *
 * ## Event flow
 *
 * ```
 * TimerWidget --(@error)--> TimerDock --> frappe.show_alert
 * TimerWidget --> timerStore.sendTimerAction --> server
 *       ↓
 * timerStore.fetchTimers (auto-refresh)
 *       ↓
 * timers ref updates --> dock re-renders
 * ```
 */
export default defineComponent({
	name: "TimerDock",
	components: { TimerWidget, Timer, ChevronDown, ChevronUp },

	data() {
		return {
			/** Whether the widget stack is collapsed to just the header. */
			collapsed: false,
			/** Dock position (bottom-right default). */
			posX: 0,
			posY: 0,
			/** Whether we've initialised position. */
			posInitialised: false,
			/** Drag state. */
			dragging: false,
			dragOffsetX: 0,
			dragOffsetY: 0,
			/** The top bar's bottom edge, measured once per drag. */
			dragMinY: 0,
			/** Watches the top bar, which mounts (or is replaced) after the dock. */
			topBarObserver: null as ResizeObserver | null,
			/** The top-bar elements being observed. */
			topBars: [] as Element[],
			/** Dock width (resizable). */
			dockWidth: 320,
			/** Resize state. */
			resizing: false as false | "left" | "right",
			resizeStartX: 0,
			resizeStartWidth: 0,
			resizeStartPosX: 0,
			/** Tick for running timer display while collapsed. */
			now: Date.now(),
			tickInterval: null as ReturnType<typeof setInterval> | null,
		};
	},

	computed: {
		/** Whether the dock should be visible (timers exist). */
		visible(): boolean {
			return loaded.value && timers.value.size > 0;
		},

		/** Number of active timers. */
		timerCount(): number {
			return timers.value.size;
		},

		/** List of timers in creation order (no re-sorting on pause/resume). */
		timerList(): ActiveTimer[] {
			return Array.from(timers.value.values());
		},

		/** The currently running (non-paused) timer, if any. */
		runningTimer(): ActiveTimer | null {
			return getRunningTimer();
		},

		/** Elapsed display for the running timer (shown when collapsed). */
		runningElapsed(): string {
			if (!this.runningTimer) return "";
			const pausedSec = this.runningTimer.paused_time_in_seconds || 0;
			let totalSeconds = pausedSec;
			if (this.runningTimer.start_time) {
				const segmentMs = this.now - new Date(this.runningTimer.start_time).getTime();
				totalSeconds += Math.max(0, Math.floor(segmentMs / 1000));
			}
			const h = Math.floor(totalSeconds / 3600);
			const m = Math.floor((totalSeconds % 3600) / 60);
			const s = totalSeconds % 60;
			return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
		},

		/** Inline style for absolute positioning + dynamic width. */
		dockStyle(): Record<string, string> {
			if (!this.posInitialised) return { visibility: "hidden" };
			return {
				left: `${this.posX}px`,
				top: `${this.posY}px`,
				width: `${this.dockWidth}px`,
			};
		},
	},

	mounted() {
		this.restorePosition();
		this.restoreWidth();
		fetchTimers();

		document.addEventListener("pointermove", this.onDrag);
		document.addEventListener("pointermove", this.onResize);
		document.addEventListener("pointerup", this.endDrag);
		document.addEventListener("pointerup", this.endResize);
		window.addEventListener("resize", this.clampToViewport);

		this.topBarObserver = new ResizeObserver(() => this.trackTopBar());
		this.trackTopBar();

		this.tickInterval = setInterval(() => {
			this.now = Date.now();
		}, 1000);
	},

	beforeUnmount() {
		document.removeEventListener("pointermove", this.onDrag);
		document.removeEventListener("pointermove", this.onResize);
		document.removeEventListener("pointerup", this.endDrag);
		document.removeEventListener("pointerup", this.endResize);
		window.removeEventListener("resize", this.clampToViewport);

		this.topBarObserver?.disconnect();
		this.topBarObserver = null;
		this.topBars = [];

		if (this.tickInterval !== null) {
			clearInterval(this.tickInterval);
			this.tickInterval = null;
		}
	},

	methods: {
		/** Restore dock position from sessionStorage, or default to bottom-right. */
		restorePosition(): void {
			try {
				const saved = sessionStorage.getItem("erpnext_taskview_dock_pos");
				if (saved) {
					const { x, y } = JSON.parse(saved);
					this.posX = x;
					this.posY = y;
					this.clampToViewport();
					this.posInitialised = true;
					return;
				}
			} catch {
				/* ignore */
			}
			// Default: bottom-right corner with padding.
			this.posX = window.innerWidth - this.dockWidth - 20;
			this.posY = window.innerHeight - 200;
			this.posInitialised = true;
		},

		/** Restore dock width from sessionStorage. */
		restoreWidth(): void {
			try {
				const saved = sessionStorage.getItem("erpnext_taskview_dock_width");
				if (saved) {
					this.dockWidth = Math.max(250, Math.min(Number(saved), window.innerWidth - 20));
				}
			} catch {
				/* ignore */
			}
		},

		/** Persist dock width to sessionStorage. */
		saveWidth(): void {
			try {
				sessionStorage.setItem("erpnext_taskview_dock_width", String(this.dockWidth));
			} catch {
				/* ignore */
			}
		},

		/** Clamp a horizontal position so the whole dock stays in the viewport. */
		clampX(x: number): number {
			return Math.max(0, Math.min(x, window.innerWidth - this.dockWidth));
		},

		/**
		 * Clamp a vertical position so the dock's header stays on screen: below
		 * the top bar (`minY`) and above the viewport's bottom edge.  `minY` wins
		 * in a window too short for both.
		 */
		clampY(y: number, minY: number): number {
			return Math.max(minY, Math.min(y, window.innerHeight - MIN_VISIBLE_HEIGHT));
		},

		/** Clamp dock position so it stays within the viewport, below the top bar. */
		clampToViewport(): void {
			// Clamp width first if window shrank, so the X clamp uses the final width.
			if (this.dockWidth > window.innerWidth - 20) {
				this.dockWidth = Math.max(250, window.innerWidth - 20);
			}
			this.posX = this.clampX(this.posX);
			this.posY = this.clampY(this.posY, topBarBottom());
			this.savePosition();
		},

		/**
		 * Keep the dock below the top bar as the bar changes.  The desk boots
		 * after the dock mounts, a theme may mount its header later still, and
		 * frappe can replace the element outright, so the observed set is
		 * refreshed whenever one of them resizes (a removed element resizes to
		 * nothing), and the dock is re-clamped.
		 */
		trackTopBar(): void {
			const observer = this.topBarObserver;
			if (!observer) return;
			const bars = Array.from(document.querySelectorAll(TOP_BAR_SELECTOR));
			const changed = bars.length !== this.topBars.length || bars.some((el, i) => el !== this.topBars[i]);
			if (changed) {
				observer.disconnect();
				for (const el of bars) observer.observe(el);
				this.topBars = bars;
			}
			this.clampToViewport();
		},

		/** Persist dock position to sessionStorage. */
		savePosition(): void {
			try {
				sessionStorage.setItem("erpnext_taskview_dock_pos", JSON.stringify({ x: this.posX, y: this.posY }));
			} catch {
				/* ignore */
			}
		},

		/** Begin dragging the dock. */
		startDrag(e: PointerEvent): void {
			if (this.resizing) return;
			this.dragging = true;
			const el = this.$refs.dockEl as HTMLElement;
			const rect = el.getBoundingClientRect();
			this.dragOffsetX = e.clientX - rect.left;
			this.dragOffsetY = e.clientY - rect.top;
			this.dragMinY = topBarBottom();
			(e.target as HTMLElement).setPointerCapture?.(e.pointerId);
		},

		/** Handle pointer move during drag — clamped to the viewport, below the top bar. */
		onDrag(e: PointerEvent): void {
			if (!this.dragging) return;
			this.posX = this.clampX(e.clientX - this.dragOffsetX);
			this.posY = this.clampY(e.clientY - this.dragOffsetY, this.dragMinY);
		},

		/** End drag and persist position. */
		endDrag(): void {
			if (!this.dragging) return;
			this.dragging = false;
			this.savePosition();
		},

		/** Begin resizing the dock from a side edge. */
		startResize(e: PointerEvent, side: "left" | "right"): void {
			e.stopPropagation();
			this.resizing = side;
			this.resizeStartX = e.clientX;
			this.resizeStartWidth = this.dockWidth;
			this.resizeStartPosX = this.posX;
			(e.target as HTMLElement).setPointerCapture?.(e.pointerId);
		},

		/** Handle pointer move during resize. */
		onResize(e: PointerEvent): void {
			if (!this.resizing) return;
			const dx = e.clientX - this.resizeStartX;
			if (this.resizing === "right") {
				const maxW = window.innerWidth - this.posX;
				this.dockWidth = Math.max(250, Math.min(this.resizeStartWidth + dx, maxW));
			} else {
				// Left edge: width grows in the opposite direction, position shifts
				const newWidth = Math.max(250, this.resizeStartWidth - dx);
				const newX = this.resizeStartPosX + (this.resizeStartWidth - newWidth);
				if (newX >= 0) {
					this.dockWidth = newWidth;
					this.posX = newX;
				}
			}
		},

		/** End resize and persist width + position. */
		endResize(): void {
			if (!this.resizing) return;
			this.resizing = false;
			this.saveWidth();
			this.savePosition();
		},

		/** Display backend errors via Frappe toast. */
		handleError(err: unknown): void {
			console.error("[TimerDock]", err);
			frappe.show_alert?.({
				message: "Timer action failed",
				indicator: "red",
			});
		},
	},
});
</script>

<style>
/* ─────────────────────────────────────────────
   Timer Dock — floating global overlay
   ───────────────────────────────────────────── */

.timer-dock {
	position: fixed;
	z-index: 500;
	max-height: 80vh;
	overflow-x: hidden;
	overflow-y: auto;
	border-radius: var(--border-radius);
	box-shadow: var(--modal-shadow);
	background: var(--fg-color);
	border: 1px solid var(--border-color);
	font-family: var(--font-stack);
	font-size: var(--text-sm);
	user-select: none;
	transition: box-shadow 0.2s;
}

.timer-dock:hover {
	box-shadow: var(--modal-shadow);
}

/* ── Resize handles ── */

.timer-dock__resize {
	position: absolute;
	top: 0;
	bottom: 0;
	width: 6px;
	z-index: 10;
}

.timer-dock__resize--left {
	left: 0;
	cursor: ew-resize;
}

.timer-dock__resize--right {
	right: 0;
	cursor: ew-resize;
}

/* ── Drag handle / header ── */

.timer-dock__handle {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 12px;
	cursor: grab;
	background: var(--heading-color);
	color: var(--white);
	border-radius: var(--border-radius) var(--border-radius) 0 0;
	touch-action: none;
}

.timer-dock__handle:active {
	cursor: grabbing;
}

.timer-dock__title {
	font-weight: var(--weight-semibold);
	font-size: var(--text-sm);
}

.timer-dock__toggle {
	background: none;
	border: none;
	color: var(--white);
	cursor: pointer;
	font-size: var(--text-xs);
	padding: 2px 6px;
	opacity: 0.8;
}

.timer-dock__toggle:hover {
	opacity: 1;
}

/* ── Collapsed running timer info ── */

.timer-dock__running-info {
	display: flex;
	align-items: center;
	gap: 8px;
	flex: 1;
	min-width: 0;
	margin-left: 12px;
	font-weight: var(--weight-regular);
}

.timer-dock__running-task {
	flex: 1;
	min-width: 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	font-size: var(--text-xs);
	opacity: 0.85;
}

.timer-dock__running-time {
	font-family: var(--font-family-mono);
	font-size: var(--text-xs);
	font-weight: var(--weight-semibold);
	white-space: nowrap;
	color: var(--blue-200);
}

/* ── Body / widget stack ── */

.timer-dock__body {
	display: flex;
	flex-direction: column;
	gap: 1px;
	background: var(--border-color);
}

/* ─────────────────────────────────────────────
   Timer Widget — individual timer card
   ───────────────────────────────────────────── */

.timer-widget {
	background: var(--fg-color);
	transition: background 0.15s;
}

.timer-widget--running {
	border-left: 3px solid var(--blue-500);
}

.timer-widget--paused {
	border-left: 3px solid var(--yellow-500);
}

.timer-widget__header {
	display: flex;
	align-items: center;
	padding: 8px 10px;
	cursor: pointer;
	gap: 8px;
}

.timer-widget__header:hover {
	background: var(--control-bg);
}

.timer-widget__info {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.timer-widget__project {
	font-size: var(--text-tiny);
	color: var(--text-light);
	text-transform: uppercase;
	letter-spacing: 0.5px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.timer-widget__task {
	font-size: var(--text-sm);
	font-weight: var(--weight-medium);
	color: var(--text-color);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.timer-widget__time {
	font-family: var(--font-family-mono);
	font-size: var(--text-md);
	font-weight: var(--weight-semibold);
	color: var(--text-color);
	white-space: nowrap;
	min-width: 70px;
	text-align: right;
}

.timer-widget--running .timer-widget__time {
	color: var(--blue-500);
}

.timer-widget--paused .timer-widget__time {
	color: var(--yellow-600);
}

/* ── Controls ── */

.timer-widget__controls {
	display: flex;
	gap: 4px;
}

/* Timer button styles imported via task-controls.css */

/* ── Expanded detail ── */

.timer-widget__detail {
	padding: 6px 10px 10px;
	border-top: 1px solid var(--border-color);
}

.timer-widget__description {
	width: 100%;
	border: 1px solid var(--border-color);
	border-radius: var(--border-radius-tiny);
	padding: 6px 8px;
	font-size: var(--text-xs);
	font-family: inherit;
	resize: vertical;
	min-height: 40px;
	color: var(--text-color);
	background: var(--control-bg);
}

.timer-widget__description:focus {
	outline: none;
	border-color: var(--blue-500);
	background: var(--fg-color);
}

/* ── Dark theme overrides ── */

[data-theme="dark"] .timer-dock {
	box-shadow: var(--modal-shadow);
}

/* The header uses --heading-color as a background, but that is a *text* token:
   in dark themes it flips to a near-white gray, leaving white-on-white with no
   contrast. Use an elevated neutral surface + the theme's text color so the bar
   stays a legible dark header in both the core and carbon dark themes. */
[data-theme="dark"] .timer-dock__handle {
	background: var(--subtle-fg);
	color: var(--text-color);
}
</style>
