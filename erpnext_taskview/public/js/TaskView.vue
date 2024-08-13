<template>
    <!-- loop through data being passed in -->
     <!-- for each data point, show the subject, status, project, and id -->
    <div class="task-view">
        <div class="task-view-header">
            <div class="task-view-header-item">Subject</div>
            <div class="task-view-header-item">Status</div>
            <div class="task-view-header-item">Project</div>
            <div class="task-view-header-item">ID</div>
        </div>
        <div class="task-view-body">
            <div class="task-view-item" v-for="task in tasks" :key="task.id">
                <div class="task-view-item-subject">{{ task.subject }}</div>
                <div class="task-view-item-status">{{ task.status }}</div>
                <div class="task-view-item-project">{{ task.project }}</div>
                <div class="task-view-item-id">{{ task.id }}</div>
            </div>
        </div>
    </div>

</template>