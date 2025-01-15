<template>
	<div class="task" @click="emitInteraction">
		<div class="task">
			<!-- Spiced-up Checkbox -->
			<div v-if="!doc.isBlank" class="custom-checkbox task-control">
				<label>
					<input type="checkbox" :checked="doc.status === 'Completed'" @change="toggleComplete" />
					<span class="checkmark"></span>
				</label>
			</div>

			<!-- button to expand sidebar with this node (only for non-blank projects and tasks) -->
			<div class="expand-sidebar-container">
				<button v-if="!doc.isBlank" class="expand-sidebar" @click="emitSidebar">
					<span class="expand-icon">⤢</span>
				</button>
			</div>

			<!-- Task Subject -->
			<div class="task-subject-container">
				<p v-if="!isEditing" class="task-subject" @click="editTask">
					{{ doc.text }}
				</p>
				<input v-if="isEditing" type="text" v-model="editedText" 
				@blur="handleBlur" 
				@keyup.enter="unfocusInput"
				@keydown.esc="cancelEdit" class="task-subject-edit" />
			</div>

			<!-- only render the controls if the doc is not a project and is not blank -->
			<div v-if="!doc.isProject && !doc.isBlank" class="task-controls">
				<button v-if="doc.status !== 'Completed'" class="btn task-control" :class="{
					'btn-info': doc.timerStatus === 'stopped',
					'btn-warning': doc.timerStatus === 'running',
					'btn-success': doc.timerStatus === 'paused'
				}" @click="toggleTimer">
					{{
						doc.timerStatus === 'stopped'
							? 'Start'
							: doc.timerStatus === 'paused'
								? 'Resume'
								: 'Pause'
					}}
				</button>

				<button v-if="doc.status !== 'Completed'" class="btn task-control" :class="{
					'btn-secondary': doc.timerStatus === 'stopped',
					'btn-danger': doc.timerStatus !== 'stopped'
				}" @click="logOrStopTimer">
					{{ doc.timerStatus === 'stopped' ? 'Log' : 'Stop' }}
				</button>
			</div>
		</div>
	</div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue';
import useTask from '../assets/js/task.js';


export default defineComponent({
	name: 'Task',
	components: {},
	props: {
		doc: {
			type: Object,
			required: true,
			default: () => ({}),
		},
		activeTimer: {
			type: Object,
			required: false,
			default: null,
		},
		sideTimersElement: {
			type: Object,
			required: false,
			default: null,
		},
		isOpened: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	setup(props, { emit }) {
		const isEditing = ref(false);
		const editedText = ref('');
		const cancelTriggered = ref(false);

		const {
			emitInteraction,
			toggleComplete,
			toggleTimer,
			logOrStopTimer,
			editTask,
			unfocusInput,
			saveEdit,
			cancelEdit,
			handleBlur,
			emitSidebar
		} = useTask(props, emit, isEditing, editedText, cancelTriggered);

		watch(() => props.doc.autoFocus, (newVal) => {
			// if (newVal) {
			if (newVal && !props.isOpened.value) {
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
			cancelEdit,
			handleBlur,
			emitInteraction,
			emitSidebar
		};
	},
});
</script>

<style scoped>
@import '../assets/style/task.css';
</style>