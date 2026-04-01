<template>
	<div class="task" @click="emitInteraction">
		<div class="task">
			<!-- Spiced-up Checkbox -->
			<div v-if="!isBlank" class="custom-checkbox task-control">
				<label>
					<input type="checkbox" :checked="node.doc.status === 'Completed'" @change="toggleComplete" />
					<span class="checkmark"></span>
				</label>
			</div>

			<!-- button to expand sidebar with this node (only for non-blank projects and tasks) -->
			<div class="expand-sidebar-container">
				<button v-if="!isBlank" class="expand-sidebar" @click="emitSidebar">
					<span class="expand-icon">⤢</span>
				</button>
			</div>

			<!-- Task Subject -->
			<div class="task-subject-container">
				<p v-if="!isEditing" class="task-subject" @click="editTask">
					{{ displayText }}
				</p>
				<input v-if="isEditing" type="text" v-model="editedText" @blur="handleBlur" @keyup.enter="unfocusInput"
					@keydown.esc="cancelEdit" class="task-subject-edit" />
			</div>

			<!-- only render the controls if the doc is not a project and is not blank -->
			<div v-if="!isProject && !isBlank" class="task-controls">
				<button v-if="node.doc.status !== 'Completed'" class="btn task-control" :class="{
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

				<button v-if="node.doc.status !== 'Completed'" class="btn task-control" :class="{
					'btn-secondary': timerStatus === 'stopped',
					'btn-danger': timerStatus !== 'stopped'
				}" @click="logOrStopTimer">
					{{ timerStatus === 'stopped' ? 'Log' : 'Stop' }}
				</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, nextTick, type PropType } from 'vue';
import { saveDoc, type TreeNode, type ProjectDoc, type TaskDoc, type TimesheetDetailDoc, getDisplayText, getProjectName } from '../types';
import { timersByTask, getRunningTimer, type ActiveTimer } from '../timerStore';

/**
 * Task / Project tree row component.
 *
 * Renders a single row in the `@he-tree/vue` `<Draggable>` tree.  Each
 * instance receives a {@link TreeNode} prop and **derives all UI state**
 * through `computed` properties — no pre-computed UI objects are passed in.
 *
 * ## Derived state (computed)
 *
 * | Property            | Source                                              |
 * |---------------------|-----------------------------------------------------|
 * | `isProject`         | `doc.doctype === 'Project'`                         |
 * | `isBlank`           | `!doc.name` (placeholder for inline creation)       |
 * | `timesheetDetail`   | Looked up from the global `timersByTask` store    |
 * | `timerStatus`       | Derived from `timesheetDetail.paused`               |
 * | `displayText`       | `getDisplayText(node)` helper                       |
 * | `activeTimerDetail` | `getRunningTimer()` from the global timer store     |
 *
 * ## Events emitted
 *
 * | Event              | Payload              | When                                   |
 * |--------------------|----------------------|----------------------------------------|
 * | `task-interaction`  | —                    | Any click on the row                   |
 * | `add-sibling-task`  | —                    | (Reserved) sibling creation request    |
 * | `catch-error`       | `unknown`            | Backend call failed                    |
 * | `catch-success`     | `GetResponse`        | Backend call succeeded                 |
 * | `open-sidebar`      | `{doc, ...}`         | Open form or time-logger in sidebar    |
 * | `request-expand`    | —                    | Timer is active; parent should expand  |
 *
 * ## Global state
 *
 * - `timersByTask` — `ComputedRef<Map<string, ActiveTimer>>` from the
 *   global `timerStore` singleton.  Keyed by task name.
 * - `getRunningTimer()` — returns the currently running timer, if any.
 */
export default defineComponent({
	name: 'Task',
	props: {
		/** The tree node containing the doc (ProjectDoc or TaskDoc). */
		node: {
			type: Object as PropType<TreeNode>,
			required: true,
			default: () => ({}),
		},
		/** DOM element for mounting side timers (reserved for future use). */
		sideTimersElement: {
			type: Object as PropType<HTMLElement | null>,
			required: false,
			default: null,
		},
		/** Whether the sidebar panel is currently open. */
		isOpened: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	emits: [
		'task-interaction',
		'add-sibling-task',
		'catch-error',
		'catch-success',
		'open-sidebar',
		'request-expand',
	],

	setup() {
		return {};
	},

	data(): {
		/** Whether the inline subject/title editor is active. */
		isEditing: boolean;
		/** Current text in the inline editor. */
		editedText: string;
		/** Flag to distinguish blur-from-Escape vs blur-from-click-away. */
		cancelTriggered: boolean;
	} {
		return {
			isEditing: false,
			editedText: '',
			cancelTriggered: false,
		};
	},

	computed: {
		/** True if this node represents a Project (vs a Task). */
		isProject(): boolean {
			return this.node.doc.doctype === 'Project';
		},
		/** True if this is a blank placeholder node for inline creation. */
		isBlank(): boolean {
			return !this.node.doc.name;
		},
		/**
		 * The open timer for this task, or `null`.
		 *
		 * Looked up from the global `timersByTask` store by task name.
		 * Projects and blanks always return `null`.
		 */
		timesheetDetail(): ActiveTimer | null {
			if (this.isProject || this.isBlank) return null;
			return timersByTask.value.get(this.node.doc.name) ?? null;
		},
		/**
		 * Derived timer status based on the presence and state of the
		 * timesheet detail.
		 *
		 * - `'stopped'` — no open detail exists.
		 * - `'paused'`  — detail exists with `paused === 1`.
		 * - `'running'` — detail exists with `paused === 0`.
		 */
		timerStatus(): 'stopped' | 'running' | 'paused' {
			if (!this.timesheetDetail) return 'stopped';
			return this.timesheetDetail.paused ? 'paused' : 'running';
		},
		/** Human-readable display text for the tree row label. */
		displayText(): string {
			return getDisplayText(this.node);
		},
		/**
		 * The currently-running (non-paused) timer detail across all tasks.
		 *
		 * Used when starting a new timer to auto-pause the previously
		 * active one.  Returns `null` if no timer is running.
		 */
		activeTimerDetail(): ActiveTimer | null {
			return getRunningTimer();
		},
	},

	methods: {
		/** Emit `task-interaction` to notify the tree of a user click. */
		emitInteraction(): void {
			this.$emit('task-interaction');
		},

		/**
		 * Toggle the task's status between Open and Completed.
		 *
		 * Persists the change via {@link saveDoc} and emits `catch-success`
		 * so the tree rebuilds with updated data.
		 */
		async toggleComplete(): Promise<void> {
			const newStatus = this.node.doc.status === 'Open' ? 'Completed' : 'Open';
			this.node.doc.status = newStatus;
			if (this.node.doc.name) {
				locals.nodes[this.node.doc.name] = true;
			}
			try {
				const data = await saveDoc({ ...this.node.doc, status: newStatus });
				this.$emit('catch-success', data);
			} catch (error) {
				this.$emit('catch-error', error);
			}
			this.emitInteraction();
		},

		/**
		 * Send a partial Timesheet Detail to the backend for timer operations.
		 *
		 * Emits `catch-success` with the fresh {@link GetResponse} on success,
		 * or `catch-error` on failure.
		 *
		 * @param detail - Partial fields; must include either `name` (for
		 *                 existing entries) or `project`+`task` (for new ones).
		 */
		async sendTimerDoc(detail: Partial<TimesheetDetailDoc>): Promise<void> {
			try {
				const data = await saveDoc({ doctype: 'Timesheet Detail', ...detail } as TimesheetDetailDoc);
				this.$emit('catch-success', data);
			} catch (error) {
				this.$emit('catch-error', error);
			}
		},

		/**
		 * Start or resume a timer for this task.
		 *
		 * If another timer is currently running (non-paused), pauses it
		 * first.  Then either resumes this task's existing paused timer
		 * or starts a brand-new one.
		 */
		async startTimer(): Promise<void> {
			// Pause any other running (non-paused) timer first
			const active = this.activeTimerDetail;
			if (active && active.task !== this.node.doc.name && active.name) {
				await this.sendTimerDoc({ name: active.name, paused: 1 });
			}

			if (this.timesheetDetail?.name) {
				// Resume existing paused timer
				await this.sendTimerDoc({ name: this.timesheetDetail.name, paused: 0 });
			} else {
				// Start a brand new timer
				await this.sendTimerDoc({
					project: getProjectName(this.node),
					task: this.node.doc.name,
				});
			}
		},

		/** Pause the running timer for this task. */
		async pauseTimer(): Promise<void> {
			if (this.timesheetDetail?.name) {
				await this.sendTimerDoc({ name: this.timesheetDetail.name, paused: 1 });
			}
		},

		/**
		 * Open the sidebar in stop-timer mode (description only).
		 *
		 * The actual stop signal is sent by the TimeLogger component
		 * when the user submits the form.
		 */
		stopTimer(): void {
			this.$emit('open-sidebar', {
				doc: this.node.doc,
				timesheetDetail: this.timesheetDetail,
				descriptionOnly: true,
			});
		},

		/**
		 * Toggle between start/resume and pause.
		 *
		 * Bound to the primary timer button in the template.
		 */
		async toggleTimer(): Promise<void> {
			if (this.timerStatus === 'stopped' || this.timerStatus === 'paused') {
				await this.startTimer();
			} else {
				await this.pauseTimer();
			}
		},

		/**
		 * Either open the manual-log sidebar (stopped) or stop the timer.
		 *
		 * Bound to the secondary Log/Stop button in the template.
		 */
		logOrStopTimer(): void {
			if (this.timerStatus === 'stopped') {
				this.$emit('open-sidebar', {
					doc: this.node.doc,
					timesheetDetail: this.timesheetDetail,
					descriptionOnly: false,
				});
			} else {
				this.stopTimer();
			}
		},

		/** Enter inline edit mode for the subject/title. */
		editTask(): void {
			this.isEditing = true;
			this.editedText = this.isBlank ? '' : this.displayText;
			nextTick(() => {
				const inputElement = document.querySelector('.task-subject-edit') as HTMLInputElement;
				if (inputElement) inputElement.focus();
			});
		},

		/** Blur the input on Enter to trigger save via `handleBlur`. */
		unfocusInput(event: Event): void {
			(event.target as HTMLInputElement).blur();
		},

		/** Cancel editing on Escape — sets a flag so `handleBlur` skips save. */
		cancelEdit(): void {
			this.cancelTriggered = true;
			this.isEditing = false;
			this.editedText = this.displayText;
		},

		/**
		 * Blur handler for the inline editor.
		 *
		 * If cancel was triggered (Escape), resets the flag and returns.
		 * Otherwise delegates to {@link saveEdit}.
		 */
		async handleBlur(): Promise<void> {
			if (this.cancelTriggered) {
				this.cancelTriggered = false;
				return;
			}
			await this.saveEdit();
		},

		/**
		 * Persist the inline edit.
		 *
		 * For **blank nodes**, sends an insert (new Project or Task).
		 * For **existing nodes**, sends an update with the changed field
		 * (`project_name` for projects, `subject` for tasks).  Projects
		 * display as `"NAME: Title"` so the user-edited text is split on
		 * the first colon to extract the title portion.
		 *
		 * Emits `catch-success` or `catch-error` and updates `locals.nodes`
		 * expand state.
		 */
		async saveEdit(): Promise<void> {
			if (this.editedText.trim() !== '') {
				const currentText = this.displayText;
				if (this.editedText !== currentText) {
					if (this.isBlank) {
						// INSERT a new Task or Project
						let newDoc: Partial<ProjectDoc> | Partial<TaskDoc>;
						if (this.isProject) {
							newDoc = { doctype: 'Project', project_name: this.editedText, status: 'Open' };
						} else {
							const taskDoc = this.node.doc as TaskDoc;
							newDoc = {
								doctype: 'Task', subject: this.editedText,
								project: taskDoc.project, parent_task: taskDoc.parent_task || null,
								status: 'Open', priority: 'Medium',
							};
						}
						try {
							const data = await saveDoc(newDoc);
							this.$emit('catch-success', data);
						} catch (error) {
							this.$emit('catch-error', error);
						}
					} else {
						// UPDATE existing Task or Project
						let text = this.editedText;
						if (this.isProject) {
							const parts = text.split(':', 2);
							if (parts.length === 2) text = parts[1].trim();
							try {
								const data = await saveDoc({ ...this.node.doc, project_name: text } as ProjectDoc);
								this.$emit('catch-success', data);
							} catch (error) {
								this.$emit('catch-error', error);
							}
						} else {
							try {
								const data = await saveDoc({ ...this.node.doc, subject: text } as TaskDoc);
								this.$emit('catch-success', data);
							} catch (error) {
								this.$emit('catch-error', error);
							}
						}
					}
				}
			}

			const projectName = getProjectName(this.node);
			if (this.node.doc.name === '' && this.isProject) {
				locals.nodes[this.editedText] = true;
			} else {
				locals.nodes[projectName] = true;
			}
			this.emitInteraction();
			this.isEditing = false;
		},

		/** Open the full Frappe form for this doc in the sidebar. */
		emitSidebar(): void {
			this.$emit('open-sidebar', { doc: this.node.doc, isProject: this.isProject });
		},
	},

	/**
	 * Lifecycle: set up reactive watchers after the component mounts.
	 *
	 * 1. **Timer expansion**: watches `timerStatus` and emits
	 *    `request-expand` when a timer is running or paused, so the
	 *    tree auto-opens ancestor nodes to make the active task visible.
	 * 2. **Auto-focus**: watches `_autoFocus` on the node and enters
	 *    edit mode when triggered by a keyboard shortcut (see
	 *    `editRootBlankTask` in `taskview.ts`).
	 */
	mounted() {
		// When this task has an active timer, emit request-expand so the tree opens ancestors
		this.$watch('timerStatus', (status: string) => {
			if (status === 'running' || status === 'paused') {
				this.$emit('request-expand');
			}
		}, { immediate: true });

		// Auto-focus support for blank nodes (triggered by keyboard shortcut)
		this.$watch(() => this.node._autoFocus, (val: boolean | undefined) => {
			if (val && !this.isOpened) {
				this.editTask();
				this.node._autoFocus = false;
			}
		});
	},
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
	margin-left: 10px;
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
	/* margin-right: 10px; */
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

/* expand button style */

.expand-sidebar {
	height: 20px;
	width: 20px;
	background-color: #d8dfed;
	/* Same as complete button background */
	border-radius: 4px;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: color 0.3s ease;
	/* Smooth color transition for text */
	outline: none;
	position: relative;
}

.expand-sidebar .expand-icon {
	font-size: 16px;
	/* Slightly larger for emphasis */
	color: #1976D2;
	/* Dark blue text for contrast */
	font-weight: bold;
	pointer-events: none;
	/* Prevent pointer events on the icon */
}

.expand-sidebar:hover .expand-icon {
	color: #0D47A1;
	/* Even darker blue on hover for better feedback */
}

.expand-sidebar:active .expand-icon {
	color: #0A3C8A;
	/* Darker shade when active */
}
</style>