<template>
	<div v-if="visible" ref="dockEl" class="timer-dock" :style="dockStyle">
		<div class="timer-dock__handle" @pointerdown="startDrag">
			<span class="timer-dock__title">⏱ Timers ({{ timerCount }})</span>
			<button class="timer-dock__toggle" @click="collapsed = !collapsed">
				{{ collapsed ? '▼' : '▲' }}
			</button>
		</div>
		<div v-if="!collapsed" class="timer-dock__body">
			<TimerWidget v-for="timer in timerList" :key="timer.name" :timer="timer" @error="handleError" />
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TimerWidget from './TimerWidget.vue';
import {
	timers,
	loaded,
	fetchTimers,
	type ActiveTimer,
} from '../timerStore';

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
	name: 'TimerDock',
	components: { TimerWidget },

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

		/** Sorted list of timers — running first, then paused. */
		timerList(): ActiveTimer[] {
			const arr = Array.from(timers.value.values());
			arr.sort((a, b) => {
				if (a.paused !== b.paused) return a.paused - b.paused;
				return (a.task_subject || a.task).localeCompare(b.task_subject || b.task);
			});
			return arr;
		},

		/** Inline style for absolute positioning. */
		dockStyle(): Record<string, string> {
			if (!this.posInitialised) return { visibility: 'hidden' };
			return {
				left: `${this.posX}px`,
				top: `${this.posY}px`,
			};
		},
	},

	mounted() {
		this.restorePosition();
		fetchTimers();

		document.addEventListener('pointermove', this.onDrag);
		document.addEventListener('pointerup', this.endDrag);
	},

	beforeUnmount() {
		document.removeEventListener('pointermove', this.onDrag);
		document.removeEventListener('pointerup', this.endDrag);
	},

	methods: {
		/** Restore dock position from sessionStorage, or default to bottom-right. */
		restorePosition(): void {
			try {
				const saved = sessionStorage.getItem('erpnext_taskview_dock_pos');
				if (saved) {
					const { x, y } = JSON.parse(saved);
					this.posX = x;
					this.posY = y;
					this.posInitialised = true;
					return;
				}
			} catch { /* ignore */ }
			// Default: bottom-right corner with padding.
			this.posX = window.innerWidth - 340;
			this.posY = window.innerHeight - 200;
			this.posInitialised = true;
		},

		/** Begin dragging the dock. */
		startDrag(e: PointerEvent): void {
			this.dragging = true;
			const el = this.$refs.dockEl as HTMLElement;
			const rect = el.getBoundingClientRect();
			this.dragOffsetX = e.clientX - rect.left;
			this.dragOffsetY = e.clientY - rect.top;
			(e.target as HTMLElement).setPointerCapture?.(e.pointerId);
		},

		/** Handle pointer move during drag. */
		onDrag(e: PointerEvent): void {
			if (!this.dragging) return;
			this.posX = Math.max(0, Math.min(e.clientX - this.dragOffsetX, window.innerWidth - 320));
			this.posY = Math.max(0, Math.min(e.clientY - this.dragOffsetY, window.innerHeight - 60));
		},

		/** End drag and persist position. */
		endDrag(): void {
			if (!this.dragging) return;
			this.dragging = false;
			try {
				sessionStorage.setItem('erpnext_taskview_dock_pos', JSON.stringify({ x: this.posX, y: this.posY }));
			} catch { /* ignore */ }
		},

		/** Display backend errors via Frappe toast. */
		handleError(err: unknown): void {
			console.error('[TimerDock]', err);
			frappe.show_alert?.({
				message: 'Timer action failed',
				indicator: 'red',
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
	z-index: 1060;
	/* above Frappe modals (1050) */
	width: 320px;
	max-height: 80vh;
	overflow-y: auto;
	border-radius: 8px;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
	background: var(--fg-color, #fff);
	border: 1px solid var(--border-color, #d1d8dd);
	font-family: var(--font-stack, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
	font-size: 13px;
	user-select: none;
	transition: box-shadow 0.2s;
}

.timer-dock:hover {
	box-shadow: 0 6px 28px rgba(0, 0, 0, 0.3);
}

/* ── Drag handle / header ── */

.timer-dock__handle {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 12px;
	cursor: grab;
	background: var(--heading-color, #333);
	color: #fff;
	border-radius: 8px 8px 0 0;
	touch-action: none;
}

.timer-dock__handle:active {
	cursor: grabbing;
}

.timer-dock__title {
	font-weight: 600;
	font-size: 13px;
}

.timer-dock__toggle {
	background: none;
	border: none;
	color: #fff;
	cursor: pointer;
	font-size: 12px;
	padding: 2px 6px;
	opacity: 0.8;
}

.timer-dock__toggle:hover {
	opacity: 1;
}

/* ── Body / widget stack ── */

.timer-dock__body {
	display: flex;
	flex-direction: column;
	gap: 1px;
	background: var(--border-color, #d1d8dd);
}

/* ─────────────────────────────────────────────
   Timer Widget — individual timer card
   ───────────────────────────────────────────── */

.timer-widget {
	background: var(--fg-color, #fff);
	transition: background 0.15s;
}

.timer-widget--running {
	border-left: 3px solid var(--blue-500, #2490ef);
}

.timer-widget--paused {
	border-left: 3px solid var(--yellow-500, #ffc107);
}

.timer-widget__header {
	display: flex;
	align-items: center;
	padding: 8px 10px;
	cursor: pointer;
	gap: 8px;
}

.timer-widget__header:hover {
	background: var(--control-bg, #f4f5f6);
}

.timer-widget__info {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.timer-widget__project {
	font-size: 10px;
	color: var(--text-light, #8d99a6);
	text-transform: uppercase;
	letter-spacing: 0.5px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.timer-widget__task {
	font-size: 13px;
	font-weight: 500;
	color: var(--text-color, #333);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.timer-widget__time {
	font-family: 'SF Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace;
	font-size: 14px;
	font-weight: 600;
	color: var(--text-color, #333);
	white-space: nowrap;
	min-width: 70px;
	text-align: right;
}

.timer-widget--running .timer-widget__time {
	color: var(--blue-500, #2490ef);
}

.timer-widget--paused .timer-widget__time {
	color: var(--yellow-600, #d4a017);
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
	border-top: 1px solid var(--border-color, #d1d8dd);
}

.timer-widget__description {
	width: 100%;
	border: 1px solid var(--border-color, #d1d8dd);
	border-radius: 4px;
	padding: 6px 8px;
	font-size: 12px;
	font-family: inherit;
	resize: vertical;
	min-height: 40px;
	color: var(--text-color, #333);
	background: var(--control-bg, #f4f5f6);
}

.timer-widget__description:focus {
	outline: none;
	border-color: var(--blue-500, #2490ef);
	background: var(--fg-color, #fff);
}

/* ── Dark theme overrides ── */

[data-theme="dark"] .timer-dock {
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

[data-theme="dark"] .timer-widget__btn--pause {
	background: rgba(255, 193, 7, 0.15);
}

[data-theme="dark"] .timer-widget__btn--resume {
	background: rgba(13, 110, 253, 0.15);
}

[data-theme="dark"] .timer-widget__btn--stop {
	background: rgba(220, 53, 69, 0.15);
}
</style>