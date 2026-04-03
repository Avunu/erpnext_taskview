<template>
	<div class="taskview-mode-buttons btn-group btn-group-sm">
		<button v-for="mode in modes" :key="mode.key" class="btn btn-default btn-sm"
			:class="{ 'btn-primary': activeMode === mode.key }" @click="select(mode.key)">
			{{ mode.label }}
		</button>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export type ViewMode = 'all' | 'my_tasks' | 'pinned';

const modes = [
	{ key: 'all' as ViewMode, label: 'All Tasks' },
	{ key: 'my_tasks' as ViewMode, label: 'My Tasks' },
	{ key: 'pinned' as ViewMode, label: 'Pinned' },
] as const;

export default defineComponent({
	name: 'ViewModeSwitcher',

	emits: ['update:mode'],

	data() {
		return {
			modes,
			activeMode: 'all' as ViewMode,
		};
	},

	methods: {
		select(mode: ViewMode): void {
			this.activeMode = mode;
			this.$emit('update:mode', mode);
		},
		/** Called externally to sync state (e.g. from the parent list view). */
		setMode(mode: ViewMode): void {
			this.activeMode = mode;
		},
	},
});
</script>
