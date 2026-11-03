<template>
	<div class="taskview-mode-buttons btn-group btn-group-sm">
		<!-- One variant class per button: with both btn-default and btn-primary on
		     the active one, which wins depends on the theme's stylesheet order (a
		     theme that defines btn-default after btn-primary showed no highlight). -->
		<button
			v-for="mode in modes"
			:key="mode.key"
			type="button"
			class="btn btn-sm"
			:class="activeMode === mode.key ? 'btn-primary' : 'btn-default'"
			:aria-pressed="activeMode === mode.key"
			@click="select(mode.key)"
		>
			<component :is="mode.icon" :size="14" />
			{{ mode.label }}
		</button>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ListTree, User, Pin } from "lucide-vue-next";

export type ViewMode = "all" | "my_tasks" | "pinned";

const modes = [
	{ key: "all" as ViewMode, label: "All Tasks", icon: ListTree },
	{ key: "my_tasks" as ViewMode, label: "My Tasks", icon: User },
	{ key: "pinned" as ViewMode, label: "Pinned", icon: Pin },
] as const;

export default defineComponent({
	name: "ViewModeSwitcher",
	components: { ListTree, User, Pin },

	emits: ["update:mode"],

	data() {
		return {
			modes,
			activeMode: "all" as ViewMode,
		};
	},

	methods: {
		select(mode: ViewMode): void {
			this.activeMode = mode;
			this.$emit("update:mode", mode);
		},
		/** Called externally to sync state (e.g. from the parent list view). */
		setMode(mode: ViewMode): void {
			this.activeMode = mode;
		},
	},
});
</script>
