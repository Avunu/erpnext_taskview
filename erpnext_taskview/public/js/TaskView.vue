<template>
	<div class="tree-container">
		<Draggable class="mtl-tree" v-model="treeData" treeLine>
			<template #default="{ node, stat }">
				<div class="outer-task" :class="{ 'highlighted-project': isHighlightedProject(node) }">
					<a class="he-tree__open-icon mtl-mr small-icon" @click="toggleNode(node, stat)"
						:class="{ 'open': evaluateNodeInLocals(node) }">
						<!-- :class="{ 'open': stat.open && node.expanded && evaluateNodeInLocals(node) }"> -->
						<!-- :class="{ 'open': stat.open }"> -->
						<div class="icon-container">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<title>chevron-right</title>
								<path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"></path>
							</svg>
						</div>
					</a>
					<!-- <Task :doc="node" class="mtl-ml" @task-interaction="handleTaskInteraction(node)" /> -->
					<Task :doc="node" class="mtl-ml" @task-interaction="handleTaskInteraction(node)"
						@add-sibling-task="addSiblingTask(node)" />
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
			// set the theme to match frappe
			document.documentElement.style.setProperty(
				'--task-hover-bg-color',
				currentTheme.value === 'dark' ? '#686868' : '#ededed'
			);
			document.documentElement.style.setProperty(
				'--icon-color',
				currentTheme.value === 'dark' ? '#d3d3d3' : '#000000'
			);
			// initialize the highlighted project
			updateHighlightedProject();
			// Listen for keypress events to start editing the blank task
			document.addEventListener('keydown', handleKeydown);
		});

		// Helper function to create a new node with the same fields
		function createNode({ text, children = [], isBlank = false, isProject = false, project = null, docName = '', autoFocus = false, expanded = true }) {
			return {
				text,
				children,
				isBlank,
				isProject,
				project,
				docName,
				autoFocus,
				expanded
			};
		}

		// explicit nesting
		function formatTreeData(docs, projects) {

			// Helper function to add a blank task
			function addBlankTask(tasks, text = 'Add task...', project = null, isProject = false) {
				tasks.push(createNode({ text: text, isBlank: true, project: project, isProject: isProject }));
			}

			// Step 1: Build a map of all tasks by their name
			const taskMap = {};
			docs.forEach(doc => {
				taskMap[doc.name] = createNode({
					text: doc.subject,
					project: doc.project,
					docName: doc.name,
				});
			});

			// Step 2: Build the treeData array with projects as the root level
			const treeData = projects.map(project =>
				createNode({
					text: `${project.name}: ${project.project_name}`,
					isProject: true,
					docName: project.name,
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
					addBlankTask(task.children, 'Add task...', task.project);
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
				addBlankTask(projectTask.children, 'Add task...', projectTask.docName);
			});
			addBlankTask(treeData, 'Add project...', null, true);

			return treeData;
		}

		// Function to determine if a node is the highlighted project
		const isHighlightedProject = (node) => {
			return node.isProject && node === highlightedProject.value;
		};

		const evaluateNodeInLocals = (node) => {
			if (locals.nodes?.[node.docName] === false) {
				console.log(false)
			}
			return locals.nodes?.[node.docName] === true;
		};

		// Function to toggle project expansion and update highlighted project
		// const toggleNode = (node, stat) => {
		// 	// console.log(node);
		// 	// console.log(stat);
		// 	stat.open = !stat.open;
		// 	if (stat.open) {
		// 		// if node is not a project, highlight the parent project
		// 		if (!node.isProject) {
		// 			const parentProject = treeData.value.find(project =>
		// 				project.children.some(child => child === node)
		// 			);
		// 			console.log(parentProject);
		// 			highlightedProject.value = parentProject;
		// 		} else {
		// 			highlightedProject.value = node;
		// 		}
		// 		// highlightedProject.value = node;
		// 	} else {
		// 		updateHighlightedProject();
		// 	}
		// };
		const toggleNode = (node, stat) => {
			stat.open = !stat.open;
			locals.nodes[node.docName] = stat.open;

			if (!node.isProject) {
				console.log('node is not a project. this should find the parent project and highlight it every time.');
				const parentProject = findParentProject(treeData.value, node);
				console.log(parentProject);
				if (parentProject) {
					highlightedProject.value = parentProject;
				}
			} else if (node.isProject && stat.open) {
				console.log('node is a project and is open. this should highlight this project.');
				highlightedProject.value = node;
			} else {
				console.log('node is a project and is closed. this should update the highlighted project to the next expanded project. if there are no expanded projects, this project should remain highlighted.');
				console.log(treeData.value);
				// When a project is collapsed, shift the focus to the next expanded project
				const expandedProjects = treeData.value.filter(project => project.isProject && project.children.some(child => child.open));
				if (expandedProjects.length > 0) {
					highlightedProject.value = expandedProjects[0];
				} else {
					updateHighlightedProject(); // Fallback to update the highlighted project
				}
			}
		};

		// Recursive function to find the parent project of any node
		const findParentProject = (nodes, targetNode) => {
			for (let node of nodes) {
				if (node.children && node.children.includes(targetNode)) {
					return node.isProject ? node : findParentProject(nodes, node);
				} else if (node.children && node.children.length > 0) {
					const parent = findParentProject(node.children, targetNode);
					if (parent) {
						return parent;
					}
				}
			}
			return null;
		};

		// THIS NEEDS WORK SO THAT TASKS GO TO THE IMMEDIATE PARENT, NOT ALL THE WAY TO THE ROOT
		const addSiblingTask = (node) => {
			// Create a new task object
			const newNode = createNode({ text: node.isProject ? 'Add project...' : 'Add task...', isBlank: true, project: node.isProject ? null : node.project, isProject: node.isProject });

			// Find the parent project
			const parentProject = treeData.value.find(project =>
				project.children.some(child => child === node)
			);

			if (parentProject) {
				// Create a new array to trigger reactivity
				const updatedChildren = [...parentProject.children, newNode];
				parentProject.children = updatedChildren;

				// Create a new reference for treeData to trigger reactivity
				treeData.value = [...treeData.value];
			} else {
				// Add the new node to the root level
				treeData.value = [...treeData.value, newNode];

			}
			console.log(treeData);
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

		// Watch for changes in treeData
		// watch(treeData, () => {
		// 	updateHighlightedProject();
		// });

		// Function to find and edit the root-level blank task under the highlighted project
		const editRootBlankTask = () => {
			const project = highlightedProject.value;
			if (project) {
				const blankTask = project.children.find(task => task.isBlank);
				if (blankTask) {
					blankTask.autoFocus = true; // Set a flag to trigger auto-focus
				}
			}
		};

		const handleKeydown = (event) => {
			// check if the key pressed is a character key (a-z, A-Z, 0-9, special characters)
			// and no input is focused
			const allowedKeys = /^[a-zA-Z0-9!@#$%^&*()_+={}\[\]|\\:;'",.<>?/`~\- ]$/;
			if (document.activeElement.tagName !== 'INPUT' && allowedKeys.test(event.key)) {
				// If no input is focused, start editing the root blank task
				editRootBlankTask();
			}
		};

		return {
			treeData,
			isHighlightedProject,
			evaluateNodeInLocals,
			toggleNode,
			handleTaskInteraction,
			handleKeydown, // Add this to return so it can be used
			addSiblingTask
		};
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
