/**
 * @module timerdock.bundle
 *
 * Global desk entry point for the floating timer dock.
 *
 * This script is loaded on every Frappe desk page via `app_include_js`.
 * It mounts a Vue app containing the {@link TimerDock} component into a
 * persistent DOM element attached to `document.body`.
 *
 * The dock auto-hides when no active timers exist and auto-shows when
 * timers appear.  It is completely independent of the task-view list page.
 */

import { createApp } from "vue";
import TimerDock from "./components/TimerDock.vue";
// import './assets/style/timerdock.css';

// Mount the dock once the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const container = document.createElement("div");
  container.id = "erpnext-taskview-timer-dock";
  document.body.appendChild(container);
  createApp(TimerDock).mount(container);
});
