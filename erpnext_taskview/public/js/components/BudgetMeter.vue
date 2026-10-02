<template>
  <div class="tv-budget" :class="`tv-budget--${state}`" :title="summary">
    <div class="tv-budget__track">
      <div class="tv-budget__fill" :style="{ width: fillWidth }"></div>
    </div>
    <span class="tv-budget__label">{{ label }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  budgetFillWidth,
  budgetLabel,
  budgetState,
  budgetSummary,
  type BudgetState,
} from "../budget";

/**
 * Compact "hours logged vs. budget" meter for a TaskView row.
 *
 * `logged` is the server's figure (draft + submitted timesheets, other
 * people's open timers); `liveExtra` adds the current user's own open timers,
 * which the server leaves out so the meter can tick while a timer runs.
 */
export default defineComponent({
  name: "BudgetMeter",
  props: {
    logged: { type: Number, required: true },
    budget: { type: Number, required: true },
    liveExtra: { type: Number, required: false, default: 0 },
  },
  computed: {
    total(): number {
      return this.logged + this.liveExtra;
    },
    state(): BudgetState {
      return budgetState(this.total, this.budget);
    },
    fillWidth(): string {
      return budgetFillWidth(this.total, this.budget);
    },
    label(): string {
      return budgetLabel(this.total, this.budget);
    },
    summary(): string {
      return budgetSummary(this.total, this.budget);
    },
  },
});
</script>

<style scoped>
.tv-budget {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  margin-right: 8px;
  font-size: var(--text-tiny);
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.tv-budget__track {
  width: 56px;
  height: 6px;
  border-radius: var(--border-radius-full);
  /* The surface and ink tokens flip per theme; the numeric ramps do not. */
  background: var(--surface-gray-3, var(--gray-200));
  overflow: hidden;
}

.tv-budget__label {
  /* Fixed-width labels keep the bars in one column down the tree. */
  min-width: 76px;
  text-align: right;
}

.tv-budget__fill {
  height: 100%;
  border-radius: inherit;
  background: var(--ink-blue-3, var(--blue-500));
  transition: width 0.3s ease;
}

.tv-budget--warn .tv-budget__fill {
  background: var(--ink-amber-3, var(--yellow-500));
}

.tv-budget--over .tv-budget__fill {
  background: var(--ink-red-3, var(--red-500));
}

.tv-budget--over .tv-budget__label {
  color: var(--ink-red-3, var(--red-600));
  font-weight: var(--weight-semibold);
}
</style>
