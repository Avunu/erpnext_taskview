<template>
	<div class="sidebar-content" :data-theme="currentTheme">
		<h3>Log time for {{ docText }}</h3>
		<form id="log-time-form" @submit.prevent="logTime">
			<label for="description">Description:</label>
			<textarea id="description" v-model="description" rows="4" cols="40" placeholder="Add a description..."
				ref="descriptionInput"></textarea>

			<label for="start-time">Start Time:</label>
			<input type="datetime-local" id="start-time" v-model="startTime" required />

			<label for="stop-time">Stop Time:</label>
			<input type="datetime-local" id="stop-time" v-model="stopTime" required />

			<div class="button-group">
				<button type="submit" id="log-button">Log</button>
				<button type="button" id="cancel-button" @click="closeSidebar">Cancel</button>
			</div>
		</form>
	</div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import useTimeLogger from '../assets/js/timelogger.js';

export default defineComponent({
	props: {
		doc: Object,
		isOpened: Boolean,
		currentTheme: String,
	},
	setup(props, { emit }) {
		let description = ref('');
		let startTime = ref(null);
		let stopTime = ref(null);

		const descriptionInput = ref(null); // Ref for the description textarea
		const docText = computed(() => props.doc.text);

		const {
			logTime,
			formatDateTime,
			closeSidebar,
		} = useTimeLogger(props, emit, description, startTime, stopTime, docText);

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
			(newVal) => {
				if (newVal && descriptionInput.value) {
					console.log('Sidebar opened, focusing input...');
					nextTick(() => {
						descriptionInput.value.focus();
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
		};
	},
});
</script>

<style scoped>
/* @import '../assets/style/timelogger.css' */
/* having trouble getting this import to work with the way we are doing the style variables */
.sidebar-content {
	text-align: center;
	background-color: var(--sidebar-background, #f9f9f9);
	padding: 20px;
	border-radius: 8px;
	box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

h3 {
	color: var(--text-color, #333);
}

form {
	display: flex;
	flex-direction: column;
	gap: 10px;
	align-items: center;
}

label {
	margin-bottom: 5px;
	color: var(--label-color, #333);
}

input,
textarea {
	padding: 5px;
	border: 1px solid var(--border-color, #ccc);
	border-radius: 4px;
	background-color: var(--input-background-color, #fff);
	color: var(--input-color, #333);
}

.button-group {
	margin-top: 15px;
}

button {
	padding: 8px 16px;
	margin-right: 5px;
	border: none;
	border-radius: 4px;
	cursor: pointer;
}

button[type='submit'] {
	background-color: var(--submit-button-bg, #007bff);
	color: white;
}

button[type='button'] {
	background-color: var(--cancel-button-bg, #dc3545);
	color: white;
}

[data-theme='dark'] {
	--sidebar-background: #252525;
	--text-color: #f1f1f1;
	--label-color: #f1f1f1;
	--border-color: #555;
	--input-background-color: #444;
	--input-color: #f1f1f1;
	--submit-button-bg: #007bff;
	--cancel-button-bg: #dc3545;
}
</style>
