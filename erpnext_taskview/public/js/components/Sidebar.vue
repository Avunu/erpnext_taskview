<template>
	<div>
		<VueSidePanel v-model="isOpened" lock-scroll hide-close-btn width="65%">
			<div class="sidebar">
				<div class="sidebar-header">
					<!-- Custom close button -->
					<button class="close-btn" @click="emitClose">X</button>
				</div>
				<div style="padding-top: 20px; color: #f14668">
					<h3>Sidebar Content</h3>
					<!-- Form will be inserted here -->
					<div ref="formWrapper"></div>
				</div>
			</div>
		</VueSidePanel>
	</div>
</template>

<script>
import { defineComponent, ref, watch } from "vue";
import { VueSidePanel } from "vue3-side-panel";
import "vue3-side-panel/dist/vue3-side-panel.css";

export default defineComponent({
	name: "Sidebar",
	emits: ["close"], // Declare the 'close' event
	components: {
		VueSidePanel,
	},
	props: {
		isOpened: {
			type: Boolean,
			required: true,
		},
		doc: {
			type: Object,
			required: true,
		},
	},
	setup(props, { emit }) {
		const emitClose = () => {
			emit("close");
		};

		const formWrapper = ref(null); // Reference for the form wrapper
		let formInstance = null; // Store the form instance

		const loadForm = async () => {
			if (!props.isOpened || !formWrapper.value) return;

			const doctype = props.doc.isProject ? "Project" : "Task";

			try {
				// Ensure doctype metadata is loaded
				await frappe.model.with_doctype(doctype);

				// Create and load the Frappe form
				formInstance = new frappe.ui.form.Form(doctype, formWrapper.value);
				formInstance.refresh(); // Refresh to load the form with the data

				console.log("Form loaded successfully");
				console.log("Form instance:", formInstance);

			} catch (err) {
				console.error("Error loading form:", err);
			}
		};

		watch(
			() => props.isOpened,
			(newVal) => {
				if (newVal) {
					loadForm(); // Load the form when the sidebar is opened
				}
			}
		);

		return {
			emitClose,
			formWrapper,
		};
	},
});
</script>

<style scoped>
@import "../assets/style/sidebar.css";
</style>