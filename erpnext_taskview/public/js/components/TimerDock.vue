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
import { defineComponent, onMounted, onBeforeUnmount } from 'vue';
import TimerWidget from './TimerWidget.vue';
import {
	timers,
	loaded,
	loading,
	fetchTimers,
	type ActiveTimer,
} from '../assets/js/timerStore';

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
