/**
 * @module taskview
 *
 * Composable that owns the **tree data model** and all tree-level operations
 * for the ERPNext Task View.
 *
 * ## Responsibilities
 *
 * - **Tree assembly** — {@link buildTree} converts the flat
 *   {@link GetResponse} into a nested {@link TreeData} hierarchy.
 * - **Timesheet details map** — {@link updateDetailsMap} maintains a
 *   reactive `Map<taskName, TimesheetDetailDoc>` that is `provide`d to
 *   child `Task.vue` components so they can derive timer state via
 *   `inject` + `computed`.
 * - **Collapse / expand persistence** — node open/close state is persisted
 *   in `locals.nodes` (Frappe page-local storage) and replayed on every
 *   rebuild via {@link modifyNodeAndStat}.
 * - **Drag-and-drop** — {@link handleDragEnd} handles reparenting,
 *   project reassignment, and descendant project updates.
 * - **Blank placeholders** — {@link addBlankProject} / {@link addBlankTask}
 *   insert editable placeholder nodes so the user can create new items
 *   inline.
 * - **Sidebar** — {@link openSidebar} / {@link closeTimeLogger} manage
 *   the side panel for forms and the time logger widget.
 * - **Ancestor expansion** — {@link expandAncestors} walks up the
 *   `@he-tree/vue` stat chain to open ancestors of a node that emitted
 *   a `request-expand` event (e.g. when a timer is running).
 *
 * ## Usage
 *
 * ```ts
 * const { premount, handleDragEnd, ... } = useTaskView(props, treeData, ...);
 * premount();          // build the initial tree
 * onMounted(useOnMounted);
 * ```
 */

import { Ref } from 'vue';
import {
  TreeNode, TaskDoc, ProjectDoc, GetResponse, TimesheetDetailDoc,
  saveDoc, fetchData,
} from './script.ts';
import { getProjectName } from './task.ts';
import { refreshTimers } from './timerStore.ts';

/**
 * Concrete tree node used by `@he-tree/vue`'s `<Draggable>`.
 *
 * Identical to {@link TreeNode} but with a self-referencing `children`
 * type so the tree is strictly typed all the way down.
 */
export interface TreeData extends TreeNode {
  children: TreeData[];
}

/**
 * Shape of the `dragContext` object exposed by `@he-tree/vue` after a
 * drag-and-drop operation completes.
 *
 * @property dragNode.data   - The {@link TreeData} node that was dragged.
 * @property dragNode.parent - The new parent after the drop.
 */
export interface DragContext {
  dragNode: {
    data: TreeData;
    parent: {
      data: TreeData;
      open: boolean;
    };
  };
}

/**
 * Stat metadata maintained by `@he-tree/vue` for each tree node.
 *
 * The library creates one stat per node and keeps them in sync with the
 * data array.  We extend the base shape with optional drag/drop flags.
 *
 * @property open        - Whether the node is expanded in the tree.
 * @property parent      - Stat of the parent node (null for roots).
 * @property data        - Back-reference to the {@link TreeData} node.
 * @property hidden      - Whether the node is hidden (collapsed child).
 * @property disableDrag - Prevent this node from being dragged.
 * @property disableDrop - Prevent dropping onto this node.
 * @property draggable   - Alias used by he-tree drag config.
 * @property droppable   - Alias used by he-tree drop config.
 * @property dragOpen    - Auto-open this node when dragging over it.
 * @property children    - Stats of child nodes.
 */
export interface StatObject {
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

/**
 * Props interface for the `TaskView.vue` root component.
 *
 * @property docs - Initial {@link GetResponse} data passed from the Frappe
 *                  list-view's `prepare_data` hook.
 */
export interface TaskViewProps {
  docs: GetResponse;
}

/**
 * Composable that owns the tree data model and all tree-level operations.
 *
 * This is the central orchestration point.  It is called once from
 * `TaskView.vue`'s `setup()` function and returns a bag of functions
 * that the template binds to events and slots.
 *
 * @param props             - Component props (initial {@link GetResponse}).
 * @param treeData          - Reactive array bound to `<Draggable v-model>`.
 * @param highlightedProject - Currently highlighted project (visual indicator).
 * @param timesheetDetails  - Reactive Map provided to child Task components
 *                            via `provide('timesheetDetails', ...)`.
 * @param dragContext       - `@he-tree/vue` drag context singleton.
 * @param currentTheme      - `'light'` or `'dark'` for CSS variable theming.
 * @param isOpened          - Whether the sidebar panel is open.
 * @param formWrapper       - DOM ref for mounting Frappe forms in the sidebar.
 * @param showForm          - Toggle between Frappe form and TimeLogger in sidebar.
 * @param timeLoggerDoc     - Payload object passed to the TimeLogger component.
 * @param descriptionOnly   - When `true`, the TimeLogger shows only the
 *                            description field (stop-timer mode).
 */
export default function useTaskView(
  props: TaskViewProps,
  treeData: Ref<TreeData[]>,
  highlightedProject: Ref<TreeData | null>,
  timesheetDetails: Ref<Map<string, TimesheetDetailDoc>>,
  dragContext: DragContext,
  currentTheme: Ref<string>,
  isOpened: Ref<boolean>,
  formWrapper: Ref<HTMLElement | null>,
  showForm: Ref<boolean>,
  timeLoggerDoc: Ref<any>,
  descriptionOnly: Ref<boolean>
) {

  // ── Build the tree from flat backend data ────────────────

  /**
   * Assemble a nested {@link TreeData} tree from flat API response lists.
   *
   * Creates one node per project and one per task, then wires children
   * to their parents using `parent_task` (falls back to `project`).
   * No UI state is attached — components derive that via `computed`.
   *
   * @param data - Flat lists from the `get` endpoint.
   * @returns Root-level tree nodes (one per project).
   */
  const buildTree = (data: GetResponse): TreeData[] => {
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
  };

  /**
   * Rebuild the reactive `timesheetDetails` map from fresh API data.
   *
   * Keyed by task name for O(1) lookup.  Every `Task.vue` instance uses
   * `inject('timesheetDetails')` + a `computed` to derive its own timer
   * state from this shared map.
   *
   * @param data - Fresh {@link GetResponse} from the server.
   */
  const updateDetailsMap = (data: GetResponse): void => {
    const map = new Map<string, TimesheetDetailDoc>();
    for (const td of data.timesheet_details) {
      map.set(td.task, td);
    }
    timesheetDetails.value = map;
  };

  /**
   * (Re)build the entire tree from server data.
   *
   * Called on initial load (from props), after every successful
   * `save_doc` call, and on error recovery.  Updates the timesheet
   * details map, builds the tree, adds blank placeholders, and sets
   * the reactive `treeData` array.
   *
   * @param data - Fresh response, or `null` to use the initial props.
   */
  const premount = (data: GetResponse | null = null): void => {
    const source = data || props.docs;
    updateDetailsMap(source);
    let docs = buildTree(source);
    docs = addBlankProject(docs);
    docs = addBlankTasks(docs);
    treeData.value = docs;
    // Keep the global timer dock in sync after every tree rebuild.
    refreshTimers();
  };

  /**
   * Handle a backend error: log it, show a Frappe message, and attempt
   * to re-sync the tree by fetching fresh data.
   *
   * @param error - The error thrown by {@link saveDoc}.
   */
  const catchError = async (error: unknown): Promise<void> => {
    console.error('Error updating data:', error);
    frappe.msgprint(`Error updating data: ${error}`);
    try {
      const data = await fetchData();
      premount(data);
    } catch (fetchErr) {
      console.error('Error fetching fresh data:', fetchErr);
    }
  };

  /**
   * Save a doc to the backend and rebuild the tree from the response.
   *
   * Convenience wrapper around {@link saveDoc} + {@link premount} with
   * automatic error handling via {@link catchError}.
   *
   * @param doc      - Partial doc to persist.
   * @param children - Optional descendant tasks for drag reparenting.
   */
  const saveAndRebuild = async (
    doc: Partial<ProjectDoc> | Partial<TaskDoc> | Partial<TimesheetDetailDoc>,
    children?: TaskDoc[]
  ): Promise<void> => {
    try {
      const data = await saveDoc(doc, children);
      premount(data);
    } catch (error) {
      catchError(error);
    }
  };

  /**
   * Walk up the `@he-tree/vue` stat ancestor chain and force each node
   * open.  Called when a `Task.vue` instance emits `request-expand`
   * (e.g. because it has an active timer and needs to be visible).
   *
   * Also persists the open state in `locals.nodes` so it survives the
   * next tree rebuild.
   *
   * @param stat - The stat object of the node requesting expansion.
   */
  const expandAncestors = (stat: StatObject): void => {
    let current: StatObject | null | undefined = stat;
    while (current) {
      current.open = true;
      if (current.data?.doc?.name) {
        locals.nodes[current.data.doc.name] = true;
      }
      current = current.parent;
    }
  };

  /**
   * Register global event listeners, apply theme CSS variables, and
   * initialise the highlighted project.  Called from `onMounted`.
   */
  const useOnMounted = (): void => {
    setTheme();
    updateHighlightedProject();
    document.addEventListener('keydown', handleKeydown);
  };

  /**
   * Remove global event listeners.  Called from `onUnmounted`.
   */
  const useOnUnmounted = (): void => {
    document.removeEventListener('keydown', handleKeydown);
  };

  /**
   * Apply light/dark CSS custom properties based on `currentTheme`.
   */
  const setTheme = (): void => {
    document.documentElement.style.setProperty(
      '--task-hover-bg-color',
      currentTheme.value === 'dark' ? '#686868' : '#ededed'
    );
    document.documentElement.style.setProperty(
      '--icon-color',
      currentTheme.value === 'dark' ? '#d3d3d3' : '#000000'
    );
    document.documentElement.style.setProperty(
      '--sidebar-bg-color',
      currentTheme.value === 'dark' ? '#2f2f2f' : '#f9f9f9'
    );
  };

  /**
   * Handle the completion of a drag-and-drop operation.
   *
   * Updates the dragged task's `parent_task` and `project` fields based
   * on the new drop target, collects all non-blank descendants, and
   * calls {@link saveAndRebuild} to persist the reparenting and refresh
   * the tree.
   */
  const handleDragEnd = async (): Promise<void> => {
    const draggedNode = dragContext.dragNode;

    draggedNode.parent.open = true;

    const parentData = draggedNode.parent.data;
    const taskDoc = draggedNode.data.doc as TaskDoc;
    const parentIsProject = parentData.doc.doctype === 'Project';

    taskDoc.parent_task = parentIsProject ? null : parentData.doc.name;

    // Update project if moving between projects
    const draggedProject = getProjectName(draggedNode.data);
    const parentProject = getProjectName(parentData);
    if (draggedProject !== parentProject) {
      taskDoc.project = parentProject;
    }

    // Collect non-blank children for recursive project update
    const collectChildren = (node: TreeData): TaskDoc[] => {
      const result: TaskDoc[] = [];
      for (const child of node.children) {
        if (!child.doc.name) continue;
        result.push(child.doc as TaskDoc);
        result.push(...collectChildren(child));
      }
      return result;
    };

    const children = collectChildren(draggedNode.data);

    await saveAndRebuild(taskDoc, children.length > 0 ? children : undefined);
    handleTaskInteraction(draggedNode.data);
  };

  /**
   * Per-node render hook called by the `<Draggable>` slot.
   *
   * Responsible for:
   * 1. Replaying persisted expand/collapse state from `locals.nodes`.
   * 2. Handling the blank-project-name transition (project_name → name
   *    swap in `locals.nodes` after the server assigns a name).
   * 3. Setting drag/drop permission flags based on node type and timer
   *    state (projects, blanks, and timed nodes are not draggable).
   *
   * Always returns a truthy value so the `v-if` in the template
   * renders the row.
   *
   * @param node - The tree data node.
   * @param stat - The `@he-tree/vue` stat for this node.
   * @returns The `{node, stat}` pair (always truthy).
   */
  const modifyNodeAndStat = (node: TreeData, stat: StatObject): { node: TreeData; stat: StatObject } => {
    const isProject = node.doc.doctype === 'Project';
    const isBlank = !node.doc.name;
    const detail = timesheetDetails.value.get(node.doc.name);
    const hasActiveTimer = !!detail;

    // Handle blank project transition: text was stored as key before docName was known
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
      addBlankTask(node);
      updateHighlightedProject();
    }

    // Check for children with active timers (for drag/drop rules)
    let runningChildren = false;
    if (node.children?.length > 0) {
      runningChildren = node.children.some(child =>
        timesheetDetails.value.has(child.doc.name)
      );
    }

    if (isBlank || isProject || hasActiveTimer || runningChildren) {
      stat.disableDrag = true;
      stat.disableDrop = isBlank;
      stat.draggable = false;
      stat.droppable = !isBlank;
      stat.dragOpen = !isBlank;
    } else {
      stat.disableDrag = false;
      stat.disableDrop = false;
      stat.draggable = true;
      stat.droppable = true;
      stat.dragOpen = true;
    }

    return { node, stat };
  };

  /**
   * Factory for minimal tree nodes.
   *
   * Ensures `doctype`, `name`, and `status` have sensible defaults.
   * Used to create blank placeholder nodes for inline creation.
   *
   * @param doc - Partial doc fields for the new node.
   * @returns A {@link TreeData} node with an empty children array.
   */
  const createNode = (doc: Partial<ProjectDoc> | Partial<TaskDoc>): TreeData => {
    if (!doc.doctype) doc.doctype = 'Task';
    if (!doc.name) doc.name = '';
    if (!doc.status) doc.status = 'Open';
    return { doc: doc as ProjectDoc | TaskDoc, children: [] };
  };

  /**
   * Append a blank "Add project..." placeholder to the root of the tree.
   *
   * @param docs - Current root-level tree nodes.
   * @returns The same array with the blank project appended.
   */
  const addBlankProject = (docs: TreeData[]): TreeData[] => {
    const newProject = createNode({
      doctype: 'Project', name: '', project_name: 'Add project...', status: 'Open',
    } as ProjectDoc);
    docs.push(newProject);
    return docs;
  };

  /**
   * Add blank "Add task..." placeholders to all expanded, non-blank projects.
   *
   * Called once during {@link premount} to seed the initial tree.
   *
   * @param docs - Root-level tree nodes.
   * @returns The same array (mutated in place).
   */
  const addBlankTasks = (docs: TreeData[]): TreeData[] => {
    docs.forEach(project => {
      // Add blank tasks to non-blank projects that are remembered as open
      if (project.doc.name && locals.nodes?.[project.doc.name] !== false) {
        addBlankTask(project);
      }
    });
    return docs;
  };

  /**
   * Check whether the given node is the currently highlighted project.
   *
   * Used by the template to apply the `highlighted-project` CSS class.
   *
   * @param node - The tree data node to test.
   * @returns `true` if this node is the highlighted project.
   */
  const isHighlightedProject = (node: TreeData): boolean => {
    try {
      return !!(node.doc.doctype === 'Project' && node.doc.name === highlightedProject.value?.doc.name);
    } catch {
      return !!(node.doc.doctype === 'Project' && node === highlightedProject.value);
    }
  };

  /**
   * Toggle a node's expanded/collapsed state and persist it.
   *
   * When opening a node, ensures blank task placeholders are added to
   * its children.  Also updates the highlighted project when expanding
   * or collapsing project-level nodes.
   *
   * @param node - The tree node to toggle.
   * @param stat - The `@he-tree/vue` stat for the node.
   */
  const toggleNode = (node: TreeData, stat: StatObject): void => {
    if (!node.doc.name) return;

    stat.open = !stat.open;
    locals.nodes[node.doc.name] = stat.open;

    if (stat.open) {
      if (node.children.length === 0 || !node.children.some(child => !child.doc.name)) {
        addBlankTask(node);
        treeData.value = [...treeData.value];
      }
      stat.children?.forEach(child => {
        child.hidden = !stat.open;
      });
    }

    const isProject = node.doc.doctype === 'Project';
    if (!isProject) {
      const parentProject = findParentProject(node);
      if (parentProject) {
        highlightedProject.value = parentProject;
      }
    } else if (stat.open) {
      highlightedProject.value = node;
    } else {
      const nextExpandedProject = treeData.value.find(project =>
        project.doc.doctype === 'Project' && project.doc.name && locals.nodes?.[project.doc.name]
      );
      if (nextExpandedProject) {
        highlightedProject.value = nextExpandedProject;
      } else {
        updateHighlightedProject();
      }
    }
  };

  /**
   * Recursively add blank "Add task..." placeholders to a node and its
   * descendants.
   *
   * Skips completed nodes and nodes that already have a blank child.
   * Triggers a reactive `treeData` update when a new blank is added.
   *
   * @param node - The parent node to seed with a blank child.
   */
  const addBlankTask = (node: TreeData): void => {
    if (node.doc.status === 'Completed') return;
    if (!node.children) node.children = [];

    let blankNodeAdded = false;

    if (!node.children.some(child => !child.doc.name)) {
      const isProject = node.doc.doctype === 'Project';
      const projectName = getProjectName(node);
      const parentTask = isProject ? null : node.doc.name;

      const blankTask = createNode({
        doctype: 'Task',
        name: '',
        subject: 'Add task...',
        project: projectName,
        parent_task: parentTask,
        status: 'Open',
        is_group: 0,
        priority: 'Medium',
      } as TaskDoc);
      node.children = [...node.children, blankTask];
      blankNodeAdded = true;
    }

    node.children.forEach(child => {
      if (child.doc.name) {
        addBlankTask(child);
      }
    });

    if (blankNodeAdded) {
      treeData.value = [...treeData.value];
    }
  };

  /**
   * Find the root-level project node for a given tree node.
   *
   * @param node - Any tree node (project or task).
   * @returns The project node, or `undefined` if not found.
   */
  const findParentProject = (node: TreeData): TreeData | undefined => {
    const projectName = getProjectName(node);
    return treeData.value.find(project => project.doc.name === projectName);
  };

  /**
   * Recursively search the tree for a node with the given doc name.
   *
   * @param nodes         - Subtree to search.
   * @param parentDocName - The `doc.name` to find.
   * @returns The matching node, or `null` if not found.
   */
  const findParentNode = (nodes: TreeData[], parentDocName: string): TreeData | null => {
    for (const node of nodes) {
      if (node.doc.name === parentDocName) {
        return node;
      } else if (node.children?.length > 0) {
        const foundNode = findParentNode(node.children, parentDocName);
        if (foundNode) return foundNode;
      }
    }
    return null;
  };

  /**
   * Insert a blank sibling node next to the given node.
   *
   * The new blank inherits the same parent and project as the reference
   * node.  Triggers a reactive `treeData` update.
   *
   * @param node - The node whose sibling list should receive a blank.
   */
  const addSiblingTask = (node: TreeData): void => {
    addBlankTask(node);

    const isProject = node.doc.doctype === 'Project';
    const parentDocName = isProject
      ? ''
      : ((node.doc as TaskDoc).parent_task || (node.doc as TaskDoc).project);

    const projectName = getProjectName(node);
    const parentTask = isProject ? null : (node.doc as TaskDoc).parent_task;

    const newBlankNode = createNode(
      isProject
        ? { doctype: 'Project', name: '', project_name: 'Add project...', status: 'Open' } as ProjectDoc
        : {
          doctype: 'Task', name: '', subject: 'Add task...',
          project: projectName, parent_task: parentTask,
          status: 'Open', is_group: 0, priority: 'Medium',
        } as TaskDoc
    );

    const parentNode = findParentNode(treeData.value, parentDocName);

    if (parentNode) {
      parentNode.children = [...parentNode.children, newBlankNode];
      treeData.value = [...treeData.value];
    } else {
      treeData.value = [...treeData.value, newBlankNode];
    }
  };

  /**
   * Update the highlighted project after a user interaction.
   *
   * For project nodes: sets the highlight to the interacted project.
   * For task nodes: highlights the task's parent project.
   * Also opens the project and adds blank tasks.
   *
   * @param node - The node that was interacted with.
   */
  const handleTaskInteraction = (node: TreeData): void => {
    const isProject = node.doc.doctype === 'Project';
    const isBlank = !node.doc.name;

    if (isProject) {
      if (!isBlank && node.doc.status !== 'Completed') {
        highlightedProject.value = node;
      } else {
        return;
      }
    } else {
      const parentProject = findParentProject(node);
      if (parentProject) {
        highlightedProject.value = parentProject;
      }
    }

    if (highlightedProject.value && highlightedProject.value.doc.name) {
      locals.nodes[highlightedProject.value.doc.name] = true;
      addBlankTask(highlightedProject.value);
    }
  };

  /**
   * Re-derive the highlighted project from the current tree state.
   *
   * Picks the first expanded non-blank project, or falls back to the
   * blank placeholder project.  Called on mount and after collapses.
   */
  const updateHighlightedProject = (): void => {
    if (!treeData.value || !Array.isArray(treeData.value)) {
      console.warn('Tree data is not initialized or not an array');
      return;
    }

    const expandedProjects = treeData.value.filter(
      (node) => node.doc.doctype === 'Project' && node.doc.name && locals.nodes?.[node.doc.name] !== false
    );

    if (expandedProjects.length > 0) {
      highlightedProject.value = expandedProjects[0];
    } else {
      const blankProject = treeData.value.find((node) => !node.doc.name);
      if (blankProject) {
        highlightedProject.value = blankProject;
      }
    }
  };

  /**
   * Focus the blank task (or blank project) of the highlighted project.
   *
   * Sets the `_autoFocus` flag which `Task.vue` watches to trigger
   * edit mode.  Called from {@link handleKeydown} when the user starts
   * typing while no input is focused.
   */
  const editRootBlankTask = (): void => {
    const project = highlightedProject.value;
    if (project) {
      if (!project.doc.name) {
        project._autoFocus = true;
      } else {
        const blankTask = project.children.find(task => !task.doc.name);
        if (blankTask) {
          blankTask._autoFocus = true;
        }
      }
    }
  };

  /**
   * Global keydown handler: redirect typing to the blank task input
   * when no other input is focused and the sidebar is closed.
   *
   * @param event - The keyboard event.
   */
  const handleKeydown = (event: KeyboardEvent): void => {
    const allowedKeys = /^[a-zA-Z0-9!@#$%^&*()_+={}\[\]|\\:;'",.<>?/`~\- ]$/;

    if (document.activeElement?.tagName !== 'INPUT' && allowedKeys.test(event.key) && !isOpened.value) {
      editRootBlankTask();
    }
  };

  /**
   * Load a Frappe form into the sidebar's form wrapper element.
   *
   * Uses the Frappe client-side form API to render a full form for the
   * document.  The form is mounted inside the `formWrapper` ref.
   *
   * @param payload - Contains the doc to load and an `isProject` flag
   *                  to determine the doctype.
   */
  const loadForm = async (payload: { doc: ProjectDoc | TaskDoc; isProject: boolean }): Promise<void> => {
    const doctype = payload.isProject ? "Project" : "Task";
    const docName = payload.doc.name;

    try {
      if (!formWrapper.value || !document.body.contains(formWrapper.value)) {
        console.error("formWrapper is not attached to the DOM");
        return;
      }

      await (frappe as any).model.with_doctype(doctype);

      const formInstance = new (frappe as any).ui.form.Form(doctype, formWrapper.value, true, '');
      await (frappe as any).model.with_doc(doctype, docName);
      formInstance.refresh(docName);
    } catch (err) {
      console.error("Error loading form:", err);
    }
  };

  /**
   * Open the sidebar panel.
   *
   * Discriminates between two payload shapes:
   * - **Form payload** (`{ doc, isProject }`) → renders a Frappe form.
   * - **Time logger payload** (`{ doc, timesheetDetail, descriptionOnly }`) →
   *   renders the TimeLogger component for manual time entry or stop.
   *
   * @param payload - Either a form payload or a time-logger payload.
   */
  const openSidebar = (payload: any): void => {
    isOpened.value = true;

    if ('isProject' in payload && !('descriptionOnly' in payload)) {
      // Open doc form in sidebar
      showForm.value = true;
      loadForm(payload);
    } else {
      // Time logger payload: { doc, timesheetDetail, descriptionOnly }
      timeLoggerDoc.value = payload;
      showForm.value = false;
      descriptionOnly.value = payload.descriptionOnly ?? false;
    }
  };

  /**
   * Close the time logger sidebar and reset its state.
   *
   * Clears the time logger doc, switches back to form mode, and closes
   * the panel.
   */
  const closeTimeLogger = (): void => {
    timeLoggerDoc.value = null;
    showForm.value = true;
    descriptionOnly.value = false;
    isOpened.value = false;
  };

  return {
    catchError,
    premount,
    saveAndRebuild,
    expandAncestors,
    useOnMounted,
    useOnUnmounted,
    handleDragEnd,
    modifyNodeAndStat,
    createNode,
    addBlankProject,
    addBlankTasks,
    isHighlightedProject,
    toggleNode,
    addSiblingTask,
    findParentNode,
    handleTaskInteraction,
    updateHighlightedProject,
    editRootBlankTask,
    handleKeydown,
    openSidebar,
    closeTimeLogger,
  };
}