<template>
  <div v-if="budget.budget_hours > 0" class="flex items-center gap-2" :title="summary">
    <div
      class="overflow-hidden rounded-full bg-surface-gray-3"
      :class="size === 'lg' ? 'h-2 flex-1' : 'h-1.5 w-16 shrink-0'"
    >
      <div class="h-full rounded-full transition-all" :class="fillClass" :style="{ width }"></div>
    </div>
    <span
      class="whitespace-nowrap tabular-nums"
      :class="[
        size === 'lg' ? 'text-sm' : 'text-xs',
        state === 'over' ? 'font-medium text-ink-red-4' : 'text-ink-gray-6',
      ]"
    >
      {{ label }}
    </span>
  </div>
  <span
    v-else-if="showUnbudgeted && budget.logged_hours > 0"
    class="text-xs tabular-nums text-ink-gray-5"
  >
    {{ label }}
  </span>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import {
  budgetFillWidth,
  budgetLabel,
  budgetState,
  budgetSummary,
  type BudgetState,
} from "@desk/budget";
import type { Budget } from "../types";

const FILL: Record<BudgetState, string> = {
  none: "bg-surface-gray-5",
  ok: "bg-surface-blue-3",
  warn: "bg-surface-amber-3",
  over: "bg-surface-red-5",
};

/** Hours logged vs. budget — same maths and thresholds as the desk TaskView meter. */
export default defineComponent({
  name: "BudgetMeter",
  props: {
    budget: { type: Object as PropType<Budget>, required: true },
    size: { type: String as PropType<"sm" | "lg">, default: "sm" },
    /** Show "12 h" for work with time logged but no budget. */
    showUnbudgeted: { type: Boolean, default: false },
  },
  computed: {
    state(): BudgetState {
      return budgetState(this.budget.logged_hours, this.budget.budget_hours);
    },
    width(): string {
      return budgetFillWidth(this.budget.logged_hours, this.budget.budget_hours);
    },
    label(): string {
      return budgetLabel(this.budget.logged_hours, this.budget.budget_hours);
    },
    summary(): string {
      return budgetSummary(this.budget.logged_hours, this.budget.budget_hours);
    },
    fillClass(): string {
      return FILL[this.state];
    },
  },
});
</script>
