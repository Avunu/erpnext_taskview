<template>
	<div
		class="tree-container"
		v-if="viewMode !== 'pinned'"
		@pointerdown.capture="rememberPointer"
		@keydown.capture="onTreeKeydown"
	>
		<!-- nodeKey: rows keyed by doc name, so a rebuild never hands a row's
		     panel (and its half-typed entry) to another row.  triggerClass: drags
		     start from the row only, never from inside its panel. -->
		<Draggable
			class="mtl-tree"
			v-model="treeData"
			treeLine
			:rootDroppable="true"
			:nodeKey="nodeKey"
			triggerClass="tv-row"
			:ondragstart="onTreeDragStart"
			@after-drop="handleDragEnd"
		>
			<template #default="{ node, stat }">
				<!-- modify node and stat to perpetuate collapse node states -->
				<div
					v-if="modifyNodeAndStat(node, stat)"
					class="tv-node"
					:data-name="node.doc?.name || undefined"
					:class="{
						'tv-node--expanded': isExpanded(node),
						'tv-node--parent-open': isExpanded(node) && stat.open && node.children?.length > 0,
					}"
				>
					<div
						class="outer-task tv-row"
						:class="{
							'highlighted-project': isHighlightedProject(node),
							'task-selected': isSelected(node),
						}"
					>
						<!-- expand/collapse button -->
						<a
							class="he-tree__open-icon mtl-mr small-icon"
							@click="toggleNode(node, stat)"
							:class="{ open: stat.open }"
						>
							<div class="taskview-tree-icon">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
									<title>chevron-right</title>
									<path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"></path>
								</svg>
							</div>
						</a>
						<!-- task or project -->
						<Task
							:node="node"
							:sideTimersElement="sideTimersElement"
							:isOpened="isOpened"
							:viewMode="viewMode"
							:selectionSize="isSelected(node) ? selectedTasks.size : 0"
							class="mtl-ml"
							@task-interaction="handleTaskInteraction(node, $event)"
							@task-select="selectNode(node)"
							@catch-error="catchError"
							@catch-success="premount"
							@open-sidebar="openSidebar"
							@request-expand="expandAncestors(stat)"
							@copy-markdown="copyFromRow(node)"
						/>
					</div>
					<!-- The selected row's panel.  The shell animates 0fr → 1fr; the
					     clip hides overflow only while it does, so the panel's
					     dropdowns and date pickers are never cut off once open. -->
					<Transition name="tv-panel">
						<div v-if="isExpanded(node)" class="tv-panel-shell">
							<div class="tv-panel-clip">
								<!-- applySnapshot / reportError are plain callbacks, not
								     events: Vue drops emits from an unmounted component,
								     and a save may return after its panel has closed. -->
								<RowPanel
									:key="node.doc.name"
									:node="node"
									:viewMode="viewMode"
									:minChildIdx="maxChildIdx(node)"
									:applySnapshot="premount"
									:reportError="catchError"
									@open-sidebar="openSidebar"
									@collapse="collapsePanel"
									@editing="onPanelEditing(node.doc.name, $event)"
								/>
							</div>
						</div>
					</Transition>
				</div>
			</template>
		</Draggable>
	</div>
	<div v-else class="pinned-container">
		<PinnedView
			ref="pinnedView"
			:pinnedTasks="pinnedTasks"
			@catch-success="premount"
			@catch-error="catchError"
			@open-sidebar="openSidebar"
			@copy-markdown="copyFromRow"
		/>
	</div>
</template>

<script lang="ts">
import { defineComponent, nextTick, type PropType } from "vue";
import { Draggable, dragContext } from "@he-tree/vue";
import Task from "./components/Task.vue";
import RowPanel from "./components/RowPanel.vue";
import PinnedView from "./components/PinnedView.vue";
import "@he-tree/vue/style/default.css";
import "@he-tree/vue/style/material-design.css";
import {
	type GetResponse,
	type ProjectDoc,
	type TaskDoc,
	type TimesheetDetailDoc,
	type TreeNode,
	saveDoc,
	fetchData,
	fetchBudgetSummary,
	getProjectName,
} from "./types";
import { refreshTimers, timers } from "./timerStore";
import { setBudgetTree } from "./budgetLive";
import { treeNodes } from "./treeState";
import { copyNodesAsMarkdown, selectionRoots, subtreeFromDocs } from "./taskMarkdown";

// ── Types used only by this component ────────────────────────

export interface TreeData extends TreeNode {
	children: TreeData[];
}

/** Class core's side panel keeps on <body> while it is open (frappe/ui/side_panel.js). */
const SIDE_PANEL_OPEN_CLASS = "side-panel-open";

/** Dispatched by `timerStore.ts` whenever either bundle's timer list changes. */
const TIMERS_CHANGED_EVENT = "erpnext_taskview:timers_changed";

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
	/** Classes he-tree puts on the node's `.tree-node` element. */
	class?: string;
}

/**
 * Where the last press in the tree landed.  he-tree makes its root element
 * the draggable, so the dragstart event says nothing about which row moves.
 */
let lastPointerTarget: Element | null = null;

/** Class on the expanded row's `.tree-node`; the tree-line CSS keys off it. */
const EXPANDED_NODE_CLASS = "tv-expanded";

export default defineComponent({
	name: "TaskView",
	components: { Draggable, Task, RowPanel, PinnedView },

	props: {
		docs: {
			type: Object as PropType<GetResponse>,
			required: true,
			default: () => ({ projects: [], tasks: [] }),
		},
	},

	data() {
		return {
			treeData: [] as TreeData[],
			pinnedTasks: [] as TaskDoc[],
			viewMode: "all" as "all" | "my_tasks" | "pinned",
			lastResponse: null as GetResponse | null,
			highlightedProject: null as TreeData | null,
			/**
			 * Doc name of the row whose panel is open (`RowPanel.vue`), or `null`.
			 * A name, not the node: every rebuild replaces the node objects.
			 */
			expandedName: null as string | null,
			/** Doc name of the panel whose description editor is open (unsaved text). */
			editingPanel: null as string | null,
			/** Names of tasks/projects in the current multi-selection (Ctrl/Shift-click). */
			selectedTasks: new Set<string>(),
			/** Last node touched by a plain or Ctrl-click; anchors Shift-range selection. */
			selectionAnchor: null as string | null,
			/** Whether the desk's side panel is open; mirrors its `side-panel-open` body class. */
			isOpened: false,
			panelObserver: null as MutationObserver | null,
			sideTimersElement: null as HTMLElement | null,
			manualSort: true,
			/** Open timers seen at the last timer event; a disappearance means time was logged. */
			knownTimerNames: new Set<string>(),
			/** When the tree was last rebuilt from a fresh `get()` snapshot. */
			lastPremountAt: 0,
		};
	},

	created() {
		const parent = document.querySelector(".layout-side-section");
		if (parent) {
			const el = document.createElement("div");
			el.id = "sidetimers";
			parent.appendChild(el);
			this.sideTimersElement = el;
		}
		this.premount();
	},

	mounted() {
		this.updateHighlightedProject();
		document.addEventListener("keydown", this.handleKeydown);
		document.addEventListener(TIMERS_CHANGED_EVENT, this.handleTimersChanged);
		// The panel is core's and has no open/close event; it toggles this class on <body>.
		const syncPanelState = () => {
			this.isOpened = document.body.classList.contains(SIDE_PANEL_OPEN_CLASS);
		};
		this.panelObserver = new MutationObserver(syncPanelState);
		this.panelObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
		syncPanelState();
	},

	beforeUnmount() {
		document.removeEventListener("keydown", this.handleKeydown);
		document.removeEventListener(TIMERS_CHANGED_EVENT, this.handleTimersChanged);
		this.panelObserver?.disconnect();
	},

	methods: {
		// ── Tree assembly ─────────────────────────────────────

		buildTree(data: GetResponse): TreeData[] {
			// Data arrives pre-sorted from the backend; the two-pass map approach
			// preserves that order naturally in each node's children array.
			const nodes = new Map<string, TreeData>();
			const root: TreeData[] = [];
			for (const p of data.projects) {
				const node: TreeData = { doc: p, children: [] };
				nodes.set(p.name, node);
				root.push(node);
			}
			// First pass: create all task nodes
			for (const t of data.tasks) {
				nodes.set(t.name, { doc: t, children: [] });
			}
			// Second pass: attach — push order == backend sort order
			for (const t of data.tasks) {
				const node = nodes.get(t.name)!;
				const parentKey = t.parent_task || t.project;
				const parent = nodes.get(parentKey);
				if (parent) parent.children.push(node);
			}
			return root;
		},

		premount(data: GetResponse | null = null): void {
			const source = data || this.docs;
			this.lastResponse = source;
			this.pinnedTasks = source.tasks
				.filter((t) => t.todo_name)
				.sort((a, b) => (a.pin_idx ?? 0) - (b.pin_idx ?? 0));

			let filtered = source;
			if (this.viewMode === "my_tasks") {
				filtered = this.filterMyTasks(source);
			}

			let docs = this.buildTree(filtered);
			docs = this.addBlankProject(docs);
			this.treeData = docs;
			setBudgetTree(source.tasks);
			this.lastPremountAt = Date.now();
			refreshTimers();
		},

		// ── Budget meters ─────────────────────────────────────

		/**
		 * Timer store event (either bundle).  When an open timer disappears — it
		 * was stopped or logged, e.g. from the dock — its hours moved from the
		 * live figure into `logged_hours`, so fetch fresh budgets.  Skipped right
		 * after a rebuild (that snapshot already carries them) and on instances
		 * whose DOM the list view has since replaced.
		 */
		handleTimersChanged(): void {
			const names = new Set(timers.value.keys());
			const logged = [...this.knownTimerNames].some((n) => !names.has(n));
			this.knownTimerNames = names;
			if (!logged || !(this.$el as Node | null)?.isConnected) return;
			if (Date.now() - this.lastPremountAt < 3000) return;
			this.refreshBudgets();
		},

		/** Patch budget figures onto the current docs without rebuilding the tree. */
		async refreshBudgets(): Promise<void> {
			const response = this.lastResponse;
			if (!response?.projects.length) return;
			try {
				const budgets = await fetchBudgetSummary(response.projects.map((p) => p.name));
				for (const doc of [...response.projects, ...response.tasks]) {
					const b = doc.doctype === "Project" ? budgets.projects[doc.name] : budgets.tasks[doc.name];
					if (!b) continue;
					doc.budget_hours = b.budget_hours;
					doc.logged_hours = b.logged_hours;
					doc.budget_source = b.source;
				}
			} catch (error) {
				console.warn("erpnext_taskview: budget refresh failed", error);
			}
		},

		/** Filter response to only show tasks assigned to the current user and their ancestor chain. */
		filterMyTasks(data: GetResponse): GetResponse {
			const user = frappe.session.user;
			// Find tasks assigned to me
			const myTaskNames = new Set<string>();
			for (const t of data.tasks) {
				if (user && t.assigned_to?.includes(user)) {
					myTaskNames.add(t.name);
				}
			}
			// Walk up parent_task chain to include ancestors
			const taskMap = new Map(data.tasks.map((t) => [t.name, t]));
			const includedTasks = new Set<string>();
			for (const name of myTaskNames) {
				let current: string | null = name;
				while (current && !includedTasks.has(current)) {
					includedTasks.add(current);
					const task = taskMap.get(current);
					current = task?.parent_task || null;
				}
			}
			// Include projects that have at least one included task
			const includedProjects = new Set<string>();
			for (const name of includedTasks) {
				const task = taskMap.get(name);
				if (task) includedProjects.add(task.project);
			}
			return {
				projects: data.projects.filter((p) => includedProjects.has(p.name)),
				tasks: data.tasks.filter((t) => includedTasks.has(t.name)),
			};
		},

		/** Called by the list bundle when the sort selector changes. */
		setSortMode(isManual: boolean): void {
			this.manualSort = isManual;
		},

		setViewMode(mode: "all" | "my_tasks" | "pinned"): void {
			this.clearSelection();
			this.selectionAnchor = null;
			this.viewMode = mode;
			if (this.lastResponse) {
				this.premount(this.lastResponse);
			}
		},

		async catchError(error: unknown): Promise<void> {
			console.error("Error updating data:", error);
			// A rejected frappe.call hands over its response object, whose server
			// messages frappe has already shown; repeating it adds "[object Object]".
			const shownByFrappe = typeof error === "object" && error !== null && !(error instanceof Error);
			if (!shownByFrappe) frappe.msgprint(`Error updating data: ${error}`);
			try {
				const data = await fetchData();
				this.premount(data);
			} catch (fetchErr) {
				console.error("Error fetching fresh data:", fetchErr);
			}
		},

		async saveAndRebuild(
			doc: Partial<ProjectDoc> | Partial<TaskDoc> | Partial<TimesheetDetailDoc>,
			children?: TaskDoc[],
			siblingOrder?: string[],
		): Promise<void> {
			try {
				const data = await saveDoc(doc, children, siblingOrder);
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
					treeNodes.value[current.data.doc.name] = true;
				}
				current = current.parent;
			}
		},

		// ── Drag and drop ─────────────────────────────────────

		async handleDragEnd(): Promise<void> {
			const draggedStat = dragContext.dragNode as StatObject | null;
			if (!draggedStat?.data?.doc) {
				await this.catchError(new Error("Invalid drop target"));
				return;
			}

			const draggedDoc = draggedStat.data.doc;
			const draggedIsProject = draggedDoc.doctype === "Project";

			// ── Project reorder: dropped at root level ────────────
			if (draggedIsProject) {
				const realRoots = (this.treeData as TreeData[]).filter((n) => n.doc?.name);
				const newIdx = realRoots.findIndex((n) => n.doc.name === draggedDoc.name) + 1;
				if (newIdx > 0) {
					(draggedDoc as ProjectDoc).idx = newIdx;
					// Send the explicit, authoritative order of all real projects so the
					// backend persists exactly what's on screen (see saveDoc / _apply_project_order).
					const siblingOrder = realRoots.map((n) => n.doc.name);
					await this.saveAndRebuild(draggedDoc as ProjectDoc, undefined, siblingOrder);
				}
				return;
			}

			// ── Task reorder / reparent ───────────────────────────
			if (!draggedStat?.parent?.data?.doc) {
				// Dropped at root level — invalid for tasks
				await this.catchError(new Error("Invalid drop target"));
				return;
			}

			const parentData = draggedStat.parent.data as TreeData;
			const parentDoc = parentData.doc;

			// Don't allow dropping onto blank placeholder nodes
			if (!parentDoc.name) {
				await this.catchError(new Error("Cannot drop onto a blank node"));
				return;
			}

			draggedStat.parent.open = true;

			const taskDoc = draggedStat.data.doc as TaskDoc;
			const parentIsProject = parentDoc.doctype === "Project";

			taskDoc.parent_task = parentIsProject ? null : parentDoc.name;

			// Determine 1-based position among real (non-blank) siblings after drop
			const postDropSiblings = ((draggedStat.parent.children || []) as StatObject[]).filter(
				(s) => s.data?.doc?.name,
			);
			const newIdx = postDropSiblings.indexOf(draggedStat) + 1;
			if (newIdx > 0) taskDoc.idx = newIdx;

			// Capture the explicit, authoritative order of the destination sibling
			// group (the dragged node is already at its dropped slot here) so the
			// backend persists exactly what's on screen (see _apply_sibling_order).
			const siblingOrder = postDropSiblings.map((s) => (s.data!.doc as TaskDoc).name);

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
			await this.saveAndRebuild(taskDoc, children.length > 0 ? children : undefined, siblingOrder);
			// Select the dropped row, but leave its panel as it was.
			this.selectNode(draggedStat.data);
		},

		// ── Per-node render hook ──────────────────────────────

		modifyNodeAndStat(node: TreeData, stat: StatObject): { node: TreeData; stat: StatObject } {
			// During drag @he-tree temporarily inserts a placeholder node into
			// treeData that has no `doc`. Return early and leave the stat untouched.
			if (!node.doc) return { node, stat };

			// Runs during render: write only on a change, or the write itself
			// would schedule another render.
			const nodeClass = this.isExpanded(node) ? EXPANDED_NODE_CLASS : "";
			if ((stat.class ?? "") !== nodeClass) stat.class = nodeClass;

			const isProject = node.doc.doctype === "Project";
			const isBlank = !node.doc.name;

			let pleaseExpandMe = false;

			if (isProject && node.doc.name) {
				const projectDoc = node.doc as ProjectDoc;
				if (projectDoc.project_name in treeNodes.value) {
					const value = treeNodes.value[projectDoc.project_name] ?? false;
					stat.open = value;
					treeNodes.value[node.doc.name] = value;
					delete treeNodes.value[projectDoc.project_name];
					pleaseExpandMe = value;
				}
			}

			if (treeNodes.value?.[node.doc.name || ""] === false) {
				stat.open = false;
			}

			if (treeNodes.value?.[node.doc.name || ""] === true || pleaseExpandMe) {
				stat.open = true;
				this.updateHighlightedProject();
			}

			if (isBlank) {
				stat.disableDrag = true;
				stat.disableDrop = true;
				stat.draggable = false;
				stat.droppable = false;
				stat.dragOpen = false;
			} else if (isProject) {
				// Projects are only draggable in Manual sort mode
				stat.disableDrag = !this.manualSort;
				stat.disableDrop = false;
				stat.draggable = this.manualSort;
				stat.droppable = true;
				stat.dragOpen = true;
			} else {
				// Tasks are only draggable in Manual sort mode
				stat.disableDrag = !this.manualSort;
				stat.disableDrop = false;
				stat.draggable = this.manualSort;
				stat.droppable = true;
				stat.dragOpen = true;
			}

			return { node, stat };
		},

		// ── Node factories and the "Add project..." placeholder ─

		createNode(doc: Partial<ProjectDoc> | Partial<TaskDoc>): TreeData {
			if (!doc.doctype) doc.doctype = "Task";
			if (!doc.name) doc.name = "";
			if (!doc.status) doc.status = "Open";
			return { doc: doc as ProjectDoc | TaskDoc, children: [] };
		},

		addBlankProject(docs: TreeData[]): TreeData[] {
			docs.push(
				this.createNode({
					doctype: "Project",
					name: "",
					project_name: "Add project...",
					status: "Open",
				} as ProjectDoc),
			);
			return docs;
		},

		// ── Highlight and navigation ──────────────────────────

		isHighlightedProject(node: TreeData): boolean {
			try {
				return !!(node.doc.doctype === "Project" && node.doc.name === this.highlightedProject?.doc.name);
			} catch {
				return !!(node.doc.doctype === "Project" && node === this.highlightedProject);
			}
		},

		toggleNode(node: TreeData, stat: StatObject): void {
			if (!node.doc.name) return;

			stat.open = !stat.open;
			treeNodes.value[node.doc.name] = stat.open;
			// Collapsing an ancestor hides the open panel's row (he-tree stops
			// rendering it), so close the panel too.
			if (!stat.open && this.expandedName && this.findParentNode(node.children, this.expandedName)) {
				this.setExpanded(null);
			}

			if (stat.open) {
				stat.children?.forEach((child) => {
					child.hidden = !stat.open;
				});
			}

			const isProject = node.doc.doctype === "Project";
			if (!isProject) {
				const parentProject = this.findParentProject(node);
				if (parentProject) {
					this.highlightedProject = parentProject;
				}
			} else if (stat.open) {
				this.highlightedProject = node;
			} else {
				const nextExpandedProject = this.treeData.find(
					(project) =>
						project.doc.doctype === "Project" && project.doc.name && treeNodes.value?.[project.doc.name],
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
			return this.treeData.find((project) => project.doc.name === projectName);
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

		/**
		 * A click on a row.  Ctrl/Cmd and Shift build the copy selection and
		 * nothing else.  A plain click selects the row (see {@link selectNode})
		 * and toggles its panel: it opens under the row, closing any other, and
		 * a click on the open row closes it.
		 */
		handleTaskInteraction(node: TreeData, event?: MouseEvent | KeyboardEvent): void {
			// The "Add project..." placeholder is edited in place, never selected.
			if (!node.doc.name) return;

			// ── Multi-selection (Ctrl/Cmd toggles, Shift extends a range) ──────
			if (event && (event.ctrlKey || event.metaKey)) {
				event.preventDefault();
				this.toggleSelected(node.doc.name);
				this.selectionAnchor = node.doc.name;
				return;
			}
			if (event && event.shiftKey) {
				event.preventDefault(); // suppress native text selection across the range
				this.selectRange(node.doc.name);
				this.selectionAnchor = this.selectionAnchor ?? node.doc.name;
				return;
			}

			this.selectNode(node);
			// The second click of a double-click (which renames the row) would
			// undo the first one's toggle.
			if (event instanceof MouseEvent && event.detail > 1) return;
			this.setExpanded(this.expandedName === node.doc.name ? null : node.doc.name);
		},

		/**
		 * Select a row without touching any panel: clear the multi-selection,
		 * anchor the next Shift-range here and highlight the row's project.
		 * Used on its own after a rename or a drop.
		 */
		selectNode(node: TreeData): void {
			if (!node.doc.name) return;
			this.clearSelection();
			this.selectionAnchor = node.doc.name;

			if (node.doc.doctype === "Project") {
				if (node.doc.status !== "Completed") this.highlightedProject = node;
			} else {
				const parentProject = this.findParentProject(node);
				if (parentProject) this.highlightedProject = parentProject;
			}
		},

		// ── Expanded row panel ────────────────────────────────

		isExpanded(node: TreeData): boolean {
			return !!node.doc?.name && node.doc.name === this.expandedName;
		},

		collapsePanel(): void {
			this.setExpanded(null);
		},

		/**
		 * Open a row's panel, or none.  Closing a panel whose description
		 * editor is open would drop its unsaved text, so ask first.
		 */
		setExpanded(name: string | null): void {
			if (name === this.expandedName) return;
			const apply = () => {
				this.editingPanel = null;
				this.expandedName = name;
			};
			if (this.editingPanel && this.editingPanel === this.expandedName) {
				frappe.confirm(__("Discard your unsaved changes to the description?"), apply);
				return;
			}
			apply();
		},

		/** A panel's description editor opened or closed. */
		onPanelEditing(name: string, editing: boolean): void {
			if (editing) this.editingPanel = name;
			else if (this.editingPanel === name) this.editingPanel = null;
		},

		/**
		 * Highest `idx` among a row's children in the full snapshot, so the
		 * panel appends after every sibling, the ones "My Tasks" hides too.
		 */
		maxChildIdx(node: TreeData): number {
			const name = node.doc.name;
			const isProject = node.doc.doctype === "Project";
			let max = 0;
			for (const t of this.lastResponse?.tasks ?? []) {
				const isChild = isProject ? t.project === name && !t.parent_task : t.parent_task === name;
				if (isChild) max = Math.max(max, t.idx ?? 0);
			}
			return max;
		},

		/**
		 * Enter or Space on a focused row (he-tree's treeitem) toggles its
		 * panel, as a click does.  he-tree turns both keys into `click:node`,
		 * which it also emits for every mouse click, so they are caught here.
		 */
		onTreeKeydown(event: KeyboardEvent): void {
			if (event.key !== "Enter" && event.key !== " ") return;
			if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
			const item = event.target as HTMLElement;
			if (!item.classList?.contains("tree-node")) return;
			const name = item.querySelector<HTMLElement>(".tv-node")?.dataset.name;
			const node = name ? this.findParentNode(this.treeData, name) : null;
			if (node) this.handleTaskInteraction(node, event);
		},

		/** he-tree row key: the doc name; the drag placeholder's data is an empty object. */
		nodeKey(stat: { data: Partial<TreeData> }, index: number): string {
			return stat.data.doc?.name || `__index_${index}`;
		},

		/**
		 * he-tree sets the whole `.tree-node` as the drag image, which for an
		 * expanded row includes its panel.  This hook runs after that call, and
		 * the last `setDragImage` wins: drag just the row.
		 */
		onTreeDragStart(event: DragEvent): void {
			const row = lastPointerTarget?.closest<HTMLElement>(".tv-row");
			if (!row || !event.dataTransfer) return;
			const rect = row.getBoundingClientRect();
			event.dataTransfer.setDragImage(row, event.clientX - rect.left, event.clientY - rect.top);
		},

		rememberPointer(event: PointerEvent): void {
			lastPointerTarget = event.target instanceof Element ? event.target : null;
		},

		/** Whether a row's panel is in the DOM (not under a collapsed ancestor). */
		isPanelRendered(name: string): boolean {
			return !!(this.$el as HTMLElement).querySelector(`.tv-panel[data-name="${CSS.escape(name)}"]`);
		},

		/** The child entry input of an open panel, if it is rendered. */
		panelEntryInput(name: string): HTMLInputElement | null {
			return (this.$el as HTMLElement).querySelector<HTMLInputElement>(
				`.tv-panel[data-name="${CSS.escape(name)}"] .tv-panel__entry-input`,
			);
		},

		/** Whether a row's panel offers the child entry (mirrors `RowPanel.canAddChildren`). */
		canTakeChildren(node: TreeData): boolean {
			return node.doc.status !== "Completed" && !!getProjectName(node);
		},

		// ── Multi-selection & copy-to-clipboard ──────────────────

		/** Whether a node is part of the current copy selection. */
		isSelected(node: TreeData): boolean {
			return !!node.doc.name && this.selectedTasks.has(node.doc.name);
		},

		/** Add/remove a single node from the selection. */
		toggleSelected(name: string): void {
			if (this.selectedTasks.has(name)) {
				this.selectedTasks.delete(name);
			} else {
				this.selectedTasks.add(name);
			}
		},

		/** Drop the whole selection (Escape, plain click, or view switch). */
		clearSelection(): void {
			if (this.selectedTasks.size) this.selectedTasks.clear();
		},

		/**
		 * Flatten `treeData` to the names of visible **task** rows in display
		 * order, honoring collapse state so a Shift-range only spans currently
		 * visible tasks.  Projects are traversed (to reach their tasks) but never
		 * listed — a range must not sweep a whole project subtree into the copy.
		 * The "Add project..." placeholder is skipped.
		 */
		flattenVisibleTaskRows(): string[] {
			const names: string[] = [];
			const walk = (nodes: TreeData[]): void => {
				for (const node of nodes) {
					const name = node.doc.name;
					if (!name) continue;
					if (node.doc.doctype !== "Project") names.push(name);
					// `treeNodes` stores `false` only for explicitly collapsed nodes.
					if (treeNodes.value?.[name] !== false) walk(node.children);
				}
			};
			walk(this.treeData);
			return names;
		},

		/** Replace the selection with the inclusive task range anchor→target. */
		selectRange(targetName: string): void {
			this.clearSelection();
			if (!this.selectionAnchor) {
				this.selectedTasks.add(targetName);
				return;
			}
			const order = this.flattenVisibleTaskRows();
			const a = order.indexOf(this.selectionAnchor);
			const b = order.indexOf(targetName);
			if (a === -1 || b === -1) {
				this.selectedTasks.add(targetName);
				return;
			}
			const [lo, hi] = a <= b ? [a, b] : [b, a];
			for (const name of order.slice(lo, hi + 1)) this.selectedTasks.add(name);
		},

		/** Ctrl/Cmd+C: copy the selection as Markdown (see `taskMarkdown.ts`). */
		copySelectionToClipboard(): void {
			copyNodesAsMarkdown(selectionRoots(this.treeData, this.selectedTasks));
		},

		/**
		 * A row's copy button.  On a row inside the multi-selection it copies the
		 * whole selection; otherwise just that row and its subtasks.  Pinned rows
		 * are flat, so their subtasks are rebuilt from the last `get()` snapshot.
		 */
		copyFromRow(node: TreeData): void {
			if (this.viewMode === "pinned") {
				const tasks = this.lastResponse?.tasks ?? [];
				copyNodesAsMarkdown([subtreeFromDocs(node.doc as TaskDoc, tasks)]);
			} else if (this.isSelected(node)) {
				copyNodesAsMarkdown(selectionRoots(this.treeData, this.selectedTasks));
			} else {
				copyNodesAsMarkdown([node]);
			}
		},

		updateHighlightedProject(): void {
			if (!this.treeData || !Array.isArray(this.treeData)) {
				console.warn("Tree data is not initialized or not an array");
				return;
			}

			const expandedProjects = this.treeData.filter(
				(node) =>
					node.doc.doctype === "Project" && node.doc.name && treeNodes.value?.[node.doc.name] !== false,
			);

			if (expandedProjects.length > 0) {
				this.highlightedProject = expandedProjects[0] ?? null;
			} else {
				const blankProject = this.treeData.find((node) => !node.doc.name);
				if (blankProject) {
					this.highlightedProject = blankProject;
				}
			}
		},

		// ── Keyboard shortcuts ────────────────────────────────

		/**
		 * "Start typing to create": a printable key with nothing focused goes to
		 * a child entry input.  The open panel's when it takes children,
		 * otherwise the highlighted project's (opening its panel), or the
		 * "Add project..." row when no project is highlighted.
		 *
		 * An input that is already there is focused while the key is still
		 * being handled, so the browser types the character into it.  One that
		 * has yet to render gets the character by hand once it has.
		 */
		startTyping(event: KeyboardEvent): void {
			// Only a panel on screen can take the key; one hidden under a
			// collapsed ancestor falls back to the highlighted project.
			const expandedName = this.expandedName;
			const expanded =
				expandedName && this.isPanelRendered(expandedName)
					? this.findParentNode(this.treeData, expandedName)
					: null;
			let target: TreeData | null = expanded && this.canTakeChildren(expanded) ? expanded : null;
			if (!target) {
				const project = this.highlightedProject;
				if (!project) return;
				if (!project.doc.name) {
					project._autoFocus = true;
					return;
				}
				if (!this.canTakeChildren(project)) return;
				target = project;
			}

			const name = target.doc.name;
			const input = this.expandedName === name ? this.panelEntryInput(name) : null;
			if (input) {
				input.focus({ preventScroll: true });
				return;
			}

			// Switching panels would ask about an open description editor; leave the key be.
			if (this.editingPanel) return;
			event.preventDefault();
			this.setExpanded(name);
			const typed = event.key;
			nextTick(() => {
				const entry = this.panelEntryInput(name);
				if (!entry) return;
				entry.focus({ preventScroll: true });
				entry.value += typed;
				entry.dispatchEvent(new Event("input")); // v-model listens for it
				entry.scrollIntoView({ block: "nearest" });
			});
		},

		handleKeydown(event: KeyboardEvent): void {
			// Fields, editors and anything inside a row panel keep their keys.
			const active = document.activeElement as HTMLElement | null;
			const tag = active?.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
			if (active?.isContentEditable || active?.closest(".tv-panel")) return;

			// Ctrl/Cmd+C copies the current selection as a markdown tree.
			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c" && this.selectedTasks.size) {
				event.preventDefault();
				this.copySelectionToClipboard();
				return;
			}

			// Escape clears the selection, or else closes the open panel.
			// The panel's own Escape guard is skipped when focus has left it (a
			// click on its text focuses the row), so an open editor is checked here.
			if (event.key === "Escape") {
				if (this.selectedTasks.size) this.clearSelection();
				else if (this.expandedName && this.viewMode !== "pinned" && !this.editingPanel) {
					this.collapsePanel();
				}
				return;
			}

			// "Start typing to create" — but never for Ctrl/Cmd/Alt shortcuts.
			const allowedKeys = /^[a-zA-Z0-9!@#$%^&*()_+={}[\]|\\:;'",.<>?/`~\- ]$/;
			if (
				allowedKeys.test(event.key) &&
				!event.ctrlKey &&
				!event.metaKey &&
				!event.altKey &&
				!this.isOpened
			) {
				if (this.viewMode === "pinned") {
					// Focus synchronously, while the key is still being handled, so the
					// typed character lands in the quick-entry input.
					(this.$refs.pinnedView as InstanceType<typeof PinnedView> | undefined)?.focusEntry();
				} else {
					this.startTyping(event);
				}
			}
		},

		// ── Sidebar ───────────────────────────────────────────

		/**
		 * Opens the row's Task or Project in the desk's side panel, the same one
		 * report and list links use.  What it can do beyond previewing comes from
		 * the site: Data Steward makes it read-write.
		 */
		async openSidebar(payload: { doc: ProjectDoc | TaskDoc; isProject: boolean }): Promise<void> {
			const doctype = payload.isProject ? "Project" : "Task";
			const name = payload.doc.name;
			if (!name) return;

			try {
				// The panel is its own bundle, loaded the first time anything opens it.
				await frappe.require("side_panel.bundle.js");
				const panel = frappe.ui.get_side_panel?.();
				if (!panel) throw new Error("the side panel is not available");
				panel.open(doctype, name);
			} catch (error) {
				console.error("erpnext_taskview: side panel failed, opening the form instead", error);
				frappe.set_route("Form", doctype, name);
			}
		},
	},
});
</script>

<style>
/* ── Sort bar ──────────────────────────────────────────────── */
.tv-sort-bar {
	display: flex;
	align-items: center;
	padding: 4px 8px;
	border-bottom: 1px solid var(--border-color);
}

.sort-selector {
	display: flex;
	align-items: center;
	gap: 4px;
}

.tv-sort-select {
	height: 26px;
	padding: 2px 6px;
	font-size: var(--text-xs);
	border: 1px solid var(--border-color);
	border-radius: var(--border-radius-tiny);
	background: var(--control-bg);
	color: var(--text-color);
	cursor: pointer;
}

.tv-sort-order {
	height: 26px;
	padding: 2px 7px;
	font-size: var(--text-sm);
	line-height: 1;
}

/* ── Tree ──────────────────────────────────────────────────── */
.tree-container {
	/* Adjusts overall tree font size */
	font-size: var(--text-md);
}

.small-icon {
	/* Scales down the icon size */
	font-size: 1.5em;
}

/* ── Rows and their expandable panel ───────────────────────────
   Each tree node is a column: the row (.tv-row) and, for the selected row,
   its panel.  The expanded node and panel read as one Carbon block: one
   background, a subtle rule above and below.  Carbon tokens come first, the
   desk's own variables are the fallback when carbon_theme isn't installed. */
.mtl-tree {
	/* Row height: the 28px action buttons.  Tree lines aim at its midpoint. */
	--tv-row-h: 28px;
	--tv-panel-bg: var(--cds-layer-01, var(--subtle-fg));
	/* Not --fg-hover-color: without carbon_theme that is the panel's own grey. */
	--tv-panel-hover: var(--cds-layer-hover-01, var(--surface-gray-3));
	--tv-panel-border: var(--cds-border-subtle, var(--border-color));
	--tv-motion: cubic-bezier(0.2, 0, 0.38, 0.9);
}

.tv-node {
	position: relative;
	display: flex;
	flex-direction: column;
	flex: 1 1 auto;
	width: 100%;
	min-width: 0;
}

.outer-task {
	/* align center */
	display: flex;
	flex-direction: row;
	align-items: center;
	width: 100%;
	/* Shrink below content width (see .task in Task.vue) so a long subject
     truncates rather than pushing the row's controls out of view. */
	min-width: 0;
}

/* The chevron is fixed-width — only the subject should give up space. */
.outer-task > .he-tree__open-icon {
	flex-shrink: 0;
}

.outer-task.tv-row {
	min-height: var(--tv-row-h);
	cursor: pointer;
}

.mtl-tree .tree-node:hover {
	background-color: var(--fg-hover-color);
}

/* The expanded node carries the block background; hover then marks only the
   row, never the panel under it. */
.mtl-tree .tree-node.tv-expanded,
.mtl-tree .tree-node.tv-expanded:hover {
	background-color: var(--tv-panel-bg);
	box-shadow:
		inset 0 1px var(--tv-panel-border),
		inset 0 -1px var(--tv-panel-border);
	transition: background-color 70ms var(--tv-motion);
}

.mtl-tree .tree-node.tv-expanded .tv-row:hover {
	background-color: var(--tv-panel-hover);
}

/* he-tree centres a node's own lines on the whole node, which for an expanded
   node is mid-panel.  Re-aim them at the row: the elbow (hline), and the
   vline that stops at the elbow on a last sibling (an inline style, hence
   !important).  1px is the .tree-node's top padding. */
.mtl-tree .tree-node.tv-expanded > .tree-hline {
	top: calc(1px + var(--tv-row-h) / 2);
}

.mtl-tree .tree-node.tv-expanded > .tree-vline:first-child[style*="bottom: 50%"] {
	bottom: calc(100% - 1px - var(--tv-row-h) / 2) !important;
}

/* Children's lines start at their own rows, so draw the stretch from the
   open parent's chevron down past its panel (he-tree's treeLineOffset, 8px). */
.tv-node--parent-open::before {
	content: "";
	position: absolute;
	left: 8px;
	top: var(--tv-row-h);
	bottom: -2px;
	width: 1px;
	background-color: #bbb;
}

/* Inset the panel to the row's checkbox column: chevron (1.5em) + its 4px
   margin + Task's 4px margin. */
.tv-panel-shell {
	display: grid;
	grid-template-rows: 1fr;
	margin-left: calc(1.5em + 8px);
}

.tv-panel-clip {
	min-height: 0;
}

.tv-panel-enter-active,
.tv-panel-leave-active {
	transition: grid-template-rows 150ms var(--tv-motion);
}

.tv-panel-enter-active > .tv-panel-clip,
.tv-panel-leave-active > .tv-panel-clip {
	overflow: hidden;
}

.tv-panel-enter-from,
.tv-panel-leave-to {
	grid-template-rows: 0fr;
}

@media (prefers-reduced-motion: reduce) {
	.tv-panel-enter-active,
	.tv-panel-leave-active,
	.mtl-tree .tree-node.tv-expanded {
		transition: none;
	}
}

/* Multi-selected rows (Ctrl/Shift-click) painted for the copy feature.  The
   inner .outer-task paints over the .tree-node hover background, so selection
   stays visible on hover. */
.outer-task.task-selected {
	background-color: var(--highlight-color);
	border-radius: var(--border-radius);
}

.he-tree__open-icon svg path {
	fill: var(--text-muted);
}
</style>
