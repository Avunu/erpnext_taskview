<template>
	<div class="tree-container">
		<Draggable class="mtl-tree" v-model="treeData" treeLine @after-drop="handleDragEnd">
			<template #default="{ node, stat }">
				<!-- modify node and stat to perpetuate collapse node states -->
				<div v-if="modifyNodeAndStat(node, stat)" class="outer-task"
					:class="{ 'highlighted-project': isHighlightedProject(node) }">
					<!-- expand/collapse button -->
					<a class="he-tree__open-icon mtl-mr small-icon" @click="toggleNode(node, stat)"
						:class="{ 'open': stat.open }">
						<div class="icon-container">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<title>chevron-right</title>
								<path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"></path>
							</svg>
						</div>
					</a>
					<!-- task or project -->
					<Task :doc="node" :activeTimer="activeTimer" :sideTimersElement="sideTimersElement" class="mtl-ml" 
						@task-interaction="handleTaskInteraction(node)"
						@add-sibling-task="addSiblingTask(node)" 
						@catch-error="catchError"
						@catch-success="premount"
						@open-sidebar="openSidebar"
					/>
				</div>
			</template>
		</Draggable>
	</div>
	<div>
		<VueSidePanel v-model="isOpened" width="80%" panel-color="var(--sidebar-bg-color)">
			<div class="sidebar">
					<!-- Form will be inserted here -->
					<div ref="formWrapper"></div>
			</div>
		</VueSidePanel>
	</div>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { Draggable, dragContext, OpenIcon } from '@he-tree/vue';
import Task from './components/Task.vue';
import useTaskview from './assets/js/taskview.js';
import { VueSidePanel } from "vue3-side-panel";
import "vue3-side-panel/dist/vue3-side-panel.css";
import '@he-tree/vue/style/default.css';
import '@he-tree/vue/style/material-design.css';

export default defineComponent({
	name: 'TaskView',
	components: {
		Draggable,
		OpenIcon,
		Task,
		VueSidePanel
	},
	props: {
		docs: {
			type: Array,
			required: true,
			default: () => []
		},
	},
	setup(props) {

		// establish the highlighted project
		let highlightedProject = ref(null);

		// TODO: SETUP CODE FOR HIGHLIGHTING TASKS
		let highlightedTask = ref(null);

		// instanitate the reactive tree data
		let treeData = ref([]);

		let activeTimer = ref({});

		let isOpened = ref(false);

		const formWrapper = ref(null); // Reference for the form wrapper



		// Dark Mode compatibility
		const currentTheme = ref(document.documentElement.getAttribute("data-theme-mode") || "light");
		if (currentTheme.value === "automatic") {
			currentTheme.value = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
		}

		// make an element to hold the sidetimers (future development)
		let sideTimersParentElement = document.querySelector('.layout-side-section');
        let sideTimersElement = document.createElement('div');
        sideTimersElement.id = 'sidetimers';
        sideTimersParentElement.appendChild(sideTimersElement);

		// get the functions from the useTaskview composition
		const {
			catchError,
			premount,
			useOnMounted,
			useOnUnmounted,
			handleDragEnd,
			modifyNodeAndStat,
			isHighlightedProject,
			toggleNode,
			addSiblingTask,
			handleTaskInteraction,
			handleKeydown,
			openSidebar
		} = useTaskview(props, treeData, highlightedProject, dragContext, currentTheme, isOpened, formWrapper);

		// setup the tree data before mounting
		premount();

		// setup the event listener, finalize theme, initialize the highlighted project, and set the tree data
		onMounted(() => {
			useOnMounted()
		});

		// cleanup the event listener
		// DO WE NEED THIS?
		onUnmounted(() => {
			useOnUnmounted();
        });

		return {
			treeData,
			activeTimer,
			sideTimersElement,
			isOpened,
			formWrapper,
			catchError,
			premount,
			isHighlightedProject,
			modifyNodeAndStat,
			toggleNode,
			handleTaskInteraction,
			handleKeydown,
			handleDragEnd,
			addSiblingTask,
			openSidebar,
		};
	},
});
</script>

<style>
	@import './assets/style/taskview.css';
</style>
