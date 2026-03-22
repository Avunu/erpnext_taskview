import { Ref, ComputedRef } from 'vue';
import useBackendHandler from './script.ts';
import useTask from './task.ts';
import { EmitFunction } from './task.ts';

export interface TimeLoggerProps {
  doc: {
    project?: string;
    docName?: string;
    timesheetDetail?: any;
  };
  isOpened: boolean;
  currentTheme?: string;
  descriptionOnly?: boolean;
}

export default function useTimeLogger(
  props: TimeLoggerProps, 
  emit: EmitFunction, 
  description: Ref<string>, 
  startTime: Ref<string | null>, 
  stopTime: Ref<string | null>, 
  docText: ComputedRef<string>
) {
  const { callBackendHandler } = useBackendHandler();
  const { updateTimesheetDetail } = useTask(null, null, null, null, null);

  const formatDateTime = (date: Date): string => {
    const pad = (num: number): string => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const logTime = async (): Promise<void> => {
    if (!props.descriptionOnly) {
      if (!startTime.value || !stopTime.value) {
        alert('Both start time and stop time are required!');
        return;
      }

      // call the backend handler to log the time
      try {
        await callBackendHandler('log_time', {
          project: props.doc.project,
          docName: props.doc.docName,
          startTime: startTime.value,
          stopTime: stopTime.value,
          description: description.value || ''
        } as any, null);

        frappe.show_alert({
          message: __(`Time logged for ${docText.value}`),
          indicator: 'green'
        });
      } catch (error) {
        emit('catch-error', error);
      }
    }
    closeSidebar(); // Close sidebar after logging time
  };

  const closeSidebar = (): void => {
    if (props.descriptionOnly) {
      updateTimesheetDetail(
        props.doc.project || '', 
        props.doc.docName || '', 
        'stopped', 
        props.doc.timesheetDetail, 
        description.value || ''
      );
    }
    emit('close-time-logger');
  };

  return {
    formatDateTime,
    logTime,
    closeSidebar
  };
}