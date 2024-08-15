<template>
    <div>
        <!-- Header -->
        <TaskViewHeader />

        <!-- Rows -->
        <div v-for="doc in docs" :key="doc._idx">
            <TaskViewRow :doc="doc" />
        </div>
    </div>
</template>

<script>
import TaskViewHeader from './components/TaskViewHeader.vue';
import TaskViewRow from './components/TaskViewRow.vue';

export default {
    name: 'TaskView',
    components: {
        TaskViewHeader,
        TaskViewRow
    },
    props: {
        docs: {
            type: Array,
            required: true, 
            default: []
        }
    }
}
</script>
