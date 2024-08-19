<template>
    <div class="tree-container">
        <Draggable class="mtl-tree" v-model="treeData" treeLine>
            <template #default="{ node, stat }">
                <OpenIcon
                    v-if="stat.children.length"
                    :open="stat.open"
                    class="mtl-mr"
                    @click.native="stat.open = !stat.open"
                />
                <span class="mtl-ml">
                    {{ node.text }}
                </span>
            </template>
        </Draggable>
    </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { Draggable, OpenIcon } from '@he-tree/vue';
import '@he-tree/vue/style/default.css';
import '@he-tree/vue/style/material-design.css';

export default defineComponent({
    name: 'TaskView',
    components: {
        Draggable,
        OpenIcon
    },
    props: {
        docs: {
            type: Array,
            required: true,
            default: () => []
        }
    },
    setup(props) {
        const treeData = ref(formatTreeData(props.docs));

        function formatTreeData(docs) {
            return docs.map(doc => ({
                text: doc.name,  // Only use the name of each doc
                children: []     // No children for now
            }));
        }

        console.log('TreeData:', treeData)

        return {
            treeData
        };
    }
});
</script>
