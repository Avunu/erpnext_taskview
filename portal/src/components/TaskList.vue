<template>
  <div class="flex-1 overflow-y-auto">
    <div v-if="!rows.length" class="p-8 text-center text-base text-ink-gray-5">No tasks match.</div>
    <div v-else class="divide-y divide-outline-gray-1">
      <button
        v-for="{ task, depth } in rows"
        :key="task.name"
        type="button"
        class="flex w-full items-center gap-3 px-5 py-2.5 text-left transition hover:bg-surface-gray-1 sm:px-8"
        :class="task.is_group ? 'bg-surface-gray-1' : ''"
        :style="{ paddingLeft: `calc(${depth * 1.25}rem + 1.25rem)` }"
        @click="$emit('open', task.name)"
      >
        <component
          :is="task.is_group ? folderIcon : task.status === 'Completed' ? doneIcon : todoIcon"
          class="h-4 w-4 shrink-0"
          :class="task.status === 'Completed' ? 'text-ink-green-6' : 'text-ink-gray-5'"
        />
        <span
          class="min-w-0 flex-1 truncate text-base"
          :class="[
            task.is_group ? 'font-medium text-ink-gray-9' : 'text-ink-gray-8',
            task.status === 'Completed' && !task.is_group ? 'text-ink-gray-5 line-through' : '',
          ]"
        >
          {{ task.subject }}
        </span>
        <span class="hidden items-center gap-3 text-sm text-ink-gray-5 md:flex">
          <span v-if="task.comment_count" class="flex items-center gap-1" title="Comments">
            <MessageSquare class="h-3.5 w-3.5" />{{ task.comment_count }}
          </span>
          <span v-if="task.attachment_count" class="flex items-center gap-1" title="Attachments">
            <Paperclip class="h-3.5 w-3.5" />{{ task.attachment_count }}
          </span>
          <span v-if="task.exp_end_date" :class="task.is_overdue ? 'text-ink-red-8' : ''">
            {{ formatDate(task.exp_end_date) }}
          </span>
        </span>
        <BudgetMeter :budget="task.budget" class="hidden sm:flex" />
        <Badge
          v-if="!task.is_group"
          :label="task.is_overdue ? 'Overdue' : task.status"
          :theme="statusTheme(task.is_overdue ? 'Overdue' : task.status)"
        />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, markRaw, type PropType } from "vue";
import { Badge } from "frappe-ui";
import { Circle, CircleCheck, FolderOpen, MessageSquare, Paperclip } from "lucide-vue-next";
import BudgetMeter from "./BudgetMeter.vue";
import type { PortalTaskCard } from "../types";
import { flattenTree, formatDate, statusTheme, type TreeRow } from "../utils";

/** Tasks as an indented tree: phases (group tasks) with their tasks beneath. */
export default defineComponent({
  name: "TaskList",
  components: { Badge, BudgetMeter, MessageSquare, Paperclip },
  props: {
    tasks: { type: Array as PropType<PortalTaskCard[]>, required: true },
    project: { type: String, required: true },
  },
  emits: ["open"],
  data() {
    return {
      folderIcon: markRaw(FolderOpen),
      doneIcon: markRaw(CircleCheck),
      todoIcon: markRaw(Circle),
    };
  },
  computed: {
    rows(): TreeRow[] {
      return flattenTree(this.tasks);
    },
  },
  methods: { formatDate, statusTheme },
});
</script>
