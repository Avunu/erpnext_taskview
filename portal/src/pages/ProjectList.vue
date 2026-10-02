<template>
  <div class="flex-1 overflow-y-auto">
    <header class="border-b border-outline-gray-1 px-5 py-4 sm:px-8">
      <h1 class="text-xl font-semibold text-ink-gray-9">Projects</h1>
    </header>

    <div class="p-5 sm:p-8">
      <div v-if="store.loading && !store.loaded" class="text-base text-ink-gray-5">Loading…</div>
      <ErrorMessage v-else-if="store.error" :message="store.error" />
      <div
        v-else-if="!store.list.length"
        class="rounded-lg border border-dashed border-outline-gray-2 p-10 text-center text-base text-ink-gray-6"
      >
        You don't have any projects yet.
      </div>

      <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <router-link
          v-for="project in store.list"
          :key="project.name"
          :to="{ name: 'overview', params: { project: project.name } }"
          class="flex flex-col gap-3 rounded-lg border border-outline-gray-2 bg-surface-white p-4 transition hover:border-outline-gray-3 hover:shadow-sm"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <div class="truncate text-base font-medium text-ink-gray-9">{{ project.title }}</div>
              <div class="mt-0.5 truncate text-sm text-ink-gray-5">
                {{ project.name }}<span v-if="project.customer"> · {{ project.customer }}</span>
              </div>
            </div>
            <Badge
              :label="project.status"
              :theme="project.status === 'Completed' ? 'green' : 'gray'"
            />
          </div>

          <BudgetMeter :budget="project.budget" size="lg" show-unbudgeted />

          <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-gray-6">
            <span v-for="column in columns" :key="column">
              <span class="font-medium tabular-nums text-ink-gray-8">{{
                project.counts[column] || 0
              }}</span>
              {{ column }}
            </span>
          </div>

          <div v-if="project.modified" class="text-xs text-ink-gray-5">
            Updated {{ fromNow(project.modified) }}
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Badge, ErrorMessage } from "frappe-ui";
import BudgetMeter from "../components/BudgetMeter.vue";
import { projectsStore } from "../store";
import { BOARD_COLUMNS } from "../types";
import { fromNow } from "../utils";

export default defineComponent({
  name: "ProjectList",
  components: { Badge, ErrorMessage, BudgetMeter },
  data() {
    return { store: projectsStore, columns: BOARD_COLUMNS };
  },
  methods: { fromNow },
});
</script>
