<template>
  <div class="flex min-h-0 flex-1 gap-3 overflow-x-auto p-4 sm:px-8">
    <section
      v-for="column in columns"
      :key="column"
      class="flex w-72 shrink-0 flex-col rounded-lg bg-surface-gray-1"
    >
      <header class="flex items-center justify-between px-3 py-2.5">
        <span class="flex items-center gap-2 text-sm font-medium text-ink-gray-7">
          <span class="h-2 w-2 rounded-full" :class="dots[column]"></span>
          {{ column }}
        </span>
        <span class="text-sm tabular-nums text-ink-gray-5">{{ lists[column].length }}</span>
      </header>
      <VueDraggable
        v-model="lists[column]"
        group="portal-tasks"
        :sort="false"
        :animation="150"
        ghost-class="opacity-40"
        class="flex min-h-[4rem] flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2"
        @add="(event: DraggableEvent) => onMove(column, event)"
      >
        <TaskCard
          v-for="task in lists[column]"
          :key="task.name"
          :task="task"
          @click="$emit('open', task.name)"
        />
      </VueDraggable>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { toast } from "frappe-ui";
import { VueDraggable, type DraggableEvent } from "vue-draggable-plus";
import TaskCard from "./TaskCard.vue";
import { errorMessage, setTaskStatus } from "../api";
import { useProject } from "../projectContext";
import { BOARD_COLUMNS, type BoardColumn, type PortalTaskCard } from "../types";
import { flattenTree } from "../utils";

type Lists = Record<BoardColumn, PortalTaskCard[]>;

/**
 * Kanban of the project's tasks (phases themselves are not cards).  Dropping a
 * card in another column sets that status; the board refreshes from the server
 * either way, so a refused move (e.g. unfinished dependencies) snaps back.
 */
export default defineComponent({
  name: "TaskBoard",
  components: { VueDraggable, TaskCard },
  props: {
    tasks: { type: Array as PropType<PortalTaskCard[]>, required: true },
    project: { type: String, required: true },
  },
  emits: ["open"],
  setup() {
    return { ctx: useProject() };
  },
  data() {
    return {
      columns: BOARD_COLUMNS,
      lists: Object.fromEntries(BOARD_COLUMNS.map((c) => [c, []])) as unknown as Lists,
      dots: {
        Open: "bg-surface-gray-5",
        Working: "bg-surface-blue-3",
        "Pending Review": "bg-surface-amber-3",
        Completed: "bg-surface-green-3",
      } as Record<BoardColumn, string>,
    };
  },
  watch: {
    tasks: {
      immediate: true,
      handler(tasks: PortalTaskCard[]) {
        const lists = Object.fromEntries(
          BOARD_COLUMNS.map((c) => [c, [] as PortalTaskCard[]]),
        ) as unknown as Lists;
        // Phase by phase, as in the list, rather than the flat sibling order.
        for (const { task } of flattenTree(tasks))
          if (!task.is_group) lists[task.column].push(task);
        this.lists = lists;
      },
    },
  },
  methods: {
    async onMove(column: BoardColumn, event: DraggableEvent<PortalTaskCard>): Promise<void> {
      const task = event.data;
      if (!task || task.column === column) return;
      try {
        await setTaskStatus(task.name, column);
        toast.success(`Moved to ${column}`);
      } catch (error) {
        toast.error(errorMessage(error));
      } finally {
        await this.ctx.reload();
      }
    },
  },
});
</script>
