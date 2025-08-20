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
import { defineComponent, ref, computed, onMounted, onUnmounted, nextTick, watch, PropType, Ref, ComputedRef } from 'vue';
import useTimeLogger, { TimeLoggerProps } from '../assets/js/timelogger.ts';

export default defineComponent({
	props: {
		doc: {
			type: Object as PropType<{
				project?: string;
				docName?: string;
				text?: string;
				timesheetDetail?: any;
			}>,
			required: true
		},
		isOpened: {
			type: Boolean,
			required: true
		},
		currentTheme: {
			type: String,
			required: false
		},
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

		const descriptionInput = ref<HTMLTextAreaElement | null>(null); // Ref for the description textarea
		const docText = computed<string>(() => props.doc.text || '');

		const timeLoggerProps: TimeLoggerProps = {
			doc: props.doc,
			isOpened: props.isOpened,
			currentTheme: props.currentTheme,
			descriptionOnly: props.descriptionOnly
		};

		const {
			logTime,
			formatDateTime,
			closeSidebar,
		} = useTimeLogger(timeLoggerProps, emit, description, startTime, stopTime, docText);

		let defaultDate = formatDateTime(new Date());
		startTime.value = defaultDate;
		stopTime.value = defaultDate;

		// Focus the description input when the sidebar is opened
		onMounted(() => {
			nextTick(() => {
				if (props.isOpened && descriptionInput.value) {
					descriptionInput.value.focus();
				}
			});
		});

		// Clear the description when the sidebar is closed
		onUnmounted(() => {
			if (descriptionInput.value) {
				description.value = '';
				// unfocus the description input
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
