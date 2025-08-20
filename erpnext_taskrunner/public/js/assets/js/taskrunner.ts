import { Ref } from 'vue';
import useBackendHandler, { NodeData, PremountFunction } from './script.ts';

export interface TreeData extends NodeData {
  children: TreeData[];
}

export interface DragContext {
  dragNode: {
    data: TreeData;
    parent: {
      data: TreeData;
      open: boolean;
    };
  };
}

export interface StatObject {
  open: boolean;
  hidden?: boolean;
  disableDrag?: boolean;
  disableDrop?: boolean;
  draggable?: boolean;
  droppable?: boolean;
  dragOpen?: boolean;
  children?: StatObject[];
}

export interface TaskRunnerProps {
  docs: NodeData[];
}

export default function useTaskRunner(
  props: TaskRunnerProps,
  treeData: Ref<TreeData[]>,
  highlightedProject: Ref<TreeData | null>,
  dragContext: DragContext,
  currentTheme: Ref<string>,
  isOpened: Ref<boolean>,
  formWrapper: Ref<HTMLElement | null>,
  showForm: Ref<boolean>,
  timeLoggerDoc: Ref<any>,
  descriptionOnly: Ref<boolean>
) {
  // this finalizes the tree data by adding a blank project to the end of the list and blank tasks to any expanded project branches
  const premount: PremountFunction = (newDocs: NodeData[] | null = null) => {
    // add a blank project to the end of the list
    let docs = addBlankProject(newDocs || props.docs);

    // add blank tasks to any expanded project branches
    docs = addBlankTasks(docs);
    treeData.value = docs as TreeData[];
  };

  // get the backend handler functions
  const { callBackendHandler, catchError } = useBackendHandler(premount);

  // this sets the theme to match frappe, initializes the highlighted project, and initializes the keydown event listener for editing the blank task
  const useOnMounted = (): void => {
    // set the theme to match frappe
    setTheme();

    // initialize the highlighted project
    updateHighlightedProject();

    // Listen for keypress events to start editing the blank task
    document.addEventListener('keydown', handleKeydown);
  };

  const useOnUnmounted = (): void => {
    document.removeEventListener('keydown', handleKeydown);
  };

  const setTheme = (): void => {
    // set the theme for the drag-and-drop task tree
    document.documentElement.style.setProperty(
      '--task-hover-bg-color',
      currentTheme.value === 'dark' ? '#686868' : '#ededed'
    );
    document.documentElement.style.setProperty(
      '--icon-color',
      currentTheme.value === 'dark' ? '#d3d3d3' : '#000000'
    );

    // set the theme for the sidebar
    document.documentElement.style.setProperty(
      '--sidebar-bg-color',
      currentTheme.value === 'dark' ? '#2f2f2f' : '#f9f9f9'
    );
  };

  // Function to handle the end of a drag-and-drop operation
  const handleDragEnd = async (): Promise<void> => {
    // TODO: setup transition from task to project if a task is dragged to a project. 
    // tasks aren't draggable if they or a child have a running or paused timer
    // TODO: don't allow tasks to be dragged below the blank task on each level

    // this gets the dragged node in its new position.
    const draggedNode = dragContext.dragNode;

    // since I am having trouble getting dragOpen to work on the stat object, I am going to manually expand the parent node here
    draggedNode.parent.data.expanded = true;
    draggedNode.parent.open = true;
    // TODO: assess whether I need to update locals.nodes here

    let updateObject: any = {};

    // update the parent on the node and the update object
    draggedNode.data.parent = draggedNode.parent.data.docName;
    updateObject.parent_task = draggedNode.parent.data.isProject ? null : draggedNode.parent.data.docName;

    // update the node here (like parent and project, for this node and any children nodes) THIS IS ONLY FOR MOVING A TASK TO A NEW PROJECT
    if (draggedNode.data.project !== draggedNode.parent.data.project) {
      draggedNode.data.project = draggedNode.parent.data.project;
      updateObject.project = draggedNode.data.project;
    }

    // update the children on the node
    const essentialNodeChildren = (nodeData: TreeData): any[] => {
      if (!nodeData.children || nodeData.children.length === 0 || nodeData.isBlank) {
        return [];
      }
      if (nodeData.children.length === 1 && nodeData.children[0].isBlank) {
        return [];
      }
      return nodeData.children.map(child => ({
        isBlank: child.isBlank,
        docName: child.docName,
        children: essentialNodeChildren(child) // Recursively process children
      }));
    };

    // update the parent on the node
    const essentialNodeParent = (parent: any): any => {
      return {
        isProject: parent.data.isProject,
        docName: parent.data.docName || null,
        children: parent.data.children.map((child: TreeData) => ({
          isBlank: child.isBlank
        }))
      };
    };

    // update the node with just the essentials, especially getting rid of circular references between parents and children
    const essentialNodeProperties = (node: any): any => {
      return {
        isProject: node.data.isProject,
        project: node.data.project,
        docName: node.data.docName,
        parent: essentialNodeParent(node.parent),
        children: essentialNodeChildren(node.data)
      };
    };

    const essentialNode = essentialNodeProperties(draggedNode);

    try {
      const r = await callBackendHandler('update_parent', essentialNode, updateObject);
      // update the tree data with the new docs
      premount(r.message);
      // trigger the task interaction
      handleTaskInteraction(draggedNode.data);
    } catch (error) {
      catchError(error);
    }
  };

  const modifyNodeAndStat = (node: TreeData, stat: StatObject): { node: TreeData; stat: StatObject } => {
    // this is a workaround for when the blank project node gets turned into a project node. There's no docname to use as a key in locals.nodes, so we need to use the text instead, and then switch it to the docname when we get the new docname from the backend
    let splitText = '';
    let pleaseExpandMe = false;
    
    // if node.text starts with PROJ-
    if (node.text?.startsWith('PROJ-')) {
      const splitArray = node.text.split(':', 2);
      splitText = splitArray[1].trim();
    }
    
    if (splitText !== '' && splitText in locals.nodes) { // Check if the key exists
      const value = locals.nodes[splitText]; // Retrieve the value
      stat.open = value; // Update stat.open
      node.expanded = value; // Update node.expanded
      if (node.docName) {
        locals.nodes[node.docName] = value; // Add new key-value pair
      }
      delete locals.nodes[splitText]; // Remove old key
      pleaseExpandMe = value;
    }

    if (locals.nodes?.[node.docName || ''] === false || !node.expanded) {
      stat.open = false;
      node.expanded = false;
    }
    
    if (locals.nodes?.[node.docName || ''] === true || node.expanded || pleaseExpandMe) {
      stat.open = true;
      node.expanded = true;
      // make sure there are blank tasks under this expanded project
      addBlankTask(node);
      updateHighlightedProject();
    }
    
    let runningChildren = false;
    // check if this node has any children with a timer running or paused
    if (node.children && node.children.length > 0) {
      runningChildren = node.children.some(child => child.timerStatus === 'running' || child.timerStatus === 'paused');
    }

    // dragOpen is also not working...
    // Disable drag and drop for blank tasks and projects, and for tasks with running or paused timers, or if any children have running or paused timers
    if (node.isBlank || node.isProject || node.timerStatus === 'running' || node.timerStatus === 'paused' || runningChildren) {
      stat.disableDrag = true;
      stat.disableDrop = node.isBlank;
      stat.draggable = false;
      stat.droppable = !node.isBlank;
      stat.dragOpen = !node.isBlank;
    } else {
      stat.disableDrag = false;
      stat.disableDrop = false;
      stat.draggable = true;
      stat.droppable = true;
      stat.dragOpen = true;
    }
    
    return { node, stat };
  };

  // Helper function to create a new node
  const createNode = (options: {
    text: string;
    children?: TreeData[];
    isBlank?: boolean;
    isProject?: boolean;
    project?: string | null;
    docName?: string;
    autoFocus?: boolean;
    expanded?: boolean;
    parent?: string | null;
    timerStatus?: string | null;
    status?: string;
  }): TreeData => {
    const {
      text,
      children = [],
      isBlank = false,
      isProject = false,
      project = null,
      docName = '',
      autoFocus = false,
      expanded = true,
      parent = null,
      timerStatus = null,
      status = 'Open'
    } = options;

    return {
      text,
      children,
      isBlank,
      isProject,
      project,
      docName,
      autoFocus,
      expanded,
      parent,
      timerStatus,
      status
    };
  };

  const addBlankProject = (docs: NodeData[]): NodeData[] => {
    // add a blank project to the end of the list
    const newProject = createNode({ 
      text: 'Add project...', 
      isBlank: true, 
      isProject: true, 
      expanded: false 
    });
    docs.push(newProject);
    return docs;
  };

  // if any of the projects are expanded due to running or paused timers, go ahead and add the blank tasks to the project and tasks now, since otherwise blank tasks are only being added when the project is expanded
  const addBlankTasks = (docs: NodeData[]): NodeData[] => {
    // add blank tasks to any expanded project branches
    docs.forEach(project => {
      if (project.expanded && !project.isBlank) {
        addBlankTask(project as TreeData);
      }
    });
    return docs;
  };

  // Function to determine if a node is the highlighted project
  const isHighlightedProject = (node: TreeData): boolean => {
    // try to compare the docName fields of the node and the highlighted project
    try {
      return !!(node.isProject && node.docName === highlightedProject.value?.docName);
    } catch (error) {
      return !!(node.isProject && node === highlightedProject.value);
    }
  };

  const toggleNode = (node: TreeData, stat: StatObject): void => {
    if (node.isBlank) {
      return;
    }
    
    stat.open = !stat.open;
    if (node.docName) {
      locals.nodes[node.docName] = stat.open;
    }
    node.expanded = stat.open;

    // open the children if the node is being opened
    if (stat.open) {
      // look in the children. if there is not a blank task, add one
      if (node.children.length === 0 || !node.children.some(child => child.isBlank)) {
        addBlankTask(node);
        // Trigger reactivity update for treeData
        treeData.value = [...treeData.value];
      }
      // change the hidden property of all open children
      stat.children?.forEach(child => {
        child.hidden = !stat.open;
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

  const addBlankTask = (node: TreeData): void => {
    if (node.status === 'Completed') {
      return;
    }
    
    let blankNodeAdded = false;
    // Add a blank task to the current node's children
    // If the node doesn't have children, create an empty array, otherwise .some() will throw an error
    if (!node.children) {
      node.children = [];
    }
    
    // check first to make sure there isn't already a blank task
    if (!node.children.some(child => child.isBlank)) {
      const blankTask = createNode({ 
        text: 'Add task...', 
        isBlank: true, 
        project: node.project || '', 
        parent: node.docName || '', 
        timerStatus: 'stopped', 
        expanded: false 
      });
      node.children = [...node.children, blankTask];
      blankNodeAdded = true;
    }

    // Recursively add a blank task to each child node's children
    node.children.forEach(child => {
      if (!child.isBlank) {
        addBlankTask(child);
      }
    });

    if (blankNodeAdded) {
      treeData.value = [...treeData.value];
    }
  };

  const findParentProject = (node: TreeData): TreeData | undefined => {
    return treeData.value.find(project => project.docName === node.project);
  };

  // we need to add the new node as a sibling to the node. If the node is a project, add it to the root level
  const findParentNode = (nodes: TreeData[], parentDocName: string): TreeData | null => {
    for (const node of nodes) {
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

  // This adds a new blank task to the tree when a blank task is edited into a new task or project
  // IF THE NEW NODE IS A PROJECT, WE NEED TO ADD A BLANK TASK TO THE NEW PROJECT AS WELL? NO. Blank projects don't have children.
  const addSiblingTask = (node: TreeData): void => {
    // we do need to add a blank task to the node children.
    addBlankTask(node);
    // and we should expand the node if it's a project
    node.expanded = node.isProject ? true : false;

    // Create a new task object
    const newBlankNode = createNode({ 
      text: node.isProject ? 'Add project...' : 'Add task...', 
      isBlank: true, 
      project: node.project || '', 
      isProject: node.isProject, 
      parent: node.parent, 
      timerStatus: 'stopped' 
    });

    const parentNode = findParentNode(treeData.value, node.parent || '');

    if (parentNode) {
      const updatedChildren = [...parentNode.children, newBlankNode];
      parentNode.children = updatedChildren;
      treeData.value = [...treeData.value];
    } else {
      // Add the new node to the root level
      treeData.value = [...treeData.value, newBlankNode];
    }
  };

  // Function to highlight projects based on task interactions
  const handleTaskInteraction = (node: TreeData): void => {
    if (node.isProject) {
      if (node.expanded && !node.isBlank && node.status !== 'Completed') {
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
    
    // make sure the highlighted project is expanded and the interacted task is expanded
    if (highlightedProject.value && !highlightedProject.value.isBlank) {
      // make sure there are blank tasks under this expanded project
      if (highlightedProject.value.docName !== "") {
        locals.nodes[highlightedProject.value.docName || ''] = true;
        addBlankTask(highlightedProject.value);
      }
    }
  };

  // Function to update the highlighted project
  const updateHighlightedProject = (): void => {
    if (!treeData.value || !Array.isArray(treeData.value)) {
      console.warn('Tree data is not initialized or not an array');
      return;
    }
    
    const expandedProjects = treeData.value.filter(
      (node) => node.isProject && node.expanded && !node.isBlank
    );
    
    if (expandedProjects.length > 0) {
      highlightedProject.value = expandedProjects[0];
    } else {
      const blankProject = treeData.value.find((node) => node.isBlank);
      if (blankProject) {
        highlightedProject.value = blankProject;
      }
    }
  };

  // Function to find and edit the root-level blank task under the highlighted project
  // if all projects are collapsed, or if there are no open projects, edit the blank project
  const editRootBlankTask = (): void => {
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

  const handleKeydown = (event: KeyboardEvent): void => {
    // check if the key pressed is a character key (a-z, A-Z, 0-9, special characters) and no input is focused
    const allowedKeys = /^[a-zA-Z0-9!@#$%^&*()_+={}\[\]|\\:;'",.<>?/`~\- ]$/;
    
    if (document.activeElement?.tagName !== 'INPUT' && allowedKeys.test(event.key) && !isOpened.value) {
      // If no input is focused, start editing the root blank task
      editRootBlankTask();
    }
  };

  const loadForm = async (doc: TreeData): Promise<void> => {
    let formInstance: any = null; // Store the form instance
    const doctype = doc.isProject ? "Project" : "Task";
    const docName = doc.docName;

    try {
      // Ensure the wrapper is attached to the DOM
      if (!formWrapper.value || !document.body.contains(formWrapper.value)) {
        console.error("formWrapper is not attached to the DOM");
        return;
      }

      // Ensure doctype metadata is loaded
      await (frappe as any).model.with_doctype(doctype);

      // Create and load the Frappe form
      formInstance = new (frappe as any).ui.form.Form(doctype, formWrapper.value, true, '');

      // Load the form with the docName
      await (frappe as any).model.with_doc(doctype, docName);
      formInstance.refresh(docName);
    } catch (err) {
      console.error("Error loading form:", err);
    }
  };

  const openSidebar = (doc: any): void => {
    isOpened.value = true;
    // this is just using the presence of the isProject field to determine if a node sidebar is being opened for the form, or if we want time logging content
    if ('isProject' in doc) {
      showForm.value = true;
      loadForm(doc);
    } else {
      timeLoggerDoc.value = doc;
      showForm.value = false;
      // description only determines if we need to set start and stop times, or just a description
      if (doc.status && doc.status === 'stopped') {
        descriptionOnly.value = true;
      } else {
        descriptionOnly.value = false;
      }
    }
  };

  const closeTimeLogger = (): void => {
    timeLoggerDoc.value = null;
    showForm.value = true;
    descriptionOnly.value = false;
    isOpened.value = false;
  };

  return {
    catchError,
    premount,
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