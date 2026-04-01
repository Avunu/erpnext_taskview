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
					<Task :node="node" :sideTimersElement="sideTimersElement" :isOpened="isOpened" class="mtl-ml"
						@task-interaction="handleTaskInteraction(node)" @add-sibling-task="addSiblingTask(node)"
						@catch-error="catchError" @catch-success="premount" @open-sidebar="openSidebar"
						@request-expand="expandAncestors(stat)" />
				</div>
			</template>
		</Draggable>
	</div>
	<div>
		<VueSidePanel v-model="isOpened" width="80%" panel-color="var(--sidebar-bg-color)">
			<div class="sidebar">
				<!-- Form will be inserted here -->
				<div v-if="showForm" ref="formWrapper"></div>

				<!-- TimeLogger component, only shown when `showForm` is false -->
				<TimeLogger v-if="!showForm" :doc="timeLoggerDoc" :currentTheme="currentTheme" :isOpened="isOpened"
					:descriptionOnly="descriptionOnly" @close-time-logger="closeTimeLogger"></TimeLogger>
			</div>
		</VueSidePanel>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, provide, onMounted, onUnmounted, PropType } from 'vue';
import { Draggable, dragContext, OpenIcon } from '@he-tree/vue';
import Task from './components/Task.vue';
import useTaskView, { TreeData, TaskViewProps } from './assets/js/taskview.ts';
import { VueSidePanel } from "vue3-side-panel";
import TimeLogger from './components/TimeLogger.vue';
import "vue3-side-panel/dist/vue3-side-panel.css";
import '@he-tree/vue/style/default.css';
import '@he-tree/vue/style/material-design.css';
import { GetResponse, TimesheetDetailDoc } from './assets/js/script.ts';

/**
 * Root component for the ERPNext Task View.
 *
 * Mounts inside the Frappe list-view result area via `TasksView.render_list()`.
 * Receives flat {@link GetResponse} data as a prop and orchestrates:
 *
 * - **Tree rendering** via `@he-tree/vue`'s `<Draggable>` component.
 * - **State management** via the {@link useTaskView} composable.
 * - **Dependency injection**: provides a reactive `timesheetDetails` map
 *   to all descendant `Task.vue` instances so they can derive timer state.
 * - **Sidebar**: hosts a `<VueSidePanel>` that alternates between a
 *   Frappe form (for project/task editing) and the `<TimeLogger>`
 *   component (for manual time entry and timer stop).
 *
 * ### Event flow
 *
 * ```
 * Task.vue  —— catch-success → premount(data) —— rebuilds tree
 * Task.vue  —— catch-error   → catchError()   —— re-fetches data
 * Task.vue  —— request-expand → expandAncestors(stat)
 * Task.vue  —— open-sidebar  → openSidebar(payload)
 * ```
 */
export default defineComponent({
	name: 'TaskView',
	components: {
		Draggable,
		OpenIcon,
		Task,
		VueSidePanel,
		TimeLogger
	},
	props: {
		/**
		 * Initial data from the Frappe list-view's `prepare_data` hook.
		 *
		 * Contains flat lists of projects, tasks, and timesheet details.
		 * The tree is assembled client-side by {@link buildTree}.
		 */
		docs: {
			type: Object as PropType<GetResponse>,
			required: true,
			default: () => ({ projects: [], tasks: [], timesheet_details: [] })
		},
	},
	setup(props) {
		/** The project node that is visually highlighted in the tree. */
		const highlightedProject = ref<TreeData | null>(null);
		/** Reactive tree data array bound to `<Draggable v-model>`. */
		const treeData = ref<TreeData[]>([]);
		/** Whether the sidebar slide-over panel is open. */
		const isOpened = ref<boolean>(false);
		/** DOM ref for mounting Frappe forms inside the sidebar. */
		const formWrapper = ref<HTMLElement | null>(null);
		/** Toggle: `true` = show Frappe form, `false` = show TimeLogger. */
		const showForm = ref<boolean>(true);
		/** Payload object passed to the `<TimeLogger>` component. */
		const timeLoggerDoc = ref<any>({});
		/** When `true`, TimeLogger shows only the description field (stop mode). */
		const descriptionOnly = ref<boolean>(false);

		/**
		 * Shared map of open timesheet details, keyed by task name.
		 *
		 * Provided to all descendant `Task.vue` components via
		 * `provide('timesheetDetails', ...)`.  Updated by `premount()`
		 * every time fresh data arrives from the server.
		 */
		const timesheetDetails = ref(new Map<string, TimesheetDetailDoc>());
		provide('timesheetDetails', timesheetDetails);

		// Dark Mode compatibility
		const currentTheme = ref<string>(document.documentElement.getAttribute("data-theme-mode") || "light");
		if (currentTheme.value === "automatic") {
			currentTheme.value = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
		}

		// make an element to hold the sidetimers (future development)
		const sideTimersParentElement = document.querySelector('.layout-side-section');
		const sideTimersElement = document.createElement('div');
		sideTimersElement.id = 'sidetimers';
		sideTimersParentElement?.appendChild(sideTimersElement);

		const taskRunnerProps: TaskViewProps = {
			docs: props.docs
		};

		// get the functions from the useTaskView composition
		const {
			catchError,
			premount,
			expandAncestors,
			useOnMounted,
			useOnUnmounted,
			handleDragEnd,
			modifyNodeAndStat,
			isHighlightedProject,
			toggleNode,
			addSiblingTask,
			handleTaskInteraction,
			handleKeydown,
			openSidebar,
			closeTimeLogger,
		} = useTaskView(taskRunnerProps, treeData, highlightedProject, timesheetDetails, dragContext as any, currentTheme, isOpened, formWrapper, showForm, timeLoggerDoc, descriptionOnly);

		// setup the tree data before mounting
		premount();

		// setup the event listener, finalize theme, initialize the highlighted project, and set the tree data
		onMounted(() => {
			useOnMounted()
		});

		// cleanup the event listener
		onUnmounted(() => {
			useOnUnmounted();
		});

		return {
			treeData,
			sideTimersElement,
			isOpened,
			formWrapper,
			showForm,
			currentTheme,
			timeLoggerDoc,
			descriptionOnly,
			catchError,
			premount,
			expandAncestors,
			isHighlightedProject,
			modifyNodeAndStat,
			toggleNode,
			handleTaskInteraction,
			handleKeydown,
			handleDragEnd,
			addSiblingTask,
			openSidebar,
			closeTimeLogger,
		};
	},
});
</script>

<style>
@import './assets/style/taskview.css';
</style>
