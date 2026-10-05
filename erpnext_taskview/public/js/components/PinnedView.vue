<template>
  <div class="pinned-view">
    <Draggable
      v-model="items"
      :draggable="true"
      :nodeKey="nodeKey"
      :maxLevel="1"
      :eachDraggable="isRealRow"
      @after-drop="handleReorder"
    >
      <template #default="{ node }">
        <!-- Quick entry: type a title, Enter to add it here and keep typing.
             keydown.stop keeps the tree's own keyboard navigation (which
             claims Enter, Space and the arrows) away from the input. -->
        <div v-if="node._entry" class="pinned-entry">
          <Plus :size="16" class="pinned-entry-icon" />
          <input
            v-model="entryText"
            class="pinned-entry-input"
            placeholder="Add a pinned task..."
            @keydown.stop="onEntryKeydown"
            @paste="onEntryPaste"
          />
        </div>
        <div v-else-if="node._pending" class="pinned-pending">
          <span class="pinned-pending-spinner"></span>
          <span class="pinned-pending-subject">{{ node.doc.subject }}</span>
        </div>
        <Task
          v-else
          :node="node"
          :pinned="true"
          :recentProjects="recentProjects"
          @task-interaction="moveEntryBelow(node)"
          @catch-success="$emit('catch-success', $event)"
          @catch-error="$emit('catch-error', $event)"
          @open-sidebar="$emit('open-sidebar', $event)"
        />
      </template>
    </Draggable>
    <div v-if="pinnedTasks.length === 0 && pending.length === 0" class="pinned-empty">
      No pinned tasks. Type to add one, or click the <Pin :size="14" /> icon on any task to pin it.
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, type PropType } from "vue";
import { Draggable } from "@he-tree/vue";
import "@he-tree/vue/style/default.css";
import { type TaskDoc, type TreeNode, createPinnedTask, reorderPinnedTasks } from "../types";
import Task from "./Task.vue";
import { Pin, Plus } from "lucide-vue-next";

/** Row key of the quick-entry input. */
const ENTRY_KEY = "__entry__";

/** A quick-entry task waiting for the server. */
interface PendingTask {
  key: string;
  subject: string;
}

/** Placeholder doc for the entry and pending rows, which aren't real tasks yet. */
function stubTask(subject: string): TaskDoc {
  return {
    doctype: "Task",
    name: "",
    subject,
    project: "",
    parent_task: null,
    status: "Open",
    is_group: 0,
    priority: "Medium",
    assigned_to: [],
    todo_name: null,
    pin_idx: null,
  };
}

/**
 * The current user's pinned tasks as a flat, drag-sortable list, with a
 * quick-entry row for adding new ones.
 *
 * ## Quick entry
 *
 * The entry row sits at the end of the list, or directly below the last row
 * that was clicked (`entryAfter`, a ToDo name).  Enter creates a task with no
 * project yet, pinned at the entry row's position, and the entry row moves
 * below it, so a burst of entries keeps its typed order.  The input keeps
 * focus throughout.
 *
 * Saves run one at a time (`queue`): each one reads `entryAfter` only when
 * it is sent, after the previous save has moved it.  Until a save returns,
 * its title shows as a pending row just above the entry row.
 *
 * Rows are keyed by ToDo name (`nodeKey`), not by index, so inserting rows
 * never hands the entry row's input over to another row.
 */
export default defineComponent({
  name: "PinnedView",
  components: { Draggable, Task, Pin, Plus },

  props: {
    pinnedTasks: {
      type: Array as PropType<TaskDoc[]>,
      default: () => [],
    },
  },

  emits: ["catch-success", "catch-error", "open-sidebar"],

  data() {
    return {
      items: [] as TreeNode[],
      entryText: "",
      /** ToDo name of the row the entry row follows; `null` for the end of the list. */
      entryAfter: null as string | null,
      pending: [] as PendingTask[],
      pendingSeq: 0,
      /** Serialises quick-entry saves so they land in the order they were typed. */
      queue: Promise.resolve() as Promise<void>,
    };
  },

  computed: {
    /** Pinned rows with the pending rows and the entry row spliced in at `entryAfter`. */
    layout(): TreeNode[] {
      const rows: TreeNode[] = this.pinnedTasks.map((t) => ({
        doc: t,
        children: [],
        _key: t.todo_name ?? t.name,
      }));
      const pending: TreeNode[] = this.pending.map((p) => ({
        doc: stubTask(p.subject),
        children: [],
        _key: p.key,
        _pending: true,
      }));
      const entry: TreeNode = { doc: stubTask(""), children: [], _key: ENTRY_KEY, _entry: true };
      // An anchor that is gone (unpinned, completed) puts the entry row at the end.
      const at = this.entryAfter ? rows.findIndex((r) => r._key === this.entryAfter) + 1 : 0;
      const cut = at > 0 ? at : rows.length;
      return [...rows.slice(0, cut), ...pending, entry, ...rows.slice(cut)];
    },

    /** Projects of the pinned tasks, in list order: the picker offers these first. */
    recentProjects(): string[] {
      return [...new Set(this.pinnedTasks.map((t) => t.project).filter(Boolean))];
    },
  },

  watch: {
    layout: {
      immediate: true,
      handler(layout: TreeNode[]) {
        const hadFocus = document.activeElement?.classList.contains("pinned-entry-input");
        this.items = layout;
        // Belt and braces: keyed rows keep the input mounted, but if the tree
        // ever re-creates it, put the caret back.
        if (hadFocus) nextTick(() => this.focusEntry());
      },
    },
  },

  methods: {
    nodeKey(stat: { data: TreeNode }, index: number): string {
      // The drag placeholder's data is an empty object.
      return stat.data._key ?? `__index_${index}`;
    },

    isRealRow(stat: { data: TreeNode }): boolean {
      return !!(stat.data.doc as TaskDoc | undefined)?.todo_name;
    },

    /** Focus the quick-entry input.  Called by TaskView's start-typing shortcut. */
    focusEntry(): void {
      const input = (this.$el as HTMLElement).querySelector<HTMLInputElement>(
        ".pinned-entry-input",
      );
      if (input && document.activeElement !== input) input.focus();
    },

    /** A plain click on a row moves the entry row directly below it. */
    moveEntryBelow(node: TreeNode): void {
      const todo = (node.doc as TaskDoc).todo_name;
      if (todo) this.entryAfter = todo;
    },

    onEntryKeydown(event: KeyboardEvent): void {
      if (event.key === "Enter") {
        event.preventDefault();
        const subject = this.entryText.trim();
        this.entryText = "";
        if (subject) this.enqueue([subject]);
      } else if (event.key === "Escape") {
        this.entryText = "";
        (event.target as HTMLInputElement).blur();
      }
    },

    /** Pasting several lines adds one task per line, in order. */
    onEntryPaste(event: ClipboardEvent): void {
      const pasted = event.clipboardData?.getData("text") ?? "";
      if (!/[\r\n]/.test(pasted)) return;
      event.preventDefault();
      const input = event.target as HTMLInputElement;
      const value =
        input.value.slice(0, input.selectionStart ?? input.value.length) +
        pasted +
        input.value.slice(input.selectionEnd ?? input.value.length);
      this.entryText = "";
      this.enqueue(
        value
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter(Boolean),
      );
    },

    enqueue(subjects: string[]): void {
      for (const subject of subjects) {
        const key = `pending:${++this.pendingSeq}`;
        this.pending = [...this.pending, { key, subject }];
        this.queue = this.queue.then(() => this.createTask(key, subject));
      }
    },

    async createTask(key: string, subject: string): Promise<void> {
      try {
        const data = await createPinnedTask(subject, this.entryAfter);
        this.entryAfter = data.todo_name;
        this.pending = this.pending.filter((p) => p.key !== key);
        this.$emit("catch-success", data);
      } catch (error) {
        this.pending = this.pending.filter((p) => p.key !== key);
        // Hand the title back so it isn't lost, unless the user is typing another.
        if (!this.entryText) this.entryText = subject;
        this.$emit("catch-error", error);
      }
    },

    async handleReorder(): Promise<void> {
      const order = this.items
        .map((item) => (item.doc as TaskDoc).todo_name)
        .filter(Boolean) as string[];
      try {
        const data = await reorderPinnedTasks(order);
        this.$emit("catch-success", data);
      } catch (error) {
        this.$emit("catch-error", error);
      }
    },
  },
});
</script>

<style scoped>
.pinned-view {
  padding: 8px 0;
}

.pinned-empty {
  text-align: center;
  padding: 32px 16px;
  color: var(--text-muted);
  font-size: var(--text-md);
}

/* Line the text up with the task subjects: skip the drag handle's 16px, and
   centre the icon in the 20px checkbox column (see Task.vue). */
.pinned-entry,
.pinned-pending {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 0;
  min-height: 28px;
  padding-left: 16px;
}

.pinned-entry-icon {
  flex-shrink: 0;
  margin: 0 2px;
  color: var(--text-light);
}

.pinned-entry-input {
  flex-grow: 1;
  min-width: 0;
  padding: 2px 0;
  border: none;
  border-bottom: 1px dashed var(--border-color);
  outline: none;
  background: transparent;
  color: var(--text-color);
  font-size: var(--text-md);
}

.pinned-entry-input:focus {
  border-bottom-color: var(--primary);
}

.pinned-pending {
  color: var(--text-muted);
}

.pinned-pending-subject {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pinned-pending-spinner {
  flex-shrink: 0;
  box-sizing: border-box;
  width: 16px;
  height: 16px;
  margin: 0 2px;
  border: 2px solid var(--border-color);
  border-top-color: var(--text-muted);
  border-radius: var(--border-radius-full);
  animation: pinned-spin 0.8s linear infinite;
}

@keyframes pinned-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
