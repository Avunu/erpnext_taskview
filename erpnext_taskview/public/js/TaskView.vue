<template>
	<div class="tree-container">
		<Draggable class="mtl-tree" v-model="treeData" treeLine @after-drop="handleDragEnd">
			<template #default="{ node, stat }">
				<!-- modify node and stat to perpetuate collapse node states -->
				<div v-if="modifyNodeAndStat(node, stat)" class="outer-task"
					:class="{ 'highlighted-project': isHighlightedProject(node) }">
					<a class="he-tree__open-icon mtl-mr small-icon" @click="toggleNode(node, stat)"
						:class="{ 'open': stat.open }">
						<div class="icon-container">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<title>chevron-right</title>
								<path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"></path>
							</svg>
						</div>
					</a>
					<Task :doc="node" class="mtl-ml" @task-interaction="handleTaskInteraction(node)"
						@add-sibling-task="addSiblingTask(node)" />
				</div>
			</template>
		</Draggable>
	</div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { Draggable, dragContext, OpenIcon } from '@he-tree/vue';
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

		// Function to handle the end of a drag-and-drop operation
		const handleDragEnd = () => {
			// this gets the dragged node in its new position.
			const draggedNode = dragContext.dragNode

			// FIGURE OUT WHY, WHEN DRAGGING A TASK TO A NEW PROJECT, THE OLD PARENT PROJECT STAYS HIGHLIGHTED

			// console.log('Drag end event:', draggedNode);
			// console.log('doc:', draggedNode.data.docName);
			// console.log('new parent:', draggedNode.parent.data.docName);

			// CODE GOES HERE TO UPDATE THE DATABASE (update the task, project, etc.)

			// trigger the task interaction
			handleTaskInteraction(draggedNode.data);
		};

		function modifyNodeAndStat(node, stat) {
			if (locals.nodes?.[node.docName] === false) {
				stat.open = false;
				node.expanded = false;
				// go through all children and set them to hidden
				stat.children.forEach(child => {
					child.hidden = true;
				});

			};
			return { node, stat };
		};

		// Helper function to create a new node
		function createNode({ text, children = [], isBlank = false, isProject = false, project = null, docName = '', autoFocus = false, expanded = true, parent = null }) {
			return {
				text,
				children,
				isBlank,
				isProject,
				project,
				docName,
				autoFocus,
				expanded,
				parent
			};
		}

		// explicit nesting
		function formatTreeData(docs, projects) {

			// Helper function to add a blank task
			function addBlankTask(tasks, text = 'Add task...', project = null, isProject = false, parent = null) {
				tasks.push(createNode({ text: text, isBlank: true, project: project, isProject: isProject, parent: parent }));
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
						childTask.parent = task.docName;
						task.children.push(childTask);
					}
				});

				if (task.children.length > 0) {
					addBlankTask(task.children, 'Add task...', task.project, false, task.docName);
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
						task.parent = project.docName;
						project.children.push(task);
					}
				}
			});

			// Step 5: Add a blank task at the end of each project and root level
			treeData.forEach(project => {
				addBlankTask(project.children, 'Add task...', project.docName, false, project.docName);
			});
			addBlankTask(treeData, 'Add project...', null, true, null);

			return treeData;
		}

		// Function to determine if a node is the highlighted project
		const isHighlightedProject = (node) => {
			return node.isProject && node === highlightedProject.value;
		};

		const toggleNode = (node, stat) => {
			stat.open = !stat.open;
			locals.nodes[node.docName], node.expanded = stat.open;

			// open the children if the node is being opened
			if (stat.open) {
				// change the hidden property of all open children to false
				stat.children.forEach(child => {
					child.hidden = false;
				});
			}

			// if the node is a task, highlight the parent project
			if (!node.isProject) {
				// Find the parent project of this task
				const parentProject = findParentProject(node);
				if (parentProject) {
					highlightedProject.value = parentProject;
				}
				// if node is a project and is open, highlight this project
			} else if (node.isProject && stat.open) {
				highlightedProject.value = node;
				// if node is a project and is closed, highlight the first open project
			} else {
				// look through the root level of tree data for a project with expanded: true, get the first one, highlight it (don't get the blank project :)
				const nextExpandedProject = treeData.value.find(project => project.isProject && project.expanded && !project.isBlank);
				if (nextExpandedProject) {
					highlightedProject.value = nextExpandedProject;
				} else {
					updateHighlightedProject();
				}
			}
		};

		function findParentProject(node) {
			return treeData.value.find(project => project.docName === node.project);
		}

		// This adds a new blank task to the tree when a blank task is edited into a new task or project
		// IF THE NEW NODE IS A PROJECT, WE NEED TO ADD A BLANK TASK TO THE NEW PROJECT AS WELL
		const addSiblingTask = (node) => {
			console.log('Adding sibling task to:', node);
			// Create a new task object
			const newNode = createNode({ text: node.isProject ? 'Add project...' : 'Add task...', isBlank: true, project: node.isProject ? null : node.project, isProject: node.isProject });

			// we need to add the new node as a sibling to the node. If the node is a project, add it to the root level
			const findParentNode = (nodes, parentDocName) => {
				for (let node of nodes) {
					if (node.docName === parentDocName) {
						return node;
					} else if (node.children && node.children.length > 0) {
						const foundNode = findParentNode(node.children, parentDocName);
						if (foundNode) {
							return foundNode;
						}
					}
				}
				return null; // If the parent node is not found
			};

			const parentNode = findParentNode(treeData.value, node.parent);
			if (parentNode) {
				const updatedChildren = [...parentNode.children, newNode];
				parentNode.children = updatedChildren;
				treeData.value = [...treeData.value];
			} else {
				// Add the new node to the root level
				treeData.value = [...treeData.value, newNode];
			}
		};

		// Function to highlight projects based on task interactions
		const handleTaskInteraction = (node) => {
			if (node.isProject) {
				highlightedProject.value = node;
			} else {
				const parentProject = findParentProject(node);
				if (parentProject) {
					highlightedProject.value = parentProject;
				}
			}
		};

		// Function to update the highlighted project
		const updateHighlightedProject = () => {
			// Find the first expanded project
			const expandedProjects = treeData.value.filter(node => node.isProject && node.expanded && !node.isBlank);
			if (expandedProjects.length > 0) {
				// if there are expanded projects, highlight the first one
				highlightedProject.value = expandedProjects[0];
			} else {
				// otherwise, highlight the blank project
				const blankProject = treeData.value.find(node => node.isBlank);
				if (blankProject) {
					highlightedProject.value = blankProject;
				}
			}
		};

		// Function to find and edit the root-level blank task under the highlighted project
		// if all projects are collapsed, or if there are no open projects, edit the blank project
		const editRootBlankTask = () => {
			const project = highlightedProject.value;
			if (project) {
				if (project.isBlank) {
					project.autoFocus = true; // Set a flag to trigger auto-focus
				} else {
					const blankTask = project.children.find(task => task.isBlank);
					if (blankTask) {
						blankTask.autoFocus = true; // Set a flag to trigger auto-focus
					}
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
			modifyNodeAndStat,
			toggleNode,
			handleTaskInteraction,
			handleKeydown,
			handleDragEnd,
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
