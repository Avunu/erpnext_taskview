<template>
	<VueSidePanel v-model="isOpened" lock-scroll width="100%">
		<div style="padding-top: 20px; color: #f14668">
			<h3>Task Timer Controls</h3>

			<!-- Render each node with its children if it has a timerStatus other than 'stopped' -->
			<div v-for="(node, index) in filterData(data)" :key="index">
				<SidebarNode :node="node" :pauseTimer="pauseTimer" :resumeTimer="resumeTimer" :stopTimer="stopTimer" />
			</div>
		</div>
	</VueSidePanel>
</template>

<script>
import { defineComponent, ref } from "vue";
import SidebarNode from './SidebarNode.vue'; // Import SidebarNode component

export default defineComponent({
	components: {
		SidebarNode,
	},
	props: {
		data: {
			type: Array,
			required: true
		}
	},
	setup() {
		const isOpened = ref(false);

		// Function to recursively filter nodes and children based on timerStatus
		const filterData = (nodes) => {

			let filteredNodes = [];
			nodes.forEach(node => {
				if (node.timerStatus !== 'stopped' && node.timerStatus !== undefined && node.timerStatus !== null) {
					filteredNodes.push(node);
				}
				if (node.children) {
					filteredNodes = filteredNodes.concat(filterData(node.children));
				}
			});

			console.log('Filtered nodes:', filteredNodes);

			return filteredNodes;
		};

		// Pause the timer for a specific node
		const pauseTimer = (node) => {
			node.timerStatus = 'paused';
			console.log(`Paused timer for ${node.text}`);
		};

		// Resume the timer for a specific node
		const resumeTimer = (node) => {
			node.timerStatus = 'running';
			console.log(`Resumed timer for ${node.text}`);
		};

		// Stop the timer for a specific node
		const stopTimer = (node) => {
			node.timerStatus = 'stopped';
			console.log(`Stopped timer for ${node.text}`);
		};

		return {
			isOpened,
			filterData,
			pauseTimer,
			resumeTimer,
			stopTimer
		};
	}
});
</script>

<style scoped>
/* Add any styles for the sidebar here */
</style>