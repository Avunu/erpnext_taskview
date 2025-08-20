import { nextTick, Ref } from 'vue';
import useBackendHandler, { NodeData, UpdateObject } from './script.ts';

export interface TaskProps {
  doc: NodeData;
  activeTimer: Ref<NodeData | null>;
  sideTimersElement?: HTMLElement | null;
  isOpened?: boolean;
}

export interface EmitFunction {
  (event: string, ...args: any[]): void;
}

export interface TimesheetDetail {
  [key: string]: any;
}

export default function useTask(
  props: TaskProps | null, 
  emit: EmitFunction | null, 
  isEditing: Ref<boolean> | null, 
  editedText: Ref<string> | null, 
  cancelTriggered: Ref<boolean> | null
) {
  const { callBackendHandler } = useBackendHandler();

  const emitInteraction = (): void => {
    emit?.('task-interaction');
  };

  const toggleComplete = async (): Promise<void> => {
    if (!props || !emit) return;
    
    // QUESTIONS ABOUT COMPLETION PARAMETERS WILL BE HANDLED IN THE BACKEND (SEE backend_handler IN init.py)
    props.doc.status = props.doc.status === 'Open' ? 'Completed' : 'Open';
    if (props.doc.docName) {
      locals.nodes[props.doc.docName] = true;
    }
    
    const updateObject: UpdateObject = {
      status: props.doc.status
    };
    
    try {
      const r = await callBackendHandler('status_change', props.doc, updateObject);
      emit('catch-success', r.message);
    } catch (error) {
      emit('catch-error', error);
    }
    // ensure this tree branch is expanded with the new data
    emitInteraction();
  };

  const startTimer = (): void => {
    if (!props) return;
    
    // Pause the previous timer if it is running
    if (props.activeTimer.value && props.activeTimer.value !== props.doc) {
      // update the timesheet detail for the previous task
      props.activeTimer.value.timesheetDetail = updateTimesheetDetail(
        props.activeTimer.value.project || '', 
        props.activeTimer.value.docName || '', 
        'paused', 
        props.activeTimer.value.timesheetDetail
      );
      props.activeTimer.value.timerStatus = 'paused'; // Pause the previous task
    }

    // update or create the timesheet detail for this task
    props.doc.timesheetDetail = updateTimesheetDetail(
      props.doc.project || '', 
      props.doc.docName || '', 
      'running', 
      props.doc.timesheetDetail
    );
    props.doc.timerStatus = 'running';
    props.activeTimer.value = props.doc;
  };

  const pauseTimer = (): void => {
    if (!props) return;
    
    // update the timesheet detail for this task
    props.doc.timesheetDetail = updateTimesheetDetail(
      props.doc.project || '', 
      props.doc.docName || '', 
      'paused', 
      props.doc.timesheetDetail
    );
    props.doc.timerStatus = 'paused';
    props.activeTimer.value = null;
  };

  const stopTimer = (): void => {
    if (!props || !emit) return;
    
    // open the sidebar and get the description. This will also update the timesheet detail once the description is entered
    emit('open-sidebar', {
      project: props.doc.project,
      docName: props.doc.docName,
      text: props.doc.text,
      status: 'stopped',
      timesheetDetail: props.doc.timesheetDetail
    });

    // we still have to reflect the timer status in the UI here
    props.doc.timerStatus = 'stopped';
    if (props.activeTimer.value === props.doc) {
      props.activeTimer.value = null;
    }
    // once a timer is stopped, we should clear the timesheet detail so a new one can be created if the timer is started again
    props.doc.timesheetDetail = {};
  };

  // Toggle the timer status
  const toggleTimer = (): void => {
    if (!props) return;
    
    if (props.doc.timerStatus === 'stopped' || props.doc.timerStatus === 'paused') {
      startTimer();
    } else if (props.doc.timerStatus === 'running') {
      pauseTimer();
    }
  };

  // Log time or stop the timer
  const logOrStopTimer = async (): Promise<void> => {
    if (!props || !emit) return;
    
    if (props.doc.timerStatus === 'stopped') {
      // open the sidebar to choose the start and stop times
      emit('open-sidebar', {
        project: props.doc.project,
        docName: props.doc.docName,
        text: props.doc.text,
      });
    } else {
      // Stop the timer
      stopTimer();
    }
  };

  // Update the timesheet detail for the task
  const updateTimesheetDetail = async (
    projectName: string, 
    taskName: string, 
    status: string, 
    timesheetDetail?: any, 
    description: string = ''
  ): Promise<any> => {
    if (!timesheetDetail) {
      timesheetDetail = {};
    }

    // use callBackendHandler to update the timesheet detail
    try {
      const r = await callBackendHandler('toggle_timer', {
        project: projectName, 
        docName: taskName, 
        status: status, 
        timesheetDetail: timesheetDetail, 
        description: description
      }, null);
      return r.message;
    } catch (error) {
      emit?.('catch-error', error);
    }
  };

  const editTask = (): void => {
    if (!props || !isEditing || !editedText) return;
    
    isEditing.value = true;
    // Set initial text based on whether the task is blank or not
    editedText.value = props.doc.isBlank ? '' : props.doc.text || '';
    nextTick(() => {
      const inputElement = document.querySelector('.task-subject-edit') as HTMLInputElement;
      if (inputElement) {
        // if (inputElement && !props.isOpened.value) {
        inputElement.focus(); // Focus on input field
      }
    });
  };

  const unfocusInput = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    target.blur(); // This triggers the @blur event, calling saveEdit
  };

  const cancelEdit = (): void => {
    if (!cancelTriggered || !isEditing || !editedText || !props) return;
    
    cancelTriggered.value = true; // Indicate that the edit is being canceled
    isEditing.value = false; // Exit editing mode
    editedText.value = props.doc.text || ''; // Revert changes
  };

  const handleBlur = async (): Promise<void> => {
    if (!cancelTriggered) return;
    
    if (cancelTriggered.value) {
      cancelTriggered.value = false; // Reset the flag
      return; // Do nothing if cancel was triggered
    }
    await saveEdit(); // Save the edit otherwise
  };

  const saveEdit = async (): Promise<void> => {
    if (!props || !emit || !editedText || !isEditing) return;
    
    if (editedText.value.trim() !== '') {
      if (editedText.value !== props.doc.text) {
        // THIS IS WHERE WE UPDATE THE TASK OR PROJECT IN THE DATABASE
        // we need to make sure each node has accurate is_group and parent_task values as they render and move around
        props.doc.text = editedText.value;

        // if the task is blank, we need to create a new task or project in the database
        if (props.doc.isBlank) {
          let newObject: any;
          let parentTask: string | null = null;
          
          if (props.doc.isProject) {
            newObject = {
              doctype: 'Project',
              project_name: editedText.value,
              is_active: 'Yes',
              status: 'Open'
            };
          } else {
            // deal with parent_task
            if (props.doc.parent !== props.doc.project) {
              parentTask = props.doc.parent || null;
            }

            newObject = {
              doctype: 'Task',
              subject: editedText.value,
              project: props.doc.project,
              parent_task: parentTask,
              status: 'Open',
              priority: 'Medium'
            };
          }

          // insert the new task or project
          try {
            const r = await callBackendHandler('insert', {
              parent: { isProject: parentTask ? true : false }
            }, newObject);
            emit('catch-success', r.message);
            // emit('add-sibling-task')
          } catch (error) {
            emit('catch-error', error);
          }
        } else {
          let text = editedText.value;
          if (props.doc.isProject) {
            // Split on the first colon and strip whitespace from the second part
            const parts = editedText.value.split(':', 2); // Split on the first colon only
            text = parts[1].trim(); // Remove any leading/trailing whitespace
          }
          const updateObject: UpdateObject = props.doc.isProject ? 
            { project_name: text } : 
            { subject: text };
          const nodeObject = {
            isProject: props.doc.isProject,
            docName: props.doc.docName
          };

          // update the task or project in the database
          try {
            const r = await callBackendHandler('title_change', nodeObject, updateObject);
            emit('catch-success', r.message);
          } catch (error) {
            emit('catch-error', error);
          }
        }
      }
    }
    
    // ensure this tree branch is expanded with the new data
    props.doc.isBlank = false;
    props.doc.expanded = true;
    if (props.doc.docName === "" && props.doc.isProject) {
      locals.nodes[props.doc.text || ''] = true;
    } else {
      locals.nodes[props.doc.project || ''] = true;
    }
    emitInteraction();
    isEditing.value = false;
  };

  const emitSidebar = (): void => {
    if (!props || !emit) return;
    emit('open-sidebar', props.doc);
  };

  return {
    emitInteraction,
    toggleComplete,
    startTimer,
    pauseTimer,
    stopTimer,
    toggleTimer,
    logOrStopTimer,
    updateTimesheetDetail,
    editTask,
    unfocusInput,
    saveEdit,
    cancelEdit,
    handleBlur,
    emitSidebar
  };
}