<template>
    <div class="task">
        <!-- Task Subject -->
        <div class="task-subject-container">
            <p v-if="!isEditing" class="task-subject" @click="editTask">
                {{ doc.text }}
            </p>
            <input v-if="isEditing" type="text" v-model="editedText" @blur="saveEdit" @keyup.enter="saveEdit"
                class="task-subject-edit" />
        </div>

        <div class="task-controls">
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
            default: () => { }
        }
    },
    setup(props) {
        const isCompleted = ref(false);
        const timerActive = ref(false);
        const isEditing = ref(false);
        const editedText = ref(props.doc.text);

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
            editedText.value = props.doc.text; // Initialize input value
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
            saveEdit
        };
    }
});
</script>
<style scoped>
.task {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.task-subject-container {
    display: flex;
    align-items: center;
}

.task-subject {
    padding: 0;
    margin: 0;
    cursor: text;
    /* Text cursor for editing */
}

.task-subject-edit {
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    width: 100%;
    /* Ensure it stretches to full width */
}

.task-controls {
    display: flex;
    align-items: center;
}

.task-control {
    margin-right: 10px;
    display: flex;
    align-items: center;
}

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
    background-color: #eee;
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
