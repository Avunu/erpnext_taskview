import { nextTick } from 'vue';
import useBackendHandler from './script.js';


export default function useTask(props, emit, isEditing, editedText, cancelTriggered) {

    const { callBackendHandler } = useBackendHandler();

    const emitInteraction = () => {
        emit('task-interaction');
    };

    const toggleComplete = async () => {
        // QUESTIONS ABOUT COMPLETION PARAMETERS WILL BE HANDLED IN THE BACKEND (SEE backend_handler IN init.py)

        props.doc.status = props.doc.status === 'Open' ? 'Completed' : 'Open';
        locals.nodes[props.doc.docName] = true;
        const updateObject = {
            status: props.doc.status
        }
        try {
            const r = await callBackendHandler('status_change', props.doc, updateObject);
            emit('catch-success', r.message);
        }
        catch (error) {
            emit('catch-error', error);
        }
        // ensure this tree branch is expanded with the new data
        emitInteraction();
    };

    const startTimer = () => {
        // Pause the previous timer if it is running
        if (props.activeTimer.value && props.activeTimer.value !== props.doc) {
            // update the timesheet detail for the previous task
            props.activeTimer.value.timesheetDetail = updateTimesheetDetail(props.activeTimer.value.project, props.activeTimer.value.docName, 'paused', props.activeTimer.value.timesheetDetail);
            props.activeTimer.value.timerStatus = 'paused'; // Pause the previous task
        }

        // update or create the timesheet detail for this task
        props.doc.timesheetDetail = updateTimesheetDetail(props.doc.project, props.doc.docName, 'running', props.doc.timesheetDetail);
        props.doc.timerStatus = 'running';
        props.activeTimer.value = props.doc;
    };

    const pauseTimer = () => {
        // update the timesheet detail for this task
        props.doc.timesheetDetail = updateTimesheetDetail(props.doc.project, props.doc.docName, 'paused', props.doc.timesheetDetail);
        props.doc.timerStatus = 'paused';
        props.activeTimer.value = {};
    };

    const stopTimer = () => {
        // update the timesheet detail for this task
        updateTimesheetDetail(props.doc.project, props.doc.docName, 'stopped', props.doc.timesheetDetail);
        props.doc.timerStatus = 'stopped';
        if (props.activeTimer.value === props.doc) {
            props.activeTimer.value = {};
        }
        // once a timer is stopped, we should clear the timesheet detail so a new one can be created if the timer is started again
        props.doc.timesheetDetail = {};
    };

    // Toggle the timer status
    const toggleTimer = () => {
        if (props.doc.timerStatus === 'stopped') {
            startTimer();
        } else if (props.doc.timerStatus === 'running') {
            pauseTimer();
        } else if (props.doc.timerStatus === 'paused') {
            startTimer();
        }
    };

    // Log time or stop the timer
    const logOrStopTimer = async () => {
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
    const updateTimesheetDetail = async (projectName, taskName, status, timesheetDetail) => {

        if (!timesheetDetail) {
            timesheetDetail = {};
        }

        // use callBackendHandler to update the timesheet detail
        try {
            const r = await callBackendHandler('toggle_timer', {project: projectName, docName: taskName, status: status, timesheetDetail: timesheetDetail}, null);
            return r.message;
        }
        catch (error) {
            emit('catch-error', error)
        }
    };

    const editTask = () => {
        isEditing.value = true;
        // Set initial text based on whether the task is blank or not
        editedText.value = props.doc.isBlank ? '' : props.doc.text;
        nextTick(() => {
            const inputElement = document.querySelector('.task-subject-edit');
            if (inputElement) {
            // if (inputElement && !props.isOpened.value) {
                inputElement.focus(); // Focus on input field
            }
        });
    };

    const unfocusInput = (event) => {
        event.target.blur(); // This triggers the @blur event, calling saveEdit
    };

    const cancelEdit = () => {
        cancelTriggered.value = true; // Indicate that the edit is being canceled
        isEditing.value = false; // Exit editing mode
        editedText.value = props.doc.text; // Revert changes
      };
  
    const handleBlur = async () => {
        if (cancelTriggered.value) {
          cancelTriggered.value = false; // Reset the flag
          return; // Do nothing if cancel was triggered
        }
        await saveEdit(); // Save the edit otherwise
      };

    const saveEdit = async () => {
        if (editedText.value.trim() !== '') {
            if (editedText.value !== props.doc.text) {
                // THIS IS WHERE WE UPDATE THE TASK OR PROJECT IN THE DATABASE
                // we need to make sure each node has accurate is_group and parent_task values as they render and move around
                props.doc.text = editedText.value;

                // if the task is blank, we need to create a new task or project in the database
                if (props.doc.isBlank) {

                    let newObject
                    let parentTask = null
                    if (props.doc.isProject) {
                        newObject = {
                            doctype: 'Project',
                            project_name: editedText.value,
                            is_active: 'Yes',
                            status: 'Open'
                        }
                    }
                    else {
                        // deal with parent_task
                        if (props.doc.parent !== props.doc.project) {
                            parentTask = props.doc.parent
                        }

                        newObject = {
                            doctype: 'Task',
                            subject: editedText.value,
                            project: props.doc.project,
                            parent_task: parentTask,
                            status: 'Open',
                            priority: 'Medium'
                        }
                    }

                    // insert the new task or project
                    try {
                        const r = await callBackendHandler('insert', {parent: {isProject: parentTask ? true : false}}, newObject);
                        emit('catch-success', r.message);
                        // emit('add-sibling-task')
                    }
                    catch (error) {
                        emit('catch-error', error);
                    }
                }
                else {
                    let text = editedText.value;
                    if (props.doc.isProject) {
                        // Split on the first colon and strip whitespace from the second part
                        const parts = editedText.value.split(':', 2); // Split on the first colon only
                        text = parts[1].trim(); // Remove any leading/trailing whitespace
                    }
                    const updateObject = props.doc.isProject ? {project_name: text} : {subject: text};
                    const nodeObject = {
                        isProject: props.doc.isProject,
                        docName: props.doc.docName
                    }
                        
                    // update the task or project in the database
                    try {
                        const r = await callBackendHandler('title_change', nodeObject, updateObject);
                        emit('catch-success', r.message);
                    }
                    catch (error) {
                        emit('catch-error', error);
                    }
                }

            }
        }
        // ensure this tree branch is expanded with the new data
        props.doc.isBlank = false;
        props.doc.expanded = true;
        if (props.doc.docName === "" && props.doc.isProject) {
            locals.nodes[props.doc.text] = true;
        } 
        else {
            locals.nodes[props.doc.project] = true;
        }
        emitInteraction();
        isEditing.value = false;
    };

    const emitSidebar = () => {
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
    }
}