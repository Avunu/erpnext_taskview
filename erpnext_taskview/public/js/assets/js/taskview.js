import callBackendHandler from './script.js';

export default function useTaskview (props, treeData, highlightedProject, dragContext, currentTheme) {

    const premount = (new_docs = null) => {
        // add a blank project to the end of the list
		let docs = addBlankProject(new_docs || props.docs);
		// add blank tasks to any expanded project branches
		docs = addBlankTasks(docs);
		treeData.value = docs;
    }

    const useOnMounted = () => {
			
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
    };

    const useOnUnmounted = () => {
        document.removeEventListener('keydown', handleKeydown);
    };

    // Function to handle the end of a drag-and-drop operation
    const handleDragEnd = async () => {

        // TODO: setup transition from task to project if a task is dragged to a project. 

        // tasks aren't draggable if they or a child have a running or paused timer

        // TODO: don't allow tasks to be dragged below the blank task on each level

        // this gets the dragged node in its new position.
        const draggedNode = dragContext.dragNode

        // since I am having trouble getting dragOpen to work on the stat object, I am going to manually expand the parent node here
        draggedNode.parent.data.expanded = true;
        draggedNode.parent.open = true;
        // TODO: assess whether I need to update locals.nodes here

        let updateObject = {};

        // update the parent on the node and the update object
        draggedNode.data.parent = draggedNode.parent.data.docName;
        updateObject.parent_task = draggedNode.parent.data.isProject ? null : draggedNode.parent.data.docName;

        // update the node here (like parent and project, for this node and any children nodes) THIS IS ONLY FOR MOVING A TASK TO A NEW PROJECT
        if (draggedNode.data.project !== draggedNode.parent.data.project) {
            draggedNode.data.project = draggedNode.parent.data.project;
            updateObject.project = draggedNode.data.project;
        }    
        
        // update the children on the node
        const essentialNodeChildren = (nodeData) => {
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
        const essentialNodeParent = (parent) => {
            return {
                isProject: parent.data.isProject,
                docName: parent.data.docName || null,
                children: parent.data.children.map(child => ({
                    isBlank: child.isBlank
                }))
            };
        };

        // update the node with just the essentials, especially getting rid of circular references between parents and children
        const essentialNodeProperties = (node) => {
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
            premount(new_docs = r.message);
            
            // trigger the task interaction
            handleTaskInteraction(draggedNode.data);
        } catch (error) {
            // TODO: THIS ERROR HANDLING NEEDS TO REFRESH THE TREE DATA AS WELL.
            console.error('Error updating parent:', error);
            frappe.msgprint('Error updating parent');
        }
    };

    const modifyNodeAndStat = (node, stat) => {
        if (locals.nodes?.[node.docName] === false || !node.expanded) {
            stat.open = false;
            node.expanded = false;
        };

        var runningChildren = false;
        // check if this node has any children with a timer running or paused
        if (node.children && node.children.length > 0) {
            runningChildren = node.children.some(child => child.timerStatus === 'running' || child.timerStatus === 'paused');
        }

        // dragOpen is also not working...
        // Disable drag and drop for blank tasks and projects, and for tasks with running or paused timers, or if any children have running or paused timers
        if (node.isBlank || node.isProject || node.timerStatus === 'running' || node.timerStatus === 'paused' || runningChildren) {
            stat.disableDrag = true;
            stat.disableDrop = node.isBlank
            stat.draggable = false;
            stat.droppable = !node.isBlank;
            stat.dragOpen = !node.isBlank;
        }
        else {
            stat.disableDrag = false;
            stat.disableDrop = false;
            stat.draggable = true;
            stat.droppable = true;
            stat.dragOpen = true;
        }
        // I thought this would keep a placeholder for the task's previous location while being dragged, but I can't see that it does anything...
        // stat.keepPlaceholder = true;
        return { node, stat };
    };

    // Helper function to create a new node
    const createNode = ({ text, children = [], isBlank = false, isProject = false, project = null, docName = '', autoFocus = false, expanded = true, parent = null, timerStatus = null, status = 'Open' }) => {
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
    }

    const addBlankProject = (docs) => {
        // add a blank project to the end of the list
        newProject = createNode({ text: 'Add project...', isBlank: true, isProject: true, expanded: false });
        docs.push(newProject);

        
        return docs
    }
    
    // if any of the projects are expanded due to running or paused timers, go ahead and add the blank tasks to the project and tasks now, since otherwise blank tasks are only being added when the project is expanded
    const addBlankTasks = (docs) => {
        // add blank tasks to any expanded project branches
        docs.forEach(project => {
            if (project.expanded && !project.isBlank) {
                addBlankTask(project);
            }
        });
        return docs;
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
            // look in the children. if there is not a blank task, add one
            if (node.children.length === 0 || !node.children.some(child => child.isBlank)) {
                addBlankTask(node);
                // Trigger reactivity update for treeData
                treeData.value = [...treeData.value];
            }
            // change the hidden property of all open children
            stat.children.forEach(child => {
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

    const addBlankTask = (node) => {
        // Add a blank task to the current node's children
        let blankTask = createNode({ text: 'Add task...', isBlank: true, project: node.project, parent: node.docName, timerStatus: 'stopped' });
        node.children = [...node.children, blankTask];

        // Recursively add a blank task to each child node's children
        node.children.forEach(child => {
            if (!child.isBlank) {
            addBlankTask(child);
            }
        });
    }

    const findParentProject = (node) => {
        return treeData.value.find(project => project.docName === node.project);
    }

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

    // This adds a new blank task to the tree when a blank task is edited into a new task or project
    // IF THE NEW NODE IS A PROJECT, WE NEED TO ADD A BLANK TASK TO THE NEW PROJECT AS WELL? NO. Blank projects don't have children.
    const addSiblingTask = (node) => {

        // we do need to add a blank task to the node children.
        addBlankTask(node);
        // and we should expand the node if it's a project
        node.expanded = node.isProject ? true : false;

        console.log('Adding sibling task to:', node);
        // Create a new task object
        const newBlankNode = createNode({ text: node.isProject ? 'Add project...' : 'Add task...', isBlank: true, project: node.project, isProject: node.isProject, parent: node.parent, timerStatus: 'stopped' });

        console.log('New node:', newBlankNode);

        const parentNode = findParentNode(treeData.value, node.parent);

        console.log('Parent node:', parentNode);

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
    const handleTaskInteraction = (node) => {
        if (node.isProject) {
            if (node.expanded && !node.isBlank && node.status !== 'Completed') {
                highlightedProject.value = node;
            } 
            else {
                return
            }
            highlightedProject.value = node;
        } else {
            const parentProject = findParentProject(node);
            if (parentProject) {
                highlightedProject.value = parentProject;
            }
        }
        // make sure the highlighted project is expanded and the interacted task is expanded
        if (!highlightedProject.value.isBlank) {
            highlightedProject.value.expanded = true;
        }
    };

    // Function to update the highlighted project
    const updateHighlightedProject = () => {
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
        // check if the key pressed is a character key (a-z, A-Z, 0-9, special characters) and no input is focused
        const allowedKeys = /^[a-zA-Z0-9!@#$%^&*()_+={}\[\]|\\:;'",.<>?/`~\- ]$/;
        if (document.activeElement.tagName !== 'INPUT' && allowedKeys.test(event.key)) {
            // If no input is focused, start editing the root blank task
            editRootBlankTask();
        }
    };

    return {
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
    }
}