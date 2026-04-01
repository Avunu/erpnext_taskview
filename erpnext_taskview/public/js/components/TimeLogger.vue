<template>
	<div class="sidebar-content time-logger-sidebar" :data-theme="currentTheme">
		<h3>{{ descriptionOnly ? 'Add Description' : 'Log time for ' + docText }}</h3>
		<form id="log-time-form" @submit.prevent="logTime">
			<label for="description">Description:</label>
			<textarea id="description" v-model="description" rows="4" cols="40" placeholder="Add a description..."
				ref="descriptionInput">
			</textarea>

			<!-- Conditionally show the datetime pickers -->
			<div v-if="!descriptionOnly" class="datetime-pickers">
				<label for="start-time">Start Time:</label>
				<input type="datetime-local" id="start-time" v-model="startTime" required />

				<label for="stop-time">Stop Time:</label>
				<input type="datetime-local" id="stop-time" v-model="stopTime" required />
			</div>

			<div class="button-group">
				<button type="submit" id="log-button">Log</button>
				<button v-if="!descriptionOnly" type="button" id="cancel-button" @click="closeSidebar">Cancel</button>
			</div>
		</form>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, nextTick, watch, PropType } from 'vue';
import useTimeLogger, { TimeLoggerProps } from '../assets/js/timelogger.ts';

/**
 * TimeLogger sidebar component.
 *
 * Renders in two modes based on the `descriptionOnly` prop:
 *
 * - **Stop mode** (`descriptionOnly = true`): shows only a description
 *   textarea.  On submit, the composable sends a stop signal (Timesheet
 *   Detail with `to_time`).
 * - **Manual log mode** (`descriptionOnly = false`): shows start/stop
 *   datetime pickers and a description textarea.  On submit, creates
 *   a new Timesheet Detail with the provided time range.
 *
 * @emits close-time-logger — When the sidebar should close.
 * @emits catch-error       — When a backend call fails.
 */
export default defineComponent({
	props: {
		/**
		 * Payload object containing:
		 * - `doc` — the underlying ProjectDoc or TaskDoc
		 * - `timesheetDetail` — the active Timesheet Detail, or `null`
		 */
		doc: {
			type: Object as PropType<any>,
			required: true
		},
		/** Whether the sidebar panel is currently visible. */
		isOpened: {
			type: Boolean,
			required: true
		},
		/** Current theme for CSS variable theming. */
		currentTheme: {
			type: String,
			required: false
		},
		/**
		 * When `true`, hide datetime pickers and show only the
		 * description field (stop-timer mode).
		 */
		descriptionOnly: {
			type: Boolean,
			required: false,
			default: false,
		}
	},
	setup(props, { emit }) {
		const description = ref<string>('');
		const startTime = ref<string | null>(null);
		const stopTime = ref<string | null>(null);

		const descriptionInput = ref<HTMLTextAreaElement | null>(null);

		// Compute display text from the doc
		const docText = computed<string>(() => {
			if (!props.doc?.doc) return '';
			return props.doc.doc.subject || props.doc.doc.project_name || props.doc.doc.name || '';
		});

		const timeLoggerProps: TimeLoggerProps = {
			doc: props.doc.doc,
			timesheetDetail: props.doc.timesheetDetail ?? null,
			descriptionOnly: props.descriptionOnly,
			isOpened: props.isOpened,
			currentTheme: props.currentTheme,
		};

		const {
			logTime,
			formatDateTime,
			closeSidebar,
		} = useTimeLogger(timeLoggerProps, emit, description, startTime, stopTime, docText);

		let defaultDate = formatDateTime(new Date());
		startTime.value = defaultDate;
		stopTime.value = defaultDate;

		onMounted(() => {
			nextTick(() => {
				if (props.isOpened && descriptionInput.value) {
					descriptionInput.value.focus();
				}
			});
		});

		onUnmounted(() => {
			if (descriptionInput.value) {
				description.value = '';
				descriptionInput.value.blur();
			}
		});

		watch(
			() => props.isOpened,
			(newVal: boolean) => {
				if (newVal && descriptionInput.value) {
					nextTick(() => {
						descriptionInput.value?.focus();
					});
				}
			}
		);

		return {
			description,
			startTime,
			stopTime,
			docText,
			logTime,
			closeSidebar,
			descriptionInput,
			descriptionOnly: props.descriptionOnly,
		};
	},
});
</script>

<style>
@import '../assets/style/timelogger.css';
</style>
