<template>
  <div class="divide-y divide-outline-gray-1 rounded-lg border border-outline-gray-2">
    <router-link
      v-for="phase in phases"
      :key="phase.name"
      :to="{ name: 'tasks', params: { project }, query: { phase: phase.name } }"
      class="flex flex-col gap-2 p-4 transition hover:bg-surface-gray-1 sm:flex-row sm:items-center sm:gap-6"
    >
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <span class="truncate text-base font-medium text-ink-gray-8">{{ phase.subject }}</span>
          <Badge v-if="phase.status === 'Completed'" label="Completed" theme="green" />
        </div>
        <div class="mt-0.5 text-sm text-ink-gray-5">
          {{ phase.completed_count }} of {{ phase.task_count }} tasks done
        </div>
      </div>
      <div class="sm:w-72">
        <BudgetMeter :budget="phase.budget" size="lg" show-unbudgeted />
      </div>
    </router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { Badge } from "frappe-ui";
import BudgetMeter from "./BudgetMeter.vue";
import type { PortalPhase } from "../types";

/** Budget per phase (root-level group task) — how capped, phased projects are tracked. */
export default defineComponent({
  name: "PhaseBudgets",
  components: { Badge, BudgetMeter },
  props: {
    phases: { type: Array as PropType<PortalPhase[]>, required: true },
    project: { type: String, required: true },
  },
});
</script>
