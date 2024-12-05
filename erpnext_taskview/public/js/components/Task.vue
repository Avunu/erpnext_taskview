<template>
    <div class="task" @click="emitInteraction">
        <div class="task">
            <!-- Task Subject -->
            <div class="task-subject-container">
                <p v-if="!isEditing" class="task-subject" @click="editTask">
                    {{ doc.text }}
                </p>
                <input v-if="isEditing" type="text" v-model="editedText" @blur="saveEdit" @keyup.enter="saveEdit"
                    class="task-subject-edit" />
            </div>

            <!-- only render the controls if the doc is not a project and is not blank -->
            <div v-if="!doc.isProject && !doc.isBlank" class="task-controls">

                <!-- Spiced-up Checkbox -->
                <div class="custom-checkbox task-control">
                    <label>
                        <input type="checkbox" v-model="isCompleted" @change="toggleComplete" />
                        <span class="checkmark"></span>
                        Mark as Complete
                    </label>
                </div>

            <!-- Button to start/stop timer -->
            <button 
                class="btn task-control" 
                :class="timerActive ? 'btn-danger' : 'btn-info'" 
                @click="toggleTimer"
            >
                {{ timerActive ? 'Stop Timer' : 'Start Timer' }}
            </button>

            <!-- Button to log time -->
            <button 
                class="btn btn-secondary task-control" 
                :disabled="timerActive" 
                :class="{ 'btn-disabled': timerActive }"
            >
                Log Time
            </button>            
            </div>
            <!-- if it is a project and is not blank, give it a checkbox to close the project -->
            <div v-if="doc.isProject && !doc.isBlank" class="task-controls">
                <div class="custom-checkbox task-control">
                    <label>
                        <input type="checkbox" v-model="isCompleted" @change="toggleComplete" />
                        <span class="checkmark"></span>
                        Close Project
                    </label>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { defineComponent, ref, reactive, nextTick, watch } from 'vue';

let activeTimer = null; // Global reference for the currently active timer

export default defineComponent({
    name: 'Task',
    props: {
        doc: {
            type: Object,
            required: true,
            default: () => ({})
        }
    },
    setup(props, { emit }) {
        const isCompleted = ref(false);
        const timerActive = ref(false);
        const isEditing = ref(false);
        const editedText = ref(''); // Initialize as empty

        // Trigger editing mode if autoFocus is true
        watch(() => props.doc.autoFocus, (newVal) => {
            if (newVal) {
                editTask();
                props.doc.autoFocus = false;
            }
        });

        const emitInteraction = () => {
            emit('task-interaction');
        };

        const toggleComplete = () => {
            isCompleted.value = !isCompleted.value;
            console.log(`Task "${props.doc.text}" completed: ${isCompleted.value}`);
        };

        // TODO: Implement timer functionality 
        const toggleTimer = () => {
            timerActive.value = !timerActive.value;
            console.log(
                `${timerActive.value ? 'Timer started' : 'Timer stopped'} for task "${props.doc.text}"`
            );
        };
        // const toggleTimer = () => {
        //     if (timerActive.value) {
        //         // Stop the current timer
        //         timerActive.value = false;
        //         console.log(`Timer stopped for task "${props.doc.text}"`);
        //         activeTimer = null;
        //     } else {
        //         // Pause any other active timer
        //         if (activeTimer && activeTimer !== props.doc.docName) {
        //             console.log(`Pausing timer for task "${activeTimer}"`);
        //             emit('pause-timer', activeTimer); // Emit an event to pause other timers
        //         }

        //         // Start this timer
        //         timerActive.value = true;
        //         activeTimer = props.doc.docName; // Update the active timer reference
        //         console.log(`Timer started for task "${props.doc.text}"`);
        //     }
        // };

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

        // THINGS GET REALLY WACKY IF YOU TRY EDITING AND SAVING THE BLANK PROJECT. NEEDS WORK
        const saveEdit = () => {
            console.log('Save edit called');
            if (editedText.value.trim() !== '') {
                if (editedText.value !== props.doc.text) {
                    console.log(`Task "${props.doc.text}" edited to: ${editedText.value}`);
                    console.log(`Emitting task interaction for task "${props.doc.docName}"`);
                    // THIS IS WHERE WE UPDATE THE TASK OR PROJECT IN THE DATABASE
                    console.log('this is where I make a new project in frappe?');
                    // we need to make sure each node has accurate is_group and parent_task values as they render and move around
                    props.doc.text = editedText.value;

                    if (props.doc.isBlank) {
                        console.log('Blank task detected');
                        console.log(props.doc);
                        // Mark the current task as no longer blank
                        props.doc.isBlank = false;
                        // Emit an event to notify the parent component to add a new blank task
                        emit('add-sibling-task', props.doc);
                    }
                }
            }
            isEditing.value = false;
        };

        return {
            isCompleted,
            timerActive,
            isEditing,
            editedText,
            toggleComplete,
            toggleTimer,
            editTask,
            saveEdit,
            emitInteraction
        };
    }
});
</script>
<style scoped>

.highlighted-project div .task-subject-container {
    font-weight: bold;
}

.task {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
}

.task-subject-container {
    flex-grow: 1;
    /* Allows the subject container to take up available space */
    margin-right: 10px;
    /* Add some space between the subject and controls */
    border-bottom: 1px dashed darkgrey;
}

.task-subject {
    padding: 0;
    margin: 0;
    cursor: text;
    width: 100%;
    white-space: nowrap;
    /* Prevents text from wrapping */
    overflow: hidden;
    text-overflow: ellipsis;
    /* Adds ellipsis if the text overflows */
}

.task-subject-edit {
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    width: 100%;
    white-space: nowrap;
    /* Prevents text from wrapping in edit mode */
    overflow: hidden;
    text-overflow: ellipsis;
    /* Adds ellipsis if the text overflows */
}

.task-controls {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    /* Prevents controls from shrinking */
}

.task-control {
    margin-right: 10px;
    display: flex;
    align-items: center;
}

/* custom checkbox styles */
.custom-checkbox {
    display: flex;
    align-items: center;
    position: relative;
}

.custom-checkbox label {
    display: flex;
    align-items: center;
    cursor: pointer;
    margin: 0;
}

.custom-checkbox input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
}

.custom-checkbox .checkmark {
    height: 20px;
    width: 20px;
    background-color: #d8dfed;
    border-radius: 4px;
    margin-right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.custom-checkbox input:checked~.checkmark {
    background-color: #2196F3;
}

.custom-checkbox .checkmark:after {
    content: "";
    position: absolute;
    display: none;
}

.custom-checkbox input:checked~.checkmark:after {
    display: block;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
}

.btn-disabled {
    /* background-color: #d8d8d8; */
    color: #a1a1a1;
    cursor: not-allowed;
    pointer-events: none;
}
</style>
