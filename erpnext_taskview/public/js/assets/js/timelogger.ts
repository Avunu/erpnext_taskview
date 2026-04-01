/**
 * @module timelogger
 *
 * Composable for the **TimeLogger** sidebar component.
 *
 * The TimeLogger serves two purposes:
 *
 * 1. **Stop timer** (`descriptionOnly = true`) — the user adds a
 *    description and the composable sends a stop signal (Timesheet Detail
 *    with `to_time` set) on close.
 * 2. **Manual time log** (`descriptionOnly = false`) — the user picks
 *    start/stop times and a description; the composable sends a new
 *    Timesheet Detail with `from_time` + `to_time`.
 *
 * Both operations go through {@link saveDoc} and ultimately hit the
 * `save_doc` backend endpoint.
 */

import { Ref, ComputedRef } from 'vue';
import { saveDoc, TimesheetDetailDoc } from './script.ts';

/**
 * Props accepted by the `useTimeLogger` composable.
 *
 * @property doc              - The underlying doc (ProjectDoc or TaskDoc)
 *                              associated with the time entry.
 * @property timesheetDetail  - The active Timesheet Detail row, or `null`
 *                              if no timer is running (manual log mode).
 * @property descriptionOnly  - When `true` the sidebar hides the datetime
 *                              pickers and only shows the description field
 *                              (stop-timer mode).
 * @property isOpened         - Whether the sidebar panel is currently visible.
 * @property currentTheme     - `'light'` or `'dark'` for theme-aware styling.
 */
export interface TimeLoggerProps {
  doc: any;
  timesheetDetail: TimesheetDetailDoc | null;
  descriptionOnly?: boolean;
  isOpened: boolean;
  currentTheme?: string;
}

/**
 * Composable that manages time logging and timer stop operations.
 *
 * @param props       - Reactive props from the TimeLogger component.
 * @param emit        - Vue emit function for component events.
 * @param description - Bound `v-model` ref for the description textarea.
 * @param startTime   - Bound `v-model` ref for the start datetime picker.
 * @param stopTime    - Bound `v-model` ref for the stop datetime picker.
 * @param docText     - Computed display text for the associated doc.
 *
 * @returns An object with:
 *  - `formatDateTime` — format a `Date` as an HTML datetime-local string.
 *  - `logTime` — validate and submit the time entry.
 *  - `closeSidebar` — close the sidebar (sends a stop signal if stopping).
 */
export default function useTimeLogger(
  props: TimeLoggerProps,
  emit: (event: string, ...args: any[]) => void,
  description: Ref<string>,
  startTime: Ref<string | null>,
  stopTime: Ref<string | null>,
  docText: ComputedRef<string>
) {

  /**
   * Format a `Date` into an `<input type="datetime-local">` compatible
   * string (`YYYY-MM-DDTHH:MM`).
   *
   * @param date - The date to format.
   * @returns An ISO-like string without seconds.
   */
  const formatDateTime = (date: Date): string => {
    const pad = (num: number): string => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  /**
   * Submit the time entry form.\n   *
   * In **manual log mode** (`!descriptionOnly`), validates that both
   * start and stop times are present, then sends a new Timesheet Detail
   * with `from_time` and `to_time`.
   *
   * In **stop mode** (`descriptionOnly`), skips validation and proceeds
   * directly to {@link closeSidebar} which handles the stop signal.
   *
   * On success, shows a Frappe toast notification.
   */
  const logTime = async (): Promise<void> => {
    if (!props.descriptionOnly) {
      if (!startTime.value || !stopTime.value) {
        alert('Both start time and stop time are required!');
        return;
      }

      try {
        const project = props.doc.project || props.doc.name;
        // Manual time log — send a TimesheetDetailDoc with from_time and to_time
        await saveDoc({
          doctype: 'Timesheet Detail',
          project: project,
          task: props.doc.name,
          from_time: startTime.value,
          to_time: stopTime.value,
          description: description.value || '',
        } as any);

        frappe.show_alert({
          message: __(`Time logged for ${docText.value}`),
          indicator: 'green'
        });
      } catch (error) {
        emit('catch-error', error);
      }
    }
    closeSidebar();
  };

  /**
   * Close the sidebar and optionally send a timer-stop signal.
   *
   * When in stop-timer mode (`descriptionOnly`) and a timesheet detail
   * exists, sends a Timesheet Detail with `to_time` set to now,
   * effectively stopping the timer on the backend.\n   *
   * Always emits `'close-time-logger'` to close the sidebar panel.
   */
  const closeSidebar = (): void => {
    if (props.descriptionOnly && props.timesheetDetail?.name) {
      // Stop the timer — send a TimesheetDetailDoc with to_time set
      saveDoc({
        doctype: 'Timesheet Detail',
        name: props.timesheetDetail.name,
        to_time: new Date().toISOString(),
        description: description.value || '',
      } as any);
    }
    emit('close-time-logger');
  };

  return {
    formatDateTime,
    logTime,
    closeSidebar
  };
}