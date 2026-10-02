<template>
  <div v-if="detail" class="flex min-h-0 flex-1 flex-col">
    <div
      class="flex flex-wrap items-center gap-2 border-b border-outline-gray-1 px-5 py-2.5 sm:px-8"
    >
      <TabButtons v-model="view" :buttons="viewButtons" />
      <select
        v-if="detail.phases.length"
        v-model="phase"
        class="form-select h-7 rounded border-0 bg-surface-gray-2 py-0 text-base text-ink-gray-8"
      >
        <option value="">All phases</option>
        <option v-for="p in detail.phases" :key="p.name" :value="p.name">{{ p.subject }}</option>
      </select>
      <TextInput v-model="search" type="search" placeholder="Search tasks" class="w-full sm:w-56" />
    </div>

    <TaskBoard v-if="view === 'board'" :tasks="filtered" :project="project" @open="openTask" />
    <TaskList v-else :tasks="filtered" :project="project" @open="openTask" />

    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { TabButtons, TextInput } from "frappe-ui";
import TaskBoard from "../components/TaskBoard.vue";
import TaskList from "../components/TaskList.vue";
import { useProject } from "../projectContext";
import type { PortalProjectDetail, PortalTaskCard } from "../types";

type View = "list" | "board";

/** Task list / kanban board for one project; the task drawer opens on top as a child route. */
export default defineComponent({
  name: "ProjectTasks",
  components: { TabButtons, TextInput, TaskBoard, TaskList },
  props: {
    project: { type: String, required: true },
  },
  setup() {
    return { ctx: useProject() };
  },
  data() {
    return {
      search: "",
      viewButtons: [
        { label: "List", value: "list" },
        { label: "Board", value: "board" },
      ],
    };
  },
  computed: {
    detail(): PortalProjectDetail | null {
      return this.ctx.detail;
    },
    /** List / board, kept in the URL (?view=board) so it survives reloads and links. */
    view: {
      get(): View {
        return this.$route.query.view === "board" ? "board" : "list";
      },
      set(value: View) {
        this.setQuery({ view: value === "board" ? "board" : undefined });
      },
    },
    /** Phase filter (?phase=TASK-…). */
    phase: {
      get(): string {
        return typeof this.$route.query.phase === "string" ? this.$route.query.phase : "";
      },
      set(value: string) {
        this.setQuery({ phase: value || undefined });
      },
    },
    filtered(): PortalTaskCard[] {
      const tasks = this.detail?.tasks ?? [];
      const term = this.search.trim().toLowerCase();
      return tasks.filter(
        (t) =>
          (!this.phase || t.phase === this.phase || t.name === this.phase) &&
          (!term || t.subject.toLowerCase().includes(term) || t.name.toLowerCase().includes(term)),
      );
    },
  },
  methods: {
    setQuery(patch: Record<string, string | undefined>): void {
      const query = { ...this.$route.query, ...patch };
      for (const key of Object.keys(query)) if (query[key] === undefined) delete query[key];
      this.$router.replace({ query });
    },
    openTask(task: string): void {
      this.$router.push({
        name: "task",
        params: { project: this.project, task },
        query: this.$route.query,
      });
    },
  },
});
</script>
