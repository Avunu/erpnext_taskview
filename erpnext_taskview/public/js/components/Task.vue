<template>
    <div class="task" @click="emitInteraction">
        <div class="task">
            <!-- Spiced-up Checkbox -->
            <div class="custom-checkbox task-control">
                <label>
                    <input type="checkbox" :checked="doc.status === 'Completed'" @change="toggleComplete" />
                    <span class="checkmark"></span>
                </label>
            </div>
            
            <!-- Task Subject -->
            <div class="task-subject-container">
                <p v-if="!isEditing" class="task-subject" @click="editTask">
                    {{ doc.text }}
                </p>
                <input v-if="isEditing" type="text" v-model="editedText" @blur="saveEdit" @keyup.enter="unfocusInput"
                    class="task-subject-edit" />
            </div>


            <!-- only render the controls if the doc is not a project and is not blank -->
            <div v-if="!doc.isProject && !doc.isBlank" class="task-controls">

                <!-- Button to start/pause/resume timer -->
                <button v-if="doc.status!=='Completed'"
                    class="btn task-control" 
                    :class="{
                        'btn-info': doc.timerStatus === 'stopped', // Start button
                        'btn-warning': doc.timerStatus === 'running', // Pause button
                        'btn-success': doc.timerStatus === 'paused'  // Resume button
                    }" 
                    @click="toggleTimer"
                >
                    {{
                        doc.timerStatus === 'stopped' 
                            ? 'Start Timer' 
                            : doc.timerStatus === 'paused' 
                            ? 'Resume Timer' 
                            : 'Pause Timer'
                    }}
                </button>

                <!-- Button to log time or stop timer -->
                <button v-if="doc.status!=='Completed'"
                    class="btn task-control" 
                    :class="{
                        'btn-secondary': doc.timerStatus === 'stopped', // Log time button
                        'btn-danger': doc.timerStatus !== 'stopped' // Stop button
                    }"
                    @click="logOrStopTimer"
                >
                    {{ doc.timerStatus === 'stopped' ? 'Log Time' : 'Stop Timer' }}
                </button>
            </div>
        </div>
    </div>
</template>
<script>
import { defineComponent, ref, watch } from 'vue';
import useTask from '../assets/js/task.js';

// Global reference for the currently active timer
// let activeTimer = null;

export default defineComponent({
    name: 'Task',
    props: {
        doc: {
            type: Object,
            required: true,
            default: () => ({})
        },
        activeTimer: {
            type: Object,
            required: false,
            default: null
        }
    },
    setup(props, { emit }) {
        // const isCompleted = ref(props.doc.status === 'Completed');
        const isEditing = ref(false);
        const editedText = ref('');

        const {
            emitInteraction,
            toggleComplete,
            toggleTimer,
            logOrStopTimer,
            editTask,
            unfocusInput,
            saveEdit
        } = useTask(props, emit, isEditing, editedText);

        // Trigger editing mode if autoFocus is true
        watch(() => props.doc.autoFocus, (newVal) => {
            if (newVal) {
                editTask();
                props.doc.autoFocus = false;
            }
        });

        return {
            isEditing,
            editedText,
            toggleComplete,
            toggleTimer,
            logOrStopTimer,
            editTask,
            unfocusInput,
            saveEdit,
            emitInteraction
        };
    }
});
</script>
<style scoped>
    @import '../assets/style/task.css';
</style>