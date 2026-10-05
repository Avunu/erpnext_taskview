<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div
      v-if="ctx.error && !ctx.detail"
      class="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center"
    >
      <p class="text-base text-ink-gray-7">{{ ctx.error }}</p>
      <Button
        variant="subtle"
        label="Back to projects"
        @click="$router.push({ name: 'projects' })"
      />
    </div>

    <template v-else>
      <header class="border-b border-outline-gray-1 px-5 pt-4 sm:px-8">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="text-sm text-ink-gray-5">
              <router-link :to="{ name: 'projects' }" class="hover:text-ink-gray-7"
                >Projects</router-link
              >
              <span class="mx-1">/</span>
              <span>{{ project }}</span>
            </div>
            <h1 class="mt-1 truncate text-2xl-semibold text-ink-gray-9">
              {{ ctx.detail?.project.title || project }}
            </h1>
          </div>
          <div class="flex items-center gap-3">
            <Badge v-if="ctx.detail" :label="ctx.detail.project.status" />
            <Button
              v-if="ctx.detail?.can_create"
              variant="solid"
              label="New task"
              :icon-left="plusIcon"
              @click="openNewTask(null)"
            />
          </div>
        </div>

        <div v-if="ctx.detail && ctx.detail.project.budget.budget_hours > 0" class="mt-3 max-w-md">
          <BudgetMeter :budget="ctx.detail.project.budget" size="lg" />
        </div>

        <nav class="-mb-px mt-3 flex gap-5 text-base">
          <router-link
            v-for="tab in tabs"
            :key="tab.name"
            :to="{ name: tab.name, params: { project } }"
            class="border-b-2 pb-2 transition-colors"
            :class="
              isActiveTab(tab.name)
                ? 'border-outline-gray-7 font-medium text-ink-gray-9'
                : 'border-transparent text-ink-gray-5 hover:text-ink-gray-7'
            "
          >
            {{ tab.label }}
          </router-link>
        </nav>
      </header>

      <div v-if="ctx.loading && !ctx.detail" class="p-8 text-base text-ink-gray-5">Loading…</div>
      <router-view v-else-if="ctx.detail" :key="project" />
    </template>

    <NewTaskDialog
      v-if="ctx.detail"
      v-model="newTaskOpen"
      :project="project"
      :tasks="ctx.detail.tasks"
      :default-phase="newTaskPhase"
      @created="onTaskCreated"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, markRaw, reactive } from "vue";
import { Badge, Button } from "frappe-ui";
import { Plus } from "lucide-vue-next";
import BudgetMeter from "../components/BudgetMeter.vue";
import NewTaskDialog from "../components/NewTaskDialog.vue";
import { errorMessage, getProject } from "../api";
import { PROJECT_CONTEXT, type ProjectContext } from "../projectContext";
import { loadProjects } from "../store";

/** Background refresh interval while the tab is visible. */
const POLL_MS = 60_000;

export default defineComponent({
  name: "ProjectLayout",
  components: { Badge, Button, BudgetMeter, NewTaskDialog },
  provide() {
    return { [PROJECT_CONTEXT as symbol]: this.ctx };
  },
  props: {
    project: { type: String, required: true },
  },
  data() {
    const ctx: ProjectContext = reactive({
      detail: null,
      loading: false,
      error: "",
      reload: () => this.load(),
      newTask: (phase?: string | null) => this.openNewTask(phase ?? null),
    });
    return {
      ctx,
      newTaskOpen: false,
      newTaskPhase: null as string | null,
      poller: null as number | null,
      plusIcon: markRaw(Plus),
      tabs: [
        { name: "overview", label: "Overview" },
        { name: "tasks", label: "Tasks" },
      ],
    };
  },
  watch: {
    project: {
      immediate: true,
      handler() {
        this.ctx.detail = null;
        this.ctx.error = "";
        this.load();
      },
    },
  },
  mounted() {
    this.poller = window.setInterval(() => {
      if (document.visibilityState === "visible") this.load();
    }, POLL_MS);
    window.addEventListener("focus", this.load);
  },
  beforeUnmount() {
    if (this.poller !== null) window.clearInterval(this.poller);
    window.removeEventListener("focus", this.load);
  },
  methods: {
    async load(): Promise<void> {
      const project = this.project;
      this.ctx.loading = true;
      try {
        const detail = await getProject(project);
        if (project === this.project) {
          this.ctx.detail = detail;
          this.ctx.error = "";
        }
      } catch (error) {
        if (project === this.project) this.ctx.error = errorMessage(error);
      } finally {
        this.ctx.loading = false;
      }
    },
    isActiveTab(name: string): boolean {
      const route = this.$route.name as string;
      return name === "tasks" ? route === "tasks" || route === "task" : route === name;
    },
    openNewTask(phase: string | null): void {
      this.newTaskPhase = phase;
      this.newTaskOpen = true;
    },
    async onTaskCreated(task: string): Promise<void> {
      await this.load();
      loadProjects();
      this.$router.push({
        name: "task",
        params: { project: this.project, task },
        query: this.$route.query,
      });
    },
  },
});
</script>
