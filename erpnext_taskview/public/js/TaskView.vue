<template>
	<div class="tree-container">
		<Draggable class="mtl-tree" v-model="treeData" treeLine>
			<template #default="{ node, stat }">
				<!-- Original Open/Close Icon -->
				<!-- <OpenIcon v-if="stat.children.length" :open="stat.open" class="mtl-mr small-icon"
					@click.native="stat.open = !stat.open" /> -->

				<!-- Modded for dark mode Open/Close Icon -->
				<a class="he-tree__open-icon mtl-mr small-icon" @click.native="stat.open = !stat.open"
					:class="{ 'open': stat.open }">
					<div class="icon-container">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<title>chevron-right</title>
							<path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"></path>
						</svg>
					</div>
				</a>
				<!-- Node Text -->
				<span class="mtl-ml">
					{{ node.text }}
				</span>
			</template>
		</Draggable>
	</div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { Draggable, OpenIcon } from '@he-tree/vue';
import '@he-tree/vue/style/default.css';
import '@he-tree/vue/style/material-design.css';

export default defineComponent({
	name: 'TaskView',
	components: {
		Draggable,
		OpenIcon
	},
	props: {
		docs: {
			type: Array,
			required: true,
			default: () => []
		}
	},
	setup(props) {
		const treeData = ref(formatTreeData(props.docs));

		// Dark Mode
		const currentTheme = ref(document.documentElement.getAttribute("data-theme-mode") || "light");
		if (currentTheme.value === "automatic") {
			currentTheme.value = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
		}
		onMounted(() => {
			document.documentElement.style.setProperty(
				'--task-hover-bg-color',
				currentTheme.value === 'dark' ? '#686868' : '#ededed'
			);
			document.documentElement.style.setProperty(
				'--icon-color',
				currentTheme.value === 'dark' ? '#d3d3d3' : '#000000'
			);
		});

		function formatTreeData(docs) {
			const taskMap = {};

			// Step 1: Build a map of all tasks by their name
			docs.forEach(doc => {
				taskMap[doc.name] = {
					text: doc.subject,
					children: []
				};
			});

			// Step 2: Populate the children arrays
			docs.forEach(doc => {
				const task = taskMap[doc.name];
				const childNames = doc.depends_on_tasks ? doc.depends_on_tasks.split(',').map(depName => depName.trim()) : [];

				childNames.forEach(childName => {
					const childTask = taskMap[childName];
					if (childTask) {
						task.children.push(childTask);
					}
				});
			});

			// Step 3: Build the treeData array with top-level tasks (those without parents)
			const treeData = [];
			docs.forEach(doc => {
				const isChild = docs.some(parentDoc => {
					const childNames = parentDoc.depends_on_tasks ? parentDoc.depends_on_tasks.split(',').map(depName => depName.trim()) : [];
					return childNames.includes(doc.name);
				});

				if (!isChild) {
					treeData.push(taskMap[doc.name]);
				}
			});

			return treeData;
		}

		return { treeData };
	}
});
</script>

<style>
	.tree-container {
		/* Adjusts overall tree font size */
		font-size: 14px;
	}

	.small-icon {
		/* Scales down the icon size */
		font-size: 1.5em;
	}

	.mtl-tree .tree-node:hover {
		background-color: var(--task-hover-bg-color);
	}

	.he-tree__open-icon svg path {
		fill: var(--icon-color);
	}
</style>
