<template>
  <div class="fixed inset-0 z-20 bg-black/20" @click="close"></div>
  <aside
    class="fixed inset-y-0 right-0 z-30 flex w-full max-w-2xl flex-col border-l border-outline-gray-2 bg-surface-white shadow-xl"
    role="dialog"
    aria-modal="true"
  >
    <header class="flex items-start gap-3 border-b border-outline-gray-1 px-5 py-4">
      <div class="min-w-0 flex-1">
        <div class="truncate text-sm text-ink-gray-5">
          <template v-for="a in data?.ancestors ?? []" :key="a.name">
            <router-link
              :to="{ name: 'task', params: { project, task: a.name }, query: $route.query }"
              class="hover:text-ink-gray-7"
            >
              {{ a.subject }}
            </router-link>
            <span class="mx-1">›</span>
          </template>
          <span>{{ task }}</span>
        </div>
        <h2 class="mt-1 text-lg font-semibold text-ink-gray-9">
          {{ data?.task.subject || "Loading…" }}
        </h2>
      </div>
      <Button variant="ghost" :icon="closeIcon" aria-label="Close" @click="close" />
    </header>

    <div v-if="error" class="p-5"><ErrorMessage :message="error" /></div>

    <div v-else-if="data" class="flex-1 overflow-y-auto">
      <div class="flex flex-col gap-6 px-5 py-4">
        <!-- Status, dates, people -->
        <div class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          <div>
            <div class="mb-1 text-xs text-ink-gray-5">Status</div>
            <select
              v-if="!data.task.is_group"
              :value="data.task.status"
              :disabled="savingStatus"
              class="form-select h-7 w-full rounded border-0 bg-surface-gray-2 py-0 text-base text-ink-gray-8"
              @change="changeStatus(($event.target as HTMLSelectElement).value)"
            >
              <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
            </select>
            <Badge v-else :label="data.task.status" :theme="statusTheme(data.task.status)" />
          </div>
          <div>
            <div class="mb-1 text-xs text-ink-gray-5">Priority</div>
            <div class="text-base text-ink-gray-8">{{ data.task.priority || "—" }}</div>
          </div>
          <div v-if="data.task.exp_end_date">
            <div class="mb-1 text-xs text-ink-gray-5">Due</div>
            <div
              class="text-base"
              :class="data.task.is_overdue ? 'text-ink-red-4' : 'text-ink-gray-8'"
            >
              {{ formatDate(data.task.exp_end_date) }}
            </div>
          </div>
          <div v-if="data.task.assignees.length" class="col-span-2 sm:col-span-3">
            <div class="mb-1 text-xs text-ink-gray-5">Assigned to</div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="name in data.task.assignees"
                :key="name"
                class="flex items-center gap-1.5 text-base text-ink-gray-8"
              >
                <Avatar :label="name" size="sm" />{{ name }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="data.task.budget.budget_hours > 0">
          <div class="mb-1 text-xs text-ink-gray-5">Time budget</div>
          <BudgetMeter :budget="data.task.budget" size="lg" />
        </div>

        <section>
          <h3 class="mb-2 text-sm font-semibold text-ink-gray-8">Description</h3>
          <div
            v-if="data.description"
            class="prose prose-sm max-w-none text-ink-gray-8"
            v-html="data.description"
          ></div>
          <p v-else class="text-base text-ink-gray-5">No description.</p>
        </section>

        <TaskAttachments :task="task" :attachments="data.attachments" @changed="refresh" />
        <TaskTimeLog
          :logs="data.time_logs"
          :total="data.total_hours"
          :not-billed="data.not_billed_hours"
          :task="task"
        />
        <TaskComments :task="task" :comments="data.comments" @added="onCommentAdded" />
      </div>
    </div>

    <div v-else class="p-5 text-base text-ink-gray-5">Loading…</div>
  </aside>
</template>

<script lang="ts">
import { defineComponent, markRaw } from "vue";
import { Avatar, Badge, Button, ErrorMessage, toast } from "frappe-ui";
import { X } from "lucide-vue-next";
import BudgetMeter from "./BudgetMeter.vue";
import TaskAttachments from "./TaskAttachments.vue";
import TaskComments from "./TaskComments.vue";
import TaskTimeLog from "./TaskTimeLog.vue";
import { errorMessage, getTask, setTaskStatus } from "../api";
import { useProject } from "../projectContext";
import { BOARD_COLUMNS, type PortalComment, type PortalTaskDetail } from "../types";
import { formatDate, statusTheme } from "../utils";

/** Task detail panel, opened over the list / board as the `task` child route. */
export default defineComponent({
  name: "TaskDrawer",
  components: {
    Avatar,
    Badge,
    Button,
    ErrorMessage,
    BudgetMeter,
    TaskAttachments,
    TaskComments,
    TaskTimeLog,
  },
  props: {
    project: { type: String, required: true },
    task: { type: String, required: true },
  },
  setup() {
    return { ctx: useProject() };
  },
  data() {
    return {
      data: null as PortalTaskDetail | null,
      error: "",
      savingStatus: false,
      closeIcon: markRaw(X),
    };
  },
  computed: {
    /** The board columns, plus the current status when it is outside them (e.g. Overdue). */
    statusOptions(): string[] {
      const current = this.data?.task.status;
      const options: string[] = [...BOARD_COLUMNS];
      return current && !options.includes(current) ? [current, ...options] : options;
    },
  },
  watch: {
    task: {
      immediate: true,
      handler() {
        this.data = null;
        this.error = "";
        this.refresh();
      },
    },
  },
  mounted() {
    document.addEventListener("keydown", this.onKeydown);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.onKeydown);
  },
  methods: {
    formatDate,
    statusTheme,
    async refresh(): Promise<void> {
      const task = this.task;
      try {
        const data = await getTask(task);
        if (task === this.task) this.data = data;
      } catch (error) {
        if (task === this.task) this.error = errorMessage(error);
      }
    },
    async changeStatus(status: string): Promise<void> {
      if (!this.data || status === this.data.task.status) return;
      this.savingStatus = true;
      try {
        await setTaskStatus(this.task, status);
        toast.success(`Moved to ${status}`);
      } catch (error) {
        toast.error(errorMessage(error));
      } finally {
        this.savingStatus = false;
        await Promise.all([this.refresh(), this.ctx.reload()]);
      }
    },
    onCommentAdded(comment: PortalComment): void {
      this.data?.comments.push(comment);
      this.ctx.reload();
    },
    onKeydown(event: KeyboardEvent): void {
      if (event.key === "Escape" && !document.querySelector("[role=dialog][data-state=open]"))
        this.close();
    },
    close(): void {
      this.$router.push({
        name: "tasks",
        params: { project: this.project },
        query: this.$route.query,
      });
    },
  },
});
</script>
