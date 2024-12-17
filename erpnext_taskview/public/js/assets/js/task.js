import { nextTick } from 'vue';

export default function useTask(props, emit, isEditing, editedText, activeTimer) {

    const emitInteraction = () => {
        emit('task-interaction');
    };

    const toggleComplete = () => {

        // TODO: DON'T ALLOW PROJECTS OR TASKS TO CLOSE IF THEY OR THEIR CHILDREN HAVE RUNNING OR PAUSED TIMERS
        // OR
        // STOP ALL TIMERS WHEN A PROJECT OR TASK IS CLOSED

        // TODO: mark child tasks as completed when a parent task is completed, otherwise frappe can't handle it

        // TASKS CAN'T BE COMPLETED IF THEY HAVE TIMERS RUNNING OR PAUSED OR IF THEY HAVE CHILDREN THAT AREN'T COMPLETED

        // DO WE WANT TO THROW AN ERROR, OR AUTOMATICALLY STOP THE TIMER AND MARK THE CHILDREN AS COMPLETED? THROW AN ERROR FOR NOW


        // TODO: DEBUG THIS AND ISCOMPLETED VALUE ON LOAD, CHECK THE STATUS VALUE COMING IN FROM THE DATABASE. GET THE CHECKBOX WORKING WITH AN INITIAL COMPLETED STATUS
        props.doc.status = props.doc.status === 'Open' ? 'Completed' : 'Open';
        // isCompleted.value = props.doc.status === 'Completed' ? true : false;
        // update completed_by, completed_on, and status in the database
        // status change from Open to Completed
        frappe.db.set_value(props.doc.isProject ? 'Project' : 'Task', props.doc.docName, 'status', props.doc.status)
    };

    const startTimer = () => {
        // Pause the previous timer if it is running
        if (activeTimer && activeTimer !== props.doc) {
            // update the timesheet detail for the previous task
            activeTimer.timesheetDetail = updateTimesheetDetail(activeTimer.project, activeTimer.docName, 'paused', activeTimer.timesheetDetail);
            activeTimer.timerStatus = 'paused'; // Pause the previous task
        }

        // update or create the timesheet detail for this task
        props.doc.timesheetDetail = updateTimesheetDetail(props.doc.project, props.doc.docName, 'running', props.doc.timesheetDetail);
        props.doc.timerStatus = 'running';
        activeTimer = props.doc;
    };

    const pauseTimer = () => {
        // update the timesheet detail for this task
        props.doc.timesheetDetail = updateTimesheetDetail(props.doc.project, props.doc.docName, 'paused', props.doc.timesheetDetail);
        props.doc.timerStatus = 'paused';
        activeTimer = null;
    };

    const stopTimer = () => {
        // update the timesheet detail for this task
        updateTimesheetDetail(props.doc.project, props.doc.docName, 'stopped', props.doc.timesheetDetail);
        props.doc.timerStatus = 'stopped';
        if (activeTimer === props.doc) {
            activeTimer = null;
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
    const logOrStopTimer = () => {
        if (props.doc.timerStatus === 'stopped') {
            // Log time
            console.log(`Time logged for task "${doc.text}"`);
            // TODO: Log time, probably with a modal
        } else {
            // Stop the timer
            stopTimer();
        }
    };

    // Update the timesheet detail for the task
    const updateTimesheetDetail = (projectName, taskName, status, timesheetDetail) => {

        if (!timesheetDetail) {
            timesheetDetail = {};
        }

        frappe.call({
            method: 'erpnext_taskview.erpnext_taskview.update_timesheet_detail',
            args: {
                project_name: projectName,
                task_name: taskName,
                status: status,
                timesheet_detail: timesheetDetail
            },
            freeze: true
        })
        .then(r => {
            return r.message;
        });
    };

    const editTask = () => {
        isEditing.value = true;
        // Set initial text based on whether the task is blank or not
        editedText.value = props.doc.isBlank ? '' : props.doc.text;
        nextTick(() => {
            const inputElement = document.querySelector('.task-subject-edit');
            if (inputElement) {
                inputElement.focus(); // Focus on input field
            }
        });
    };

    const unfocusInput = (event) => {
        event.target.blur(); // This triggers the @blur event, calling saveEdit
    };

    const saveEdit = () => {
        console.log('Saving edit...', props.doc)
        if (editedText.value.trim() !== '') {
            if (editedText.value !== props.doc.text) {
                // THIS IS WHERE WE UPDATE THE TASK OR PROJECT IN THE DATABASE
                // we need to make sure each node has accurate is_group and parent_task values as they render and move around
                props.doc.text = editedText.value;

                // if the task is blank, we need to create a new task or project in the database
                if (props.doc.isBlank) {

                    let newObject
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
                        let parentTask
                        if (props.doc.parent === props.doc.project) {
                            parentTask = null
                        }
                        else {
                            // MAKE SURE THE PARENT TASK HAS IS_GROUP = 1
                            frappe.db.set_value('Task', props.doc.parent, { is_group: 1 })
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
                    frappe.db.insert(newObject).then(doc => {
                        // Mark the current task as no longer blank
                        props.doc.isBlank = false;
                        props.doc.docName = doc.name;
                        
                        // props.doc.text = `${doc.name}: ${doc.project_name}`;
                        props.doc.text = props.doc.isProject ? `${doc.name}: ${doc.project_name}` : editedText.value;
                        // Emit an event to notify the parent component to add a new blank task
                        emit('add-sibling-task', props.doc);
                    })
                }
                else {
                    console.log('Updating task or project in the database...')
                    // update the task or project in the database
                    if (props.doc.isProject) {
                        frappe.db.set_value('Project', props.doc.docName, 'project_name', editedText.value)
                    }
                    else {
                        frappe.db.set_value('Task', props.doc.docName, 'subject', editedText.value)
                    }
                }
            }
        }
        isEditing.value = false;
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
        saveEdit
    }
}