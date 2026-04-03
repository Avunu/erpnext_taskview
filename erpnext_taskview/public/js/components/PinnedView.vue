<template>
	<div class="pinned-view">
		<Draggable v-model="items" :draggable="true" @after-drop="handleReorder">
			<template #default="{ node }">
				<Task :node="node" :pinned="true" @catch-success="$emit('catch-success', $event)"
					@catch-error="$emit('catch-error', $event)" @open-sidebar="$emit('open-sidebar', $event)" />
			</template>
		</Draggable>
		<div v-if="items.length === 0" class="pinned-empty">
			No pinned tasks. Click 📌 on any task to pin it.
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { Draggable } from '@he-tree/vue';
import '@he-tree/vue/style/default.css';
import { type TaskDoc, type TreeNode, reorderPinnedTasks } from '../types';
import Task from './Task.vue';

export default defineComponent({
	name: 'PinnedView',
	components: { Draggable, Task },

	props: {
		pinnedTasks: {
			type: Array as PropType<TaskDoc[]>,
			default: () => [],
		},
	},

	emits: ['catch-success', 'catch-error', 'open-sidebar'],

	data() {
		return {
			items: [] as TreeNode[],
		};
	},

	watch: {
		pinnedTasks: {
			immediate: true,
			handler(tasks: TaskDoc[]) {
				this.items = tasks.map(t => ({ doc: t, children: [] }));
			},
		},
	},

	methods: {
		async handleReorder(): Promise<void> {
			const order = this.items
				.map(item => (item.doc as TaskDoc).todo_name)
				.filter(Boolean) as string[];
			try {
				const data = await reorderPinnedTasks(order);
				this.$emit('catch-success', data);
			} catch (error) {
				this.$emit('catch-error', error);
			}
		},
	},
});
</script>

<style scoped>
.pinned-view {
	padding: 8px 0;
}

.pinned-empty {
	text-align: center;
	padding: 32px 16px;
	color: var(--gray-500, #adb5bd);
	font-size: 14px;
}
</style>
