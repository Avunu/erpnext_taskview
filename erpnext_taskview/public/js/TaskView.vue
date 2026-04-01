<template>
	<div class="tree-container">
		<Draggable class="mtl-tree" v-model="treeData" treeLine :rootDroppable="false" @after-drop="handleDragEnd">
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
import { defineComponent, type PropType } from 'vue';
import { Draggable, dragContext } from '@he-tree/vue';
import Task from './components/Task.vue';
import TimeLogger from './components/TimeLogger.vue';
import { VueSidePanel } from 'vue3-side-panel';
import 'vue3-side-panel/dist/vue3-side-panel.css';
import '@he-tree/vue/style/default.css';
import '@he-tree/vue/style/material-design.css';
import {
	type GetResponse, type ProjectDoc, type TaskDoc, type TimesheetDetailDoc,
	type TreeNode, saveDoc, fetchData, getProjectName,
} from './types';
import { refreshTimers, timersByTask } from './timerStore';

// ── Types used only by this component ────────────────────────

export interface TreeData extends TreeNode {
	children: TreeData[];
}

interface StatObject {
	open: boolean;
	parent?: StatObject | null;
	data?: TreeData;
	hidden?: boolean;
	disableDrag?: boolean;
	disableDrop?: boolean;
	draggable?: boolean;
	droppable?: boolean;
	dragOpen?: boolean;
	children?: StatObject[];
}

export default defineComponent({
	name: 'TaskView',
	components: { Draggable, Task, VueSidePanel, TimeLogger },

	props: {
		docs: {
			type: Object as PropType<GetResponse>,
			required: true,
			default: () => ({ projects: [], tasks: [] }),
		},
	},

	data() {
		const theme = document.documentElement.getAttribute('data-theme-mode') || 'light';
		return {
			treeData: [] as TreeData[],
			highlightedProject: null as TreeData | null,
			activeNode: null as TreeData | null,
			isOpened: false,
			showForm: true,
			timeLoggerDoc: {} as any,
			descriptionOnly: false,
			currentTheme: theme === 'automatic'
				? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
				: theme,
			sideTimersElement: null as HTMLElement | null,
		};
	},

	created() {
		const parent = document.querySelector('.layout-side-section');
		if (parent) {
			const el = document.createElement('div');
			el.id = 'sidetimers';
			parent.appendChild(el);
			this.sideTimersElement = el;
		}
		this.premount();
	},

	mounted() {
		this.setTheme();
		this.updateHighlightedProject();
		document.addEventListener('keydown', this.handleKeydown);
	},

	beforeUnmount() {
		document.removeEventListener('keydown', this.handleKeydown);
	},

	methods: {
		// ── Tree assembly ─────────────────────────────────────

		buildTree(data: GetResponse): TreeData[] {
			const nodes = new Map<string, TreeData>();
			const root: TreeData[] = [];
			for (const p of data.projects) {
				const node: TreeData = { doc: p, children: [] };
				nodes.set(p.name, node);
				root.push(node);
			}
			for (const t of data.tasks) {
				const node: TreeData = { doc: t, children: [] };
				nodes.set(t.name, node);
				const parentKey = t.parent_task || t.project;
				const parent = nodes.get(parentKey);
				if (parent) parent.children.push(node);
			}
			return root;
		},

		premount(data: GetResponse | null = null): void {
			const source = data || this.docs;
			let docs = this.buildTree(source);
			docs = this.addBlankProject(docs);
			docs = this.addBlankTasks(docs);
			this.treeData = docs;
			refreshTimers();
		},

		async catchError(error: unknown): Promise<void> {
			console.error('Error updating data:', error);
			frappe.msgprint(`Error updating data: ${error}`);
			try {
				const data = await fetchData();
				this.premount(data);
			} catch (fetchErr) {
				console.error('Error fetching fresh data:', fetchErr);
			}
		},

		async saveAndRebuild(
			doc: Partial<ProjectDoc> | Partial<TaskDoc> | Partial<TimesheetDetailDoc>,
			children?: TaskDoc[],
		): Promise<void> {
			try {
				const data = await saveDoc(doc, children);
				this.premount(data);
			} catch (error) {
				this.catchError(error);
			}
		},

		// ── Ancestor expansion ────────────────────────────────

		expandAncestors(stat: StatObject): void {
			let current: StatObject | null | undefined = stat;
			while (current) {
				current.open = true;
				if (current.data?.doc?.name) {
					locals.nodes[current.data.doc.name] = true;
				}
				current = current.parent;
			}
		},

		// ── Theme ─────────────────────────────────────────────

		setTheme(): void {
			document.documentElement.style.setProperty(
				'--task-hover-bg-color',
				this.currentTheme === 'dark' ? '#686868' : '#ededed',
			);
			document.documentElement.style.setProperty(
				'--icon-color',
				this.currentTheme === 'dark' ? '#d3d3d3' : '#000000',
			);
			document.documentElement.style.setProperty(
				'--sidebar-bg-color',
				this.currentTheme === 'dark' ? '#2f2f2f' : '#f9f9f9',
			);
		},

		// ── Drag and drop ─────────────────────────────────────

		async handleDragEnd(): Promise<void> {
			const draggedStat = (dragContext as any).dragNode;
			if (!draggedStat?.parent?.data?.doc) {
				// Dropped at root level or into an invalid target — reload and bail
				await this.catchError(new Error('Invalid drop target'));
				return;
			}

			const parentData = draggedStat.parent.data as TreeData;
			const parentDoc = parentData.doc;

			// Don't allow dropping onto blank placeholder nodes
			if (!parentDoc.name) {
				await this.catchError(new Error('Cannot drop onto a blank node'));
				return;
			}

			draggedStat.parent.open = true;

			const taskDoc = draggedStat.data.doc as TaskDoc;
			const parentIsProject = parentDoc.doctype === 'Project';

			taskDoc.parent_task = parentIsProject ? null : parentDoc.name;

			const draggedProject = getProjectName(draggedStat.data);
			const parentProject = getProjectName(parentData);
			if (draggedProject !== parentProject) {
				taskDoc.project = parentProject;
			}

			const collectChildren = (node: TreeData): TaskDoc[] => {
				const result: TaskDoc[] = [];
				for (const child of node.children) {
					if (!child.doc.name) continue;
					result.push(child.doc as TaskDoc);
					result.push(...collectChildren(child));
				}
				return result;
			};

			const children = collectChildren(draggedStat.data);
			await this.saveAndRebuild(taskDoc, children.length > 0 ? children : undefined);
			this.handleTaskInteraction(draggedStat.data);
		},

		// ── Per-node render hook ──────────────────────────────

		modifyNodeAndStat(node: TreeData, stat: StatObject): { node: TreeData; stat: StatObject } {
			const isProject = node.doc.doctype === 'Project';
			const isBlank = !node.doc.name;
			const detail = timersByTask.value.get(node.doc.name);
			const hasActiveTimer = !!detail;

			let pleaseExpandMe = false;

			if (isProject && node.doc.name) {
				const projectDoc = node.doc as ProjectDoc;
				if (projectDoc.project_name in locals.nodes) {
					const value = locals.nodes[projectDoc.project_name];
					stat.open = value;
					locals.nodes[node.doc.name] = value;
					delete locals.nodes[projectDoc.project_name];
					pleaseExpandMe = value;
				}
			}

			if (locals.nodes?.[node.doc.name || ''] === false) {
				stat.open = false;
			}

			if (locals.nodes?.[node.doc.name || ''] === true || pleaseExpandMe) {
				stat.open = true;
				this.updateHighlightedProject();
			}

			let runningChildren = false;
			if (node.children?.length > 0) {
				runningChildren = node.children.some(child =>
					timersByTask.value.has(child.doc.name),
				);
			}

			if (isBlank) {
				stat.disableDrag = true;
				stat.disableDrop = true;
				stat.draggable = false;
				stat.droppable = false;
				stat.dragOpen = false;
			} else if (isProject || hasActiveTimer || runningChildren) {
				stat.disableDrag = true;
				stat.draggable = false;
				stat.droppable = true;
				stat.dragOpen = true;
			} else {
				stat.disableDrag = false;
				stat.disableDrop = false;
				stat.draggable = true;
				stat.droppable = true;
				stat.dragOpen = true;
			}

			return { node, stat };
		},

		// ── Node factories and blank placeholders ─────────────

		createNode(doc: Partial<ProjectDoc> | Partial<TaskDoc>): TreeData {
			if (!doc.doctype) doc.doctype = 'Task';
			if (!doc.name) doc.name = '';
			if (!doc.status) doc.status = 'Open';
			return { doc: doc as ProjectDoc | TaskDoc, children: [] };
		},

		addBlankProject(docs: TreeData[]): TreeData[] {
			docs.push(this.createNode({
				doctype: 'Project', name: '', project_name: 'Add project...', status: 'Open',
			} as ProjectDoc));
			return docs;
		},

		/** Remove all blank task nodes from the tree. */
		stripBlanks(nodes: TreeData[]): void {
			for (const node of nodes) {
				if (node.children) {
					node.children = node.children.filter(c => !!c.doc.name);
					this.stripBlanks(node.children);
				}
			}
		},

		addBlankTasks(docs: TreeData[]): TreeData[] {
			this.stripBlanks(docs);

			// Determine which parent should get the blank node.
			let targetParent: TreeData | null = null;

			if (this.activeNode) {
				const isProject = this.activeNode.doc.doctype === 'Project';
				if (isProject) {
					// Active node is a project → blank as its immediate child
					targetParent = docs.find(p => p.doc.name === this.activeNode!.doc.name) || null;
				} else {
					// Active node is a task → blank as its child
					targetParent = this.findParentNode(docs, this.activeNode.doc.name);
				}
			} else if (this.highlightedProject?.doc.name) {
				targetParent = docs.find(p => p.doc.name === this.highlightedProject!.doc.name) || null;
			}

			if (targetParent) {
				this.ensureBlankChild(targetParent);
			}
			return docs;
		},

		/** Add a single blank "Add task..." child to `node` if not already present. Non-recursive. */
		ensureBlankChild(node: TreeData): void {
			if (node.doc.status === 'Completed') return;
			if (!node.children) node.children = [];
			if (node.children.some(child => !child.doc.name)) return;

			const isProject = node.doc.doctype === 'Project';
			const projectName = getProjectName(node);
			const parentTask = isProject ? null : node.doc.name;

			const blankTask = this.createNode({
				doctype: 'Task', name: '', subject: 'Add task...',
				project: projectName, parent_task: parentTask,
				status: 'Open', is_group: 0, priority: 'Medium',
			} as TaskDoc);
			node.children = [...node.children, blankTask];
			this.treeData = [...this.treeData];
		},

		// ── Highlight and navigation ──────────────────────────

		isHighlightedProject(node: TreeData): boolean {
			try {
				return !!(node.doc.doctype === 'Project' && node.doc.name === this.highlightedProject?.doc.name);
			} catch {
				return !!(node.doc.doctype === 'Project' && node === this.highlightedProject);
			}
		},

		toggleNode(node: TreeData, stat: StatObject): void {
			if (!node.doc.name) return;

			stat.open = !stat.open;
			locals.nodes[node.doc.name] = stat.open;

			if (stat.open) {
				stat.children?.forEach(child => {
					child.hidden = !stat.open;
				});
			}

			const isProject = node.doc.doctype === 'Project';
			if (!isProject) {
				const parentProject = this.findParentProject(node);
				if (parentProject) {
					this.highlightedProject = parentProject;
				}
			} else if (stat.open) {
				this.highlightedProject = node;
			} else {
				const nextExpandedProject = this.treeData.find(project =>
					project.doc.doctype === 'Project' && project.doc.name && locals.nodes?.[project.doc.name],
				);
				if (nextExpandedProject) {
					this.highlightedProject = nextExpandedProject;
				} else {
					this.updateHighlightedProject();
				}
			}
		},

		findParentProject(node: TreeData): TreeData | undefined {
			const projectName = getProjectName(node);
			return this.treeData.find(project => project.doc.name === projectName);
		},

		findParentNode(nodes: TreeData[], parentDocName: string): TreeData | null {
			for (const node of nodes) {
				if (node.doc.name === parentDocName) {
					return node;
				} else if (node.children?.length > 0) {
					const foundNode = this.findParentNode(node.children, parentDocName);
					if (foundNode) return foundNode;
				}
			}
			return null;
		},

		addSiblingTask(node: TreeData): void {

			const isProject = node.doc.doctype === 'Project';
			const parentDocName = isProject
				? ''
				: ((node.doc as TaskDoc).parent_task || (node.doc as TaskDoc).project);

			const projectName = getProjectName(node);
			const parentTask = isProject ? null : (node.doc as TaskDoc).parent_task;

			const newBlankNode = this.createNode(
				isProject
					? { doctype: 'Project', name: '', project_name: 'Add project...', status: 'Open' } as ProjectDoc
					: {
						doctype: 'Task', name: '', subject: 'Add task...',
						project: projectName, parent_task: parentTask,
						status: 'Open', is_group: 0, priority: 'Medium',
					} as TaskDoc,
			);

			const parentNode = this.findParentNode(this.treeData, parentDocName);

			if (parentNode) {
				parentNode.children = [...parentNode.children, newBlankNode];
				this.treeData = [...this.treeData];
			} else {
				this.treeData = [...this.treeData, newBlankNode];
			}
		},

		handleTaskInteraction(node: TreeData): void {
			const isProject = node.doc.doctype === 'Project';
			const isBlank = !node.doc.name;

			if (isProject) {
				if (!isBlank && node.doc.status !== 'Completed') {
					this.highlightedProject = node;
				} else {
					return;
				}
			} else {
				const parentProject = this.findParentProject(node);
				if (parentProject) {
					this.highlightedProject = parentProject;
				}
			}

			// Track the active node and re-place the blank at the right level
			this.activeNode = isBlank ? null : node;
			this.stripBlanks(this.treeData);

			let targetParent: TreeData | null = null;
			if (!isBlank && !isProject) {
				// Task selected → blank as its child
				targetParent = this.findParentNode(this.treeData, node.doc.name);
			} else if (this.highlightedProject?.doc.name) {
				targetParent = this.highlightedProject;
			}

			if (targetParent) {
				locals.nodes[targetParent.doc.name] = true;
				this.ensureBlankChild(targetParent);
			}
		},

		updateHighlightedProject(): void {
			if (!this.treeData || !Array.isArray(this.treeData)) {
				console.warn('Tree data is not initialized or not an array');
				return;
			}

			const expandedProjects = this.treeData.filter(
				(node) => node.doc.doctype === 'Project' && node.doc.name && locals.nodes?.[node.doc.name] !== false,
			);

			if (expandedProjects.length > 0) {
				this.highlightedProject = expandedProjects[0];
			} else {
				const blankProject = this.treeData.find((node) => !node.doc.name);
				if (blankProject) {
					this.highlightedProject = blankProject;
				}
			}
		},

		// ── Keyboard shortcuts ────────────────────────────────

		editRootBlankTask(): void {
			const project = this.highlightedProject;
			if (project) {
				if (!project.doc.name) {
					project._autoFocus = true;
				} else {
					// Ensure there's a blank to focus
					this.ensureBlankChild(project);
					const blankTask = project.children.find(task => !task.doc.name);
					if (blankTask) {
						blankTask._autoFocus = true;
					}
				}
			}
		},

		handleKeydown(event: KeyboardEvent): void {
			const tag = document.activeElement?.tagName;
			if (tag === 'INPUT' || tag === 'TEXTAREA') return;
			const allowedKeys = /^[a-zA-Z0-9!@#$%^&*()_+={}\[\]|\\:;'",.<>?/`~\- ]$/;
			if (allowedKeys.test(event.key) && !this.isOpened) {
				this.editRootBlankTask();
			}
		},

		// ── Sidebar ───────────────────────────────────────────

		async loadForm(payload: { doc: ProjectDoc | TaskDoc; isProject: boolean }): Promise<void> {
			const doctype = payload.isProject ? 'Project' : 'Task';
			const docName = payload.doc.name;

			try {
				const formWrapper = this.$refs.formWrapper as HTMLElement;
				if (!formWrapper || !document.body.contains(formWrapper)) {
					console.error('formWrapper is not attached to the DOM');
					return;
				}

				await (frappe as any).model.with_doctype(doctype);
				formWrapper.innerHTML = '';
				const formInstance = new (frappe as any).ui.form.Form(doctype, formWrapper, true, '');
				await (frappe as any).model.with_doc(doctype, docName);
				formInstance.refresh(docName);
			} catch (err) {
				console.error('Error loading form:', err);
			}
		},

		openSidebar(payload: any): void {
			this.isOpened = true;

			if ('isProject' in payload && !('descriptionOnly' in payload)) {
				this.showForm = true;
				this.loadForm(payload);
			} else {
				this.timeLoggerDoc = payload;
				this.showForm = false;
				this.descriptionOnly = payload.descriptionOnly ?? false;
			}
		},

		closeTimeLogger(): void {
			this.timeLoggerDoc = null;
			this.showForm = true;
			this.descriptionOnly = false;
			this.isOpened = false;
		},
	},
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

/* sidebar */

.sidebar {
	/* background-color: var(--sidebar-bg-color); */
	/* height: 100%; */
	padding-left: 10px;
	padding-right: 10px;
	padding-bottom: 20px;
	padding-top: 65px;
}
</style>
