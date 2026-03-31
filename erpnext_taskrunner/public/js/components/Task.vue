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

<script lang="ts">
import { defineComponent, ref, inject, watch, PropType, Ref } from 'vue';
import useTask, { TaskProps } from '../assets/js/task.ts';
import { NodeData } from '../assets/js/script.ts';


export default defineComponent({
	name: 'Task',
	components: {},
	props: {
		doc: {
			type: Object as PropType<NodeData>,
			required: true,
			default: () => ({}),
		},
		sideTimersElement: {
			type: Object as PropType<HTMLElement | null>,
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
		const isEditing = ref<boolean>(false);
		const editedText = ref<string>('');
		const cancelTriggered = ref<boolean>(false);

		// Inject the shared activeTimer ref provided by TaskRunner so all Task
		// instances coordinate against the same source of truth.
		const activeTimer = inject<Ref<NodeData | null>>('activeTimer', ref(null));

		const taskProps: TaskProps = {
			doc: props.doc,
			activeTimer,
			sideTimersElement: props.sideTimersElement,
			isOpened: props.isOpened
		};

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
		} = useTask(taskProps, emit, isEditing, editedText, cancelTriggered);

		watch(() => props.doc.autoFocus, (newVal: boolean | undefined) => {
			// if (newVal) {
			if (newVal && !props.isOpened) {
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