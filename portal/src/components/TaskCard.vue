<template>
  <article
    class="cursor-pointer rounded-5 border border-outline-gray-1 bg-surface-base p-3 shadow-sm transition hover:border-outline-gray-3"
    @click="$emit('click')"
  >
    <div v-if="task.phase_subject || task.parent_subject" class="mb-1.5 flex flex-wrap gap-1">
      <span class="truncate rounded-4 bg-surface-gray-2 px-1.5 py-0.5 text-xs text-ink-gray-6">
        {{ chip }}
      </span>
    </div>
    <p class="line-clamp-3 text-base text-ink-gray-8">{{ task.subject }}</p>

    <div class="mt-2 flex flex-wrap items-center gap-1.5">
      <Badge v-if="task.is_overdue" label="Overdue" theme="red" size="sm" />
      <Badge
        v-if="task.priority === 'High' || task.priority === 'Urgent'"
        :label="task.priority"
        theme="amber"
        size="sm"
      />
      <span
        v-if="task.exp_end_date"
        class="text-xs"
        :class="task.is_overdue ? 'text-ink-red-8' : 'text-ink-gray-5'"
      >
        Due {{ formatDate(task.exp_end_date) }}
      </span>
    </div>

    <BudgetMeter v-if="task.budget.budget_hours > 0" :budget="task.budget" class="mt-2" />

    <footer class="mt-2 flex items-center justify-between gap-2">
      <div class="flex -space-x-1.5">
        <Avatar
          v-for="name in task.assignees.slice(0, 3)"
          :key="name"
          :label="name"
          size="sm"
          :title="name"
        />
      </div>
      <div class="flex items-center gap-2.5 text-xs text-ink-gray-5">
        <span v-if="task.comment_count" class="flex items-center gap-1"
          ><MessageSquare class="h-3 w-3" />{{ task.comment_count }}</span
        >
        <span v-if="task.attachment_count" class="flex items-center gap-1"
          ><Paperclip class="h-3 w-3" />{{ task.attachment_count }}</span
        >
      </div>
    </footer>
  </article>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { Avatar, Badge } from "frappe-ui";
import { MessageSquare, Paperclip } from "lucide-vue-next";
import BudgetMeter from "./BudgetMeter.vue";
import type { PortalTaskCard } from "../types";
import { formatDate } from "../utils";

export default defineComponent({
  name: "TaskCard",
  components: { Avatar, Badge, BudgetMeter, MessageSquare, Paperclip },
  props: {
    task: { type: Object as PropType<PortalTaskCard>, required: true },
  },
  emits: ["click"],
  computed: {
    /** "Phase › Parent" when the task sits deeper than directly under its phase. */
    chip(): string {
      const { phase_subject, parent_subject } = this.task;
      if (phase_subject && parent_subject && phase_subject !== parent_subject) {
        return `${phase_subject} › ${parent_subject}`;
      }
      return phase_subject || parent_subject || "";
    },
  },
  methods: { formatDate },
});
</script>
