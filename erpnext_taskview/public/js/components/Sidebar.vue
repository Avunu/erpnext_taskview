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
				// Ensure the wrapper is attached to the DOM
				if (!document.body.contains(formWrapper.value)) {
					console.error("formWrapper is not attached to the DOM");
					return;
				}

				// Ensure doctype metadata is loaded
				await frappe.model.with_doctype(doctype);

				// Establish a page for the form
				// console.log("Initializing app page...");
				// frappe.ui.make_app_page({
				// 	parent: formWrapper.value,
				// 	single_column: true, // Use single-column layout for the sidebar form
				// });

				// // Validate wrapper page
				// const wrapperPage = formWrapper.value.page;
				// if (!wrapperPage) {
				// 	throw new Error("Page attribute not found on form wrapper.");
				// }

				// Create and load the Frappe form
				console.log("Creating form instance for doctype:", doctype);
				// formInstance = new frappe.ui.form.Form(doctype, wrapperPage);
				formInstance = new frappe.ui.form.Form(doctype, formWrapper.value, true, '');

				console.log("Form loaded successfully");
				console.log("Form instance:", formInstance);
				console.log("Form instance doc:", formInstance.doc);

				console.log("Loading form with docName (refresh):", props.doc.docName);
				formInstance.refresh(props.doc.docName);

				console.log("Form instance with docName:", formInstance);
				console.log("doc:", props.doc);
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