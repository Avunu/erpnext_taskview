<template>
  <div class="tree-container" v-if="viewMode !== 'pinned'">
    <Draggable
      class="mtl-tree"
      v-model="treeData"
      treeLine
      :rootDroppable="true"
      @after-drop="handleDragEnd"
    >
      <template #default="{ node, stat }">
        <!-- modify node and stat to perpetuate collapse node states -->
        <div
          v-if="modifyNodeAndStat(node, stat)"
          class="outer-task"
          :class="{ 'highlighted-project': isHighlightedProject(node) }"
        >
          <!-- expand/collapse button -->
          <a
            class="he-tree__open-icon mtl-mr small-icon"
            @click="toggleNode(node, stat)"
            :class="{ open: stat.open }"
          >
            <div class="icon-container">
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
            class="mtl-ml"
            @task-interaction="handleTaskInteraction(node)"
            @add-sibling-task="addSiblingTask(node)"
            @catch-error="catchError"
            @catch-success="premount"
            @open-sidebar="openSidebar"
            @request-expand="expandAncestors(stat)"
          />
        </div>
      </template>
    </Draggable>
  </div>
  <div v-else class="pinned-container">
    <PinnedView
      :pinnedTasks="pinnedTasks"
      @catch-success="premount"
      @catch-error="catchError"
      @open-sidebar="openSidebar"
    />
  </div>
  <div>
    <VueSidePanel v-model="isOpened" width="930px" hide-close-btn>
      <template #header>
        <div class="page-head flex">
          <div class="container">
            <div class="row flex-nowrap align-center page-head-content justify-between">
              <div class="page-title">
                <div class="flex fill-width title-area ellipsis">
                  <ul class="nav d-sm-flex ellipsis">
                    <li class="ellipsis text-large breadcrumb-item">{{ sidebarDoctype }}</li>
                    <li class="ellipsis text-large breadcrumb-item">{{ sidebarTitle }}</li>
                  </ul>
                </div>
              </div>
              <div class="flex col page-actions justify-content-end">
                <button
                  v-if="sidebarFormInstance"
                  class="btn btn-primary btn-sm"
                  :disabled="!sidebarDirty"
                  @click="saveSidebarForm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #default>
        <div ref="formWrapper"></div>
      </template>
    </VueSidePanel>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { Draggable, dragContext } from "@he-tree/vue";
import Task from "./components/Task.vue";
import PinnedView from "./components/PinnedView.vue";
import { VueSidePanel } from "vue3-side-panel";
import "vue3-side-panel/dist/vue3-side-panel.css";
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
  getProjectName,
} from "./types";
import { refreshTimers, timersByTask } from "./timerStore";
import { treeNodes } from "./treeState";

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
  name: "TaskView",
  components: { Draggable, Task, PinnedView, VueSidePanel },

  props: {
    docs: {
      type: Object as PropType<GetResponse>,
      required: true,
      default: () => ({ projects: [], tasks: [] }),
    },
  },

  data() {
    const theme = document.documentElement.getAttribute("data-theme-mode") || "light";
    return {
      treeData: [] as TreeData[],
      pinnedTasks: [] as TaskDoc[],
      viewMode: "all" as "all" | "my_tasks" | "pinned",
      lastResponse: null as GetResponse | null,
      highlightedProject: null as TreeData | null,
      activeNode: null as TreeData | null,
      isOpened: false,
      sidebarTitle: "" as string,
      sidebarDoctype: "" as string,
      sidebarDirty: false,
      sidebarFormInstance: null as any,
      currentTheme:
        theme === "automatic"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : theme,
      sideTimersElement: null as HTMLElement | null,
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
    this.setTheme();
    this.updateHighlightedProject();
    document.addEventListener("keydown", this.handleKeydown);
  },

  beforeUnmount() {
    document.removeEventListener("keydown", this.handleKeydown);
  },

  methods: {
    // ── Tree assembly ─────────────────────────────────────

    buildTree(data: GetResponse): TreeData[] {
      const nodes = new Map<string, TreeData>();
      // Sort projects by idx before inserting so root order is stable
      const sortedProjects = [...data.projects].sort((a, b) => (a.idx ?? 0) - (b.idx ?? 0));
      const root: TreeData[] = [];
      for (const p of sortedProjects) {
        const node: TreeData = { doc: p, children: [] };
        nodes.set(p.name, node);
        root.push(node);
      }
      // First pass: create all task nodes (no attachment yet)
      for (const t of data.tasks) {
        nodes.set(t.name, { doc: t, children: [] });
      }
      // Second pass: attach children to parents (order of iteration = lft order = parents first)
      for (const t of data.tasks) {
        const node = nodes.get(t.name)!;
        const parentKey = t.parent_task || t.project;
        const parent = nodes.get(parentKey);
        if (parent) parent.children.push(node);
      }
      // Sort each node's children by idx so drag-ordered positions are honoured
      for (const node of nodes.values()) {
        if (node.children.length > 1) {
          node.children.sort(
            (a, b) => ((a.doc as TaskDoc).idx ?? 0) - ((b.doc as TaskDoc).idx ?? 0),
          );
        }
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
      docs = this.addBlankTasks(docs);
      this.treeData = docs;
      refreshTimers();
    },

    /** Filter response to only show tasks assigned to the current user and their ancestor chain. */
    filterMyTasks(data: GetResponse): GetResponse {
      const user = frappe.session.user;
      // Find tasks assigned to me
      const myTaskNames = new Set<string>();
      for (const t of data.tasks) {
        if (t.assigned_to?.includes(user)) {
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

    setViewMode(mode: "all" | "my_tasks" | "pinned"): void {
      this.viewMode = mode;
      if (this.lastResponse) {
        this.premount(this.lastResponse);
      }
    },

    async catchError(error: unknown): Promise<void> {
      console.error("Error updating data:", error);
      frappe.msgprint(`Error updating data: ${error}`);
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
          treeNodes.value[current.data.doc.name] = true;
        }
        current = current.parent;
      }
    },

    // ── Theme ─────────────────────────────────────────────

    setTheme(): void {
      document.documentElement.style.setProperty(
        "--task-hover-bg-color",
        this.currentTheme === "dark" ? "#686868" : "#ededed",
      );
      document.documentElement.style.setProperty(
        "--icon-color",
        this.currentTheme === "dark" ? "#d3d3d3" : "#000000",
      );
      document.documentElement.style.setProperty(
        "--sidebar-bg-color",
        this.currentTheme === "dark" ? "#2f2f2f" : "#f9f9f9",
      );
    },

    // ── Drag and drop ─────────────────────────────────────

    async handleDragEnd(): Promise<void> {
      const draggedStat = (dragContext as any).dragNode;
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
          await this.saveAndRebuild(draggedDoc as ProjectDoc);
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
      // During drag @he-tree temporarily inserts a placeholder node into
      // treeData that has no `doc`. Return early and leave the stat untouched.
      if (!node.doc) return { node, stat };

      const isProject = node.doc.doctype === "Project";
      const isBlank = !node.doc.name;
      const detail = timersByTask.value.get(node.doc.name);
      const hasActiveTimer = !!detail;

      let pleaseExpandMe = false;

      if (isProject && node.doc.name) {
        const projectDoc = node.doc as ProjectDoc;
        if (projectDoc.project_name in treeNodes.value) {
          const value = treeNodes.value[projectDoc.project_name];
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

      let runningChildren = false;
      if (node.children?.length > 0) {
        runningChildren = node.children.some(
          (child) => child.doc && timersByTask.value.has(child.doc.name),
        );
      }

      if (isBlank) {
        stat.disableDrag = true;
        stat.disableDrop = true;
        stat.draggable = false;
        stat.droppable = false;
        stat.dragOpen = false;
      } else if (isProject) {
        // Projects are draggable at root level but not droppable into other projects
        stat.disableDrag = false;
        stat.disableDrop = false;
        stat.draggable = true;
        stat.droppable = true;
        stat.dragOpen = true;
      } else if (hasActiveTimer || runningChildren) {
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

    /** Remove all blank task nodes from the tree. */
    stripBlanks(nodes: TreeData[]): void {
      for (const node of nodes) {
        if (node.children) {
          node.children = node.children.filter((c) => !!c.doc?.name);
          this.stripBlanks(node.children);
        }
      }
    },

    addBlankTasks(docs: TreeData[]): TreeData[] {
      this.stripBlanks(docs);

      // Determine which parent should get the blank node.
      let targetParent: TreeData | null = null;

      if (this.activeNode) {
        const isProject = this.activeNode.doc.doctype === "Project";
        if (isProject) {
          // Active node is a project → blank as its immediate child
          targetParent = docs.find((p) => p.doc.name === this.activeNode!.doc.name) || null;
        } else {
          // Active node is a task → blank as its child
          targetParent = this.findParentNode(docs, this.activeNode.doc.name);
        }
      } else if (this.highlightedProject?.doc.name) {
        targetParent = docs.find((p) => p.doc.name === this.highlightedProject!.doc.name) || null;
      }

      if (targetParent) {
        this.ensureBlankChild(targetParent);
      }
      return docs;
    },

    /** Add a single blank "Add task..." child to `node` if not already present. Non-recursive. */
    ensureBlankChild(node: TreeData): void {
      if (node.doc.status === "Completed") return;
      if (!node.children) node.children = [];
      if (node.children.some((child) => !child.doc.name)) return;

      const isProject = node.doc.doctype === "Project";
      const projectName = getProjectName(node);
      const parentTask = isProject ? null : node.doc.name;

      const blankTask = this.createNode({
        doctype: "Task",
        name: "",
        subject: "Add task...",
        project: projectName,
        parent_task: parentTask,
        status: "Open",
        is_group: 0,
        priority: "Medium",
      } as TaskDoc);
      node.children = [...node.children, blankTask];
      this.treeData = [...this.treeData];
    },

    // ── Highlight and navigation ──────────────────────────

    isHighlightedProject(node: TreeData): boolean {
      try {
        return !!(
          node.doc.doctype === "Project" && node.doc.name === this.highlightedProject?.doc.name
        );
      } catch {
        return !!(node.doc.doctype === "Project" && node === this.highlightedProject);
      }
    },

    toggleNode(node: TreeData, stat: StatObject): void {
      if (!node.doc.name) return;

      stat.open = !stat.open;
      treeNodes.value[node.doc.name] = stat.open;

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
            project.doc.doctype === "Project" &&
            project.doc.name &&
            treeNodes.value?.[project.doc.name],
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

    addSiblingTask(node: TreeData): void {
      const isProject = node.doc.doctype === "Project";
      const parentDocName = isProject
        ? ""
        : (node.doc as TaskDoc).parent_task || (node.doc as TaskDoc).project;

      const projectName = getProjectName(node);
      const parentTask = isProject ? null : (node.doc as TaskDoc).parent_task;

      const newBlankNode = this.createNode(
        isProject
          ? ({
              doctype: "Project",
              name: "",
              project_name: "Add project...",
              status: "Open",
            } as ProjectDoc)
          : ({
              doctype: "Task",
              name: "",
              subject: "Add task...",
              project: projectName,
              parent_task: parentTask,
              status: "Open",
              is_group: 0,
              priority: "Medium",
            } as TaskDoc),
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
      const isProject = node.doc.doctype === "Project";
      const isBlank = !node.doc.name;

      // Clicking a blank node should never reposition it — the blank is
      // already in the correct place and the user is about to type into it.
      if (isBlank) return;

      if (isProject) {
        if (node.doc.status !== "Completed") {
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

      // Track the active node and re-place the blank as its child
      this.activeNode = node;
      this.stripBlanks(this.treeData);

      let targetParent: TreeData | null = null;
      if (!isProject) {
        // Task selected → blank as its child
        targetParent = this.findParentNode(this.treeData, node.doc.name);
      } else if (this.highlightedProject?.doc.name) {
        targetParent = this.highlightedProject;
      }

      if (targetParent) {
        treeNodes.value[targetParent.doc.name] = true;
        this.ensureBlankChild(targetParent);
      }
    },

    updateHighlightedProject(): void {
      if (!this.treeData || !Array.isArray(this.treeData)) {
        console.warn("Tree data is not initialized or not an array");
        return;
      }

      const expandedProjects = this.treeData.filter(
        (node) =>
          node.doc.doctype === "Project" &&
          node.doc.name &&
          treeNodes.value?.[node.doc.name] !== false,
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
          const blankTask = project.children.find((task) => !task.doc.name);
          if (blankTask) {
            blankTask._autoFocus = true;
          }
        }
      }
    },

    handleKeydown(event: KeyboardEvent): void {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const allowedKeys = /^[a-zA-Z0-9!@#$%^&*()_+={}[\]|\\:;'",.<>?/`~\- ]$/;
      if (allowedKeys.test(event.key) && !this.isOpened) {
        this.editRootBlankTask();
      }
    },

    // ── Sidebar ───────────────────────────────────────────

    async loadForm(payload: { doc: ProjectDoc | TaskDoc; isProject: boolean }): Promise<void> {
      const doctype = payload.isProject ? "Project" : "Task";
      const docName = payload.doc.name;

      try {
        const formWrapper = this.$refs.formWrapper as HTMLElement;
        if (!formWrapper || !document.body.contains(formWrapper)) {
          console.error("formWrapper is not attached to the DOM");
          return;
        }

        await frappe.model.with_doctype(doctype);
        const meta = frappe.get_meta(doctype);
        const prev = meta.hide_toolbar;
        meta.hide_toolbar = 1;
        formWrapper.innerHTML = "";
        const formInstance = new frappe.ui.form.Form(doctype, formWrapper, true, "");
        await frappe.model.with_doc(doctype, docName);
        formInstance.refresh(docName);
        formInstance.page.page_head.addClass("hidden");
        meta.hide_toolbar = prev;

        // Populate our custom header
        this.sidebarDoctype = __(doctype);
        this.sidebarTitle = docName;
        this.sidebarDirty = false;
        this.sidebarFormInstance = formInstance;

        // Track dirty state so the Save button reflects unsaved changes
        frappe.model.on(doctype, "*", (_field: string, _val: unknown, _changedDoc: any) => {
          if (formInstance.is_dirty) {
            this.sidebarDirty = true;
          } else {
            this.sidebarDirty = false;
          }
        });

        // hide_toolbar suppresses the footer/timeline — restore it manually
        if (!formInstance.footer && (frappe.boot as any).desk_settings?.timeline) {
          const footerEl = document.createElement("div");
          formInstance.page.main[0].parentElement?.appendChild(footerEl);
          formInstance.footer = new (frappe.ui.form as any).Footer({
            frm: formInstance,
            parent: footerEl,
          });
          formInstance.footer.refresh();
          formInstance.parent.removeClass = function () {};
        }
      } catch (err) {
        console.error("Error loading form:", err);
      }
    },

    saveSidebarForm(): void {
      if (!this.sidebarFormInstance) return;
      this.sidebarFormInstance.save("Save", () => {
        this.sidebarDirty = false;
      });
    },

    openSidebar(payload: any): void {
      this.isOpened = true;
      this.sidebarFormInstance = null;
      this.sidebarTitle = "";
      this.sidebarDoctype = "";
      this.sidebarDirty = false;
      this.loadForm(payload);
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

.form-tabs-list {
  top: 0 !important;
}

.sidebar {
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 20px;
  padding-top: 65px;
}

.body-sidebar {
  z-index: 500 !important;
}

.vsp-overlay {
  z-index: 501 !important;
}

.vsp--right-side {
  z-index: 550 !important;
}
</style>
