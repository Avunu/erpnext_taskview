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

                <!-- Button to start timer -->
                <button class="btn btn-info task-control" @click="startTimer">Start Timer</button>

                <!-- Button to log time -->
                <button class="btn btn-secondary task-control">Log Time</button>
            </div>
            <!-- if it is a project, give it a checkbox to close the project -->
            <div v-if="doc.isProject" class="task-controls">
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
import { defineComponent, ref, nextTick } from 'vue';

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

        const emitInteraction = () => {
            emit('task-interaction');
        };

        const toggleComplete = () => {
            isCompleted.value = !isCompleted.value;
            console.log(`Task "${props.doc.text}" completed: ${isCompleted.value}`);
        };

        const startTimer = () => {
            timerActive.value = true;
            console.log(`Timer started for task "${props.doc.text}"`);
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

        const saveEdit = () => {
            if (editedText.value.trim() !== '') {
                props.doc.text = editedText.value; // Update prop or emit an event
            }
            isEditing.value = false;
        };

        return {
            isCompleted,
            timerActive,
            isEditing,
            editedText,
            toggleComplete,
            startTimer,
            editTask,
            saveEdit,
            emitInteraction
        };
    }
});
</script>
<style scoped>
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
</style>
