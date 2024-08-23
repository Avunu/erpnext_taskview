<!-- <template>
	<div class="tree-container">
		<Draggable class="mtl-tree" v-model="treeData" treeLine>
			<template #default="{ node, stat }">
				<div class="outer-task">
					<a class="he-tree__open-icon mtl-mr small-icon" @click.native="stat.open = !stat.open"
						:class="{ 'open': stat.open }">
						<div class="icon-container">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<title>chevron-right</title>
								<path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"></path>
							</svg>
						</div>
					</a>
					<Task :doc="node" class="mtl-ml" />
				</div>
			</template>
		</Draggable>
	</div>
</template> -->

<template>
	<div class="tree-container">
		<Draggable class="mtl-tree" v-model="treeData" treeLine>
			<template #default="{ node, stat }">
				<div class="outer-task" :class="{ 'highlighted-project': isHighlightedProject(node) }">
					<a class="he-tree__open-icon mtl-mr small-icon" @click="toggleProject(node, stat)"
						:class="{ 'open': stat.open }">
						<div class="icon-container">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<title>chevron-right</title>
								<path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"></path>
							</svg>
						</div>
					</a>
					<Task :doc="node" class="mtl-ml" @task-interaction="handleTaskInteraction(node)" />
				</div>
			</template>
		</Draggable>
	</div>
</template>

<script>
import { defineComponent, ref, onMounted, watch } from 'vue';
import { Draggable, OpenIcon } from '@he-tree/vue';
import Task from './components/Task.vue';
import '@he-tree/vue/style/default.css';
import '@he-tree/vue/style/material-design.css';

export default defineComponent({
	name: 'TaskView',
	components: {
		Draggable,
		OpenIcon,
		Task
	},
	props: {
		docs: {
			type: Array,
			required: true,
			default: () => []
		},
		projects: {
			type: Array,
			required: true,
			default: () => []
		}
	},
	setup(props) {
		const treeData = ref(formatTreeData(props.docs, props.projects));
		const highlightedProject = ref(null);

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

		// explicit nesting
		function formatTreeData(docs, projects) {
			// Helper function to create a new node with the same fields
			function createNode({ text, children = [], isBlank = false, isProject = false, project = null }) {
				return {
					text,
					children,
					isBlank,
					isProject,
					project,
				};
			}

			// Helper function to add a blank task
			function addBlankTask(tasks, text = 'Add task...') {
				tasks.push(createNode({ text: text, isBlank: true }));
			}

			// Step 1: Build a map of all tasks by their name
			const taskMap = {};
			docs.forEach(doc => {
				taskMap[doc.name] = createNode({
					text: doc.subject,
					project: doc.project,
				});
			});

			// Step 2: Build the treeData array with projects as the root level
			const treeData = projects.map(project =>
				createNode({
					text: `${project.name}: ${project.project_name}`,
					isProject: true,
				})
			);

			// Step 3: Populate the children arrays for tasks
			docs.forEach(doc => {
				const task = taskMap[doc.name];
				const childNames = doc.depends_on_tasks ? doc.depends_on_tasks.split(',').map(depName => depName.trim()) : [];

				childNames.forEach(childName => {
					const childTask = taskMap[childName];
					if (childTask) {
						task.children.push(childTask);
					}
				});

				if (task.children.length > 0) {
					addBlankTask(task.children);
				}
			});

			// Step 4: Assign root-level tasks to their respective projects
			docs.forEach(doc => {
				const task = taskMap[doc.name];
				const isChild = docs.some(parentDoc => {
					const childNames = parentDoc.depends_on_tasks ? parentDoc.depends_on_tasks.split(',').map(depName => depName.trim()) : [];
					return childNames.includes(doc.name);
				});

				if (!isChild) {
					const project = treeData.find(p => p.text.startsWith(doc.project));
					if (project) {
						project.children.push(task);
					}
				}
			});

			// Step 5: Add a blank task at the end of each project and root level
			treeData.forEach(projectTask => {
				addBlankTask(projectTask.children);
			});
			addBlankTask(treeData, 'Add project...');

			return treeData;
		}

		// Function to determine if a node is the highlighted project
		const isHighlightedProject = (node) => {
			return node.isProject && node === highlightedProject.value;
		};

		// Function to toggle project expansion and update highlighted project
		const toggleProject = (node, stat) => {
			stat.open = !stat.open;
			if (stat.open) {
				highlightedProject.value = node;
			} else {
				updateHighlightedProject();
			}
		};

		// Function to handle task interactions
		const handleTaskInteraction = (node) => {
			if (node.isProject) {
				highlightedProject.value = node;
			} else {
				// Find the parent project of this task
				const parentProject = treeData.value.find(project =>
					project.children.some(child => child === node)
				);
				if (parentProject) {
					highlightedProject.value = parentProject;
				}
			}
		};

		// Function to update the highlighted project
		const updateHighlightedProject = () => {
			const expandedProjects = treeData.value.filter(node => node.isProject && node.children.length > 0);
			if (expandedProjects.length > 0) {
				highlightedProject.value = expandedProjects[0];
			} else {
				highlightedProject.value = treeData.value[treeData.value.length - 1];
			}
		};

		// Initialize highlighted project
		onMounted(() => {
			updateHighlightedProject();
		});

		// Watch for changes in treeData
		watch(treeData, () => {
			updateHighlightedProject();
		});

		return {
			treeData,
			isHighlightedProject,
			toggleProject,
			handleTaskInteraction
		};
	}
});
</script>

<style>
.highlighted-project {
	font-weight: bold;
}

.tree-container {
	/* Adjusts overall tree font size */
	font-size: 14px;
}

.small-icon {
	/* Scales down the icon size */
	font-size: 1.5em;
}

.outer-task {
	/* align center */
	display: flex;
	flex-direction: row;
	align-items: center;
	width: 100%;
}

.mtl-tree .tree-node:hover {
	background-color: var(--task-hover-bg-color);
}

.he-tree__open-icon svg path {
	fill: var(--icon-color);
}
</style>
