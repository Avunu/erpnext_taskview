<template>
  <div v-if="visible" ref="dockEl" class="timer-dock" :style="dockStyle">
    <div
      class="timer-dock__resize timer-dock__resize--left"
      @pointerdown="startResize($event, 'left')"
    ></div>
    <div
      class="timer-dock__resize timer-dock__resize--right"
      @pointerdown="startResize($event, 'right')"
    ></div>
    <div class="timer-dock__handle" @pointerdown="startDrag">
      <span class="timer-dock__title"> <Timer :size="14" /> Timers ({{ timerCount }}) </span>
      <span v-if="collapsed && runningTimer" class="timer-dock__running-info">
        <span class="timer-dock__running-task">{{
          runningTimer.task_subject || runningTimer.task
        }}</span>
        <span class="timer-dock__running-time">{{ runningElapsed }}</span>
      </span>
      <button class="timer-dock__toggle" @click.stop="collapsed = !collapsed">
        <ChevronDown v-if="collapsed" :size="14" />
        <ChevronUp v-else :size="14" />
      </button>
    </div>
    <div v-if="!collapsed" class="timer-dock__body">
      <TimerWidget
        v-for="timer in timerList"
        :key="timer.name"
        :timer="timer"
        @error="handleError"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TimerWidget from "./TimerWidget.vue";
import { Timer, ChevronDown, ChevronUp } from "lucide-vue-next";
import { timers, loaded, fetchTimers, getRunningTimer, type ActiveTimer } from "../timerStore";

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

    /** Clamp dock position so it stays within the viewport. */
    clampToViewport(): void {
      const maxX = Math.max(0, window.innerWidth - this.dockWidth);
      const maxY = Math.max(0, window.innerHeight - 60);
      this.posX = Math.max(0, Math.min(this.posX, maxX));
      this.posY = Math.max(0, Math.min(this.posY, maxY));
      // Also clamp width if window shrank
      if (this.dockWidth > window.innerWidth - 20) {
        this.dockWidth = Math.max(250, window.innerWidth - 20);
      }
      this.savePosition();
    },

    /** Persist dock position to sessionStorage. */
    savePosition(): void {
      try {
        sessionStorage.setItem(
          "erpnext_taskview_dock_pos",
          JSON.stringify({ x: this.posX, y: this.posY }),
        );
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
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },

    /** Handle pointer move during drag — clamped to viewport. */
    onDrag(e: PointerEvent): void {
      if (!this.dragging) return;
      this.posX = Math.max(
        0,
        Math.min(e.clientX - this.dragOffsetX, window.innerWidth - this.dockWidth),
      );
      this.posY = Math.max(0, Math.min(e.clientY - this.dragOffsetY, window.innerHeight - 60));
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
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  background: var(--fg-color, #fff);
  border: 1px solid var(--border-color, #d1d8dd);
  font-family: var(--font-stack, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
  font-size: 13px;
  user-select: none;
  transition: box-shadow 0.2s;
}

.timer-dock:hover {
  box-shadow: 0 6px 28px rgba(0, 0, 0, 0.3);
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

/* ── Collapsed running timer info ── */

.timer-dock__running-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  margin-left: 12px;
  font-weight: 400;
}

.timer-dock__running-task {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  opacity: 0.85;
}

.timer-dock__running-time {
  font-family: "SF Mono", SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  color: var(--blue-200, #9ec5fe);
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
  font-family: "SF Mono", SFMono-Regular, Menlo, Monaco, Consolas, monospace;
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
