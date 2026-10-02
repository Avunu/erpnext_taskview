<template>
  <div v-if="detail" class="flex-1 overflow-y-auto">
    <div class="mx-auto flex max-w-5xl flex-col gap-8 p-5 sm:p-8">
      <section>
        <h2 class="mb-3 text-base font-semibold text-ink-gray-8">Tasks</h2>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <router-link
            v-for="column in columns"
            :key="column"
            :to="{ name: 'tasks', params: { project }, query: { view: 'board' } }"
            class="rounded-lg border border-outline-gray-2 p-4 transition hover:border-outline-gray-3"
          >
            <div class="text-2xl font-semibold tabular-nums text-ink-gray-9">
              {{ detail.project.counts[column] || 0 }}
            </div>
            <div class="mt-1 flex items-center gap-1.5 text-sm text-ink-gray-6">
              <span class="h-2 w-2 rounded-full" :class="dotClass(column)"></span>
              {{ column }}
            </div>
          </router-link>
        </div>
      </section>

      <section v-if="detail.phases.length">
        <h2 class="mb-3 text-base font-semibold text-ink-gray-8">Phases</h2>
        <PhaseBudgets :phases="detail.phases" :project="project" />
      </section>

      <section>
        <h2 class="mb-3 text-base font-semibold text-ink-gray-8">Recent activity</h2>
        <ActivityFeed :items="detail.activity" :project="project" />
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ActivityFeed from "../components/ActivityFeed.vue";
import PhaseBudgets from "../components/PhaseBudgets.vue";
import { useProject } from "../projectContext";
import { BOARD_COLUMNS, type BoardColumn, type PortalProjectDetail } from "../types";

const DOTS: Record<BoardColumn, string> = {
  Open: "bg-surface-gray-5",
  Working: "bg-surface-blue-3",
  "Pending Review": "bg-surface-amber-3",
  Completed: "bg-surface-green-3",
};

export default defineComponent({
  name: "ProjectOverview",
  components: { ActivityFeed, PhaseBudgets },
  props: {
    project: { type: String, required: true },
  },
  setup() {
    return { ctx: useProject(), columns: BOARD_COLUMNS };
  },
  computed: {
    detail(): PortalProjectDetail | null {
      return this.ctx.detail;
    },
  },
  methods: {
    dotClass(column: BoardColumn): string {
      return DOTS[column];
    },
  },
});
</script>
