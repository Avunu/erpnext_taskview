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
					'btn-info': timerStatus === 'stopped',
					'btn-warning': timerStatus === 'running',
					'btn-success': timerStatus === 'paused'
				}" @click="toggleTimer">
					{{
						timerStatus === 'stopped'
							? 'Start'
							: timerStatus === 'paused'
								? 'Resume'
								: 'Pause'
					}}
				</button>

				<button v-if="doc.status !== 'Completed'" class="btn task-control" :class="{
					'btn-secondary': timerStatus === 'stopped',
					'btn-danger': timerStatus !== 'stopped'
				}" @click="logOrStopTimer">
					{{ timerStatus === 'stopped' ? 'Log' : 'Stop' }}
				</button>
			</div>
		</div>
	</div>
</template>

<script>
import { defineComponent, ref, watch, computed } from 'vue';
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

		 // Simple computed property based on timesheetDetail
		const timerStatus = computed(() => {
			if (!props.doc.timesheetDetail) return 'stopped';
			return props.doc.timesheetDetail.paused ? 'paused' : 'running';
		});

		// Use original useTask functions directly since they handle state updates
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
			emitSidebar,
			timerStatus
		};
	},
});
</script>

<style scoped>
@import '../assets/style/task.css';
</style>