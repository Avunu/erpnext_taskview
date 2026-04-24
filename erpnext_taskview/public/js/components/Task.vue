<template>
  <div class="task" @click="emitInteraction">
    <div class="task">
      <!-- Drag handle in pinned mode -->
      <span v-if="pinned" class="pinned-drag-handle">
        <GripVertical :size="16" />
      </span>

      <!-- Spiced-up Checkbox -->
      <div v-if="!isBlank" class="custom-checkbox task-control">
        <label>
          <input
            type="checkbox"
            :checked="node.doc.status === 'Completed'"
            @change="toggleComplete"
          />
          <span class="checkmark"></span>
        </label>
      </div>

      <!-- Task Subject -->
      <div class="task-subject-container">
        <p
          v-if="!isEditing"
          class="task-subject"
          @click.stop="handleSubjectClick"
          @dblclick.stop="editTask"
        >
          {{ displayText }}
          <span v-if="customerName" class="task-customer">{{ customerName }}</span>
        </p>
        <input
          v-if="isEditing"
          type="text"
          v-model="editedText"
          @blur="handleBlur"
          @keyup.enter="unfocusInput"
          @keydown.stop
          @keydown.esc="cancelEdit"
          class="task-subject-edit"
        />
        <!-- Breadcrumb metadata shown in pinned view -->
        <span v-if="pinned && pinnedMeta" class="task-pinned-meta">{{ pinnedMeta }}</span>
      </div>

      <!-- action buttons for non-blank, non-completed tasks -->
      <div v-if="!isProject && !isBlank && node.doc.status !== 'Completed'" class="task-controls">
        <AssignTo
          :assignedTo="taskAssignedTo"
          :taskName="node.doc.name"
          :isPinned="taskIsPinned"
          @assign="handleAssign"
          @unassign="handleUnassign"
          @pin="handlePin"
          @unpin="handleUnpin"
        />
        <button
          class="task-btn"
          :class="timerStatus === 'running' ? 'task-btn--pause' : 'task-btn--resume'"
          @click="toggleTimer"
          :title="
            timerStatus === 'stopped' ? 'Start' : timerStatus === 'paused' ? 'Resume' : 'Pause'
          "
        >
          <Pause v-if="timerStatus === 'running'" :size="14" />
          <Play v-else :size="14" />
        </button>
        <button
          class="task-btn task-btn--stop"
          v-if="timerStatus !== 'stopped'"
          @click="logOrStopTimer"
          title="Stop"
        >
          <Square :size="14" />
        </button>
        <button class="task-btn task-btn--expand" @click="emitSidebar" title="Open sidebar">
          <PanelRightOpen :size="14" />
        </button>
        <button
          class="task-btn task-btn--quick-entry"
          @click="quickEntry"
          title="Quick add subtasks"
        >
          <ClipboardList :size="14" />
        </button>
        <button class="task-btn task-btn--delete" @click="deleteTask" title="Delete task">
          <Trash2 :size="14" />
        </button>
      </div>
      <!-- expand sidebar for projects (no timer/delete controls) -->
      <div v-else-if="!isBlank" class="task-controls">
        <button
          class="task-btn task-btn--quick-entry"
          @click="quickEntry"
          title="Quick add subtasks"
        >
          <ClipboardList :size="14" />
        </button>
        <button class="task-btn task-btn--expand" @click="emitSidebar" title="Open sidebar">
          <PanelRightOpen :size="14" />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, type PropType } from "vue";
import {
  saveDoc,
  bulkCreateTasks,
  deleteTask as apiDeleteTask,
  assignTask,
  unassignTask,
  pinTask,
  unpinTask,
  type TreeNode,
  type ProjectDoc,
  type TaskDoc,
  type TimesheetDetailDoc,
  getDisplayText,
  getProjectName,
} from "../types";
import { timersByTask, getRunningTimer, type ActiveTimer } from "../timerStore";
import { treeNodes } from "../treeState";
import { showStopTimerDialog, calcElapsedHrs } from "../timerDialog";
import AssignTo from "./AssignTo.vue";
import {
  GripVertical,
  Play,
  Pause,
  Square,
  PanelRightOpen,
  ClipboardList,
  Trash2,
} from "lucide-vue-next";
import "../task-controls.css";

/**
 * Task / Project tree row component.
 *
 * Renders a single row in the `@he-tree/vue` `<Draggable>` tree.  Each
 * instance receives a {@link TreeNode} prop and **derives all UI state**
 * through `computed` properties — no pre-computed UI objects are passed in.
 *
 * ## Derived state (computed)
 *
 * | Property            | Source                                              |
 * |---------------------|-----------------------------------------------------|
 * | `isProject`         | `doc.doctype === 'Project'`                         |
 * | `isBlank`           | `!doc.name` (placeholder for inline creation)       |
 * | `timesheetDetail`   | Looked up from the global `timersByTask` store    |
 * | `timerStatus`       | Derived from `timesheetDetail.paused`               |
 * | `displayText`       | `getDisplayText(node)` helper                       |
 * | `activeTimerDetail` | `getRunningTimer()` from the global timer store     |
 *
 * ## Events emitted
 *
 * | Event              | Payload              | When                                   |
 * |--------------------|----------------------|----------------------------------------|
 * | `task-interaction`  | —                    | Any click on the row                   |
 * | `add-sibling-task`  | —                    | (Reserved) sibling creation request    |
 * | `catch-error`       | `unknown`            | Backend call failed                    |
 * | `catch-success`     | `GetResponse`        | Backend call succeeded                 |
 * | `open-sidebar`      | `{doc, ...}`         | Open form or time-logger in sidebar    |
 * | `request-expand`    | —                    | Timer is active; parent should expand  |
 *
 * ## Global state
 *
 * - `timersByTask` — `ComputedRef<Map<string, ActiveTimer>>` from the
 *   global `timerStore` singleton.  Keyed by task name.
 * - `getRunningTimer()` — returns the currently running timer, if any.
 */
export default defineComponent({
  name: "Task",
  components: {
    AssignTo,
    GripVertical,
    Play,
    Pause,
    Square,
    PanelRightOpen,
    ClipboardList,
    Trash2,
  },
  props: {
    /** The tree node containing the doc (ProjectDoc or TaskDoc). */
    node: {
      type: Object as PropType<TreeNode>,
      required: true,
      default: () => ({}),
    },
    /** DOM element for mounting side timers (reserved for future use). */
    sideTimersElement: {
      type: Object as PropType<HTMLElement | null>,
      required: false,
      default: null,
    },
    /** Whether the sidebar panel is currently open. */
    isOpened: {
      type: Boolean,
      required: false,
      default: false,
    },
    /** Whether this task is rendered inside PinnedView (flat list mode). */
    pinned: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  emits: [
    "task-interaction",
    "add-sibling-task",
    "catch-error",
    "catch-success",
    "open-sidebar",
    "request-expand",
    "quick-entry",
    "blank-saved",
  ],

  setup() {
    return {};
  },

  data(): {
    /** Whether the inline subject/title editor is active. */
    isEditing: boolean;
    /** Current text in the inline editor. */
    editedText: string;
    /** Flag to distinguish blur-from-Escape vs blur-from-click-away. */
    cancelTriggered: boolean;
  } {
    return {
      isEditing: false,
      editedText: "",
      cancelTriggered: false,
    };
  },

  computed: {
    /** True if this node represents a Project (vs a Task). */
    isProject(): boolean {
      return this.node.doc.doctype === "Project";
    },
    /** True if this is a blank placeholder node for inline creation. */
    isBlank(): boolean {
      return !this.node.doc.name;
    },
    /**
     * The open timer for this task, or `null`.
     *
     * Looked up from the global `timersByTask` store by task name.
     * Projects and blanks always return `null`.
     */
    timesheetDetail(): ActiveTimer | null {
      if (this.isProject || this.isBlank) return null;
      return timersByTask.value.get(this.node.doc.name) ?? null;
    },
    /**
     * Derived timer status based on the presence and state of the
     * timesheet detail.
     *
     * - `'stopped'` — no open detail exists.
     * - `'paused'`  — detail exists with `paused === 1`.
     * - `'running'` — detail exists with `paused === 0`.
     */
    timerStatus(): "stopped" | "running" | "paused" {
      if (!this.timesheetDetail) return "stopped";
      return this.timesheetDetail.paused ? "paused" : "running";
    },
    /** Human-readable display text for the tree row label. */
    displayText(): string {
      return getDisplayText(this.node);
    },
    /** Customer name from the project, shown on project rows. */
    customerName(): string {
      if (this.isProject) {
        return (this.node.doc as ProjectDoc).customer || "";
      }
      return "";
    },
    /** List of assigned user emails for this task. */
    taskAssignedTo(): string[] {
      if (this.isProject || this.isBlank) return [];
      return (this.node.doc as TaskDoc).assigned_to || [];
    },
    /** Whether the current user has pinned this task. */
    taskIsPinned(): boolean {
      if (this.isProject || this.isBlank) return false;
      return !!(this.node.doc as TaskDoc).todo_name;
    },
    /** Breadcrumb text for pinned view: "Customer · Project Name / Parent Task Subject" */
    pinnedMeta(): string {
      if (this.isProject || this.isBlank) return "";
      const doc = this.node.doc as TaskDoc;
      const parts: string[] = [];
      const projectLabel = [doc.customer, doc.project_name || doc.project]
        .filter(Boolean)
        .join(" · ");
      if (projectLabel) parts.push(projectLabel);
      if (doc.parent_task_subject || doc.parent_task)
        parts.push(doc.parent_task_subject || doc.parent_task!);
      return parts.join(" / ");
    },
    /**
     * The currently-running (non-paused) timer detail across all tasks.
     *
     * Used when starting a new timer to auto-pause the previously
     * active one.  Returns `null` if no timer is running.
     */
    activeTimerDetail(): ActiveTimer | null {
      return getRunningTimer();
    },
  },

  methods: {
    /** Emit `task-interaction` to notify the tree of a user click. */
    emitInteraction(): void {
      this.$emit("task-interaction");
    },

    /**
     * Toggle the task's status between Open and Completed.
     *
     * Persists the change via {@link saveDoc} and emits `catch-success`
     * so the tree rebuilds with updated data.
     */
    async toggleComplete(): Promise<void> {
      const newStatus = this.node.doc.status === "Open" ? "Completed" : "Open";
      this.node.doc.status = newStatus;
      if (this.node.doc.name) {
        treeNodes.value[this.node.doc.name] = true;
      }
      try {
        const data = await saveDoc({ ...this.node.doc, status: newStatus });
        this.$emit("catch-success", data);
      } catch (error) {
        this.$emit("catch-error", error);
      }
      this.emitInteraction();
    },

    /**
     * Send a partial Timesheet Detail to the backend for timer operations.
     *
     * Emits `catch-success` with the fresh {@link GetResponse} on success,
     * or `catch-error` on failure.
     *
     * @param detail - Partial fields; must include either `name` (for
     *                 existing entries) or `project`+`task` (for new ones).
     */
    async sendTimerDoc(detail: Partial<TimesheetDetailDoc>): Promise<void> {
      try {
        const data = await saveDoc({
          doctype: "Timesheet Detail",
          ...detail,
        } as TimesheetDetailDoc);
        this.$emit("catch-success", data);
      } catch (error) {
        this.$emit("catch-error", error);
      }
    },

    /**
     * Start or resume a timer for this task.
     *
     * If another timer is currently running (non-paused), pauses it
     * first.  Then either resumes this task's existing paused timer
     * or starts a brand-new one.
     */
    async startTimer(): Promise<void> {
      // Pause any other running (non-paused) timer first
      const active = this.activeTimerDetail;
      if (active && active.task !== this.node.doc.name && active.name) {
        await this.sendTimerDoc({ name: active.name, paused: 1 });
      }

      if (this.timesheetDetail?.name) {
        // Resume existing paused timer
        await this.sendTimerDoc({ name: this.timesheetDetail.name, paused: 0 });
      } else {
        // Start a brand new timer
        await this.sendTimerDoc({
          project: getProjectName(this.node),
          task: this.node.doc.name,
        });
      }
    },

    /** Pause the running timer for this task. */
    async pauseTimer(): Promise<void> {
      if (this.timesheetDetail?.name) {
        await this.sendTimerDoc({ name: this.timesheetDetail.name, paused: 1 });
      }
    },

    /**
     * Pause immediately then open the shared "Log Timer" dialog.
     * If cancelled, the timer is resumed.
     */
    async stopTimer(): Promise<void> {
      const timer = this.timesheetDetail;
      if (!timer) return;

      if (!timer.paused) {
        try {
          await this.sendTimerDoc({ name: timer.name, paused: 1 });
        } catch (err) {
          this.$emit("catch-error", err);
          return;
        }
      }

      const timerName = timer.name;
      const currentDesc = timer.description || "";

      showStopTimerDialog({
        elapsedHrs: calcElapsedHrs(timer.paused_time_in_seconds, timer.paused, timer.start_time),
        currentDesc,
        taskName: timer.task,
        taskSubject: timer.task_subject || timer.task,
        projectName: timer.project_name || timer.project,
        customer: timer.customer,
        onSubmit: async (values) => {
          const data = await saveDoc({
            doctype: "Timesheet Detail",
            name: timerName,
            task: values.task,
            to_time: new Date().toISOString(),
            hours: values.hrs,
            billing_hours: values.is_billable ? values.billing_hrs || values.hrs : 0,
            description: values.description || currentDesc,
            activity_type: values.activity_type || "",
            is_billable: values.is_billable ? 1 : 0,
            completed: values.completed ? 1 : 0,
          });
          this.$emit("catch-success", data);
          return { alert: data.alert, notice: data.notice };
        },
        onCancel: async () => {
          try {
            const data = await saveDoc({
              doctype: "Timesheet Detail",
              name: timerName,
              paused: 0,
            });
            this.$emit("catch-success", data);
          } catch (err) {
            this.$emit("catch-error", err);
          }
        },
      });
    },

    /**
     * Toggle between start/resume and pause.
     *
     * Bound to the primary timer button in the template.
     */
    async toggleTimer(): Promise<void> {
      if (this.timerStatus === "stopped" || this.timerStatus === "paused") {
        await this.startTimer();
      } else {
        await this.pauseTimer();
      }
    },

    /**
     * Either open a manual-log dialog (stopped) or stop the running timer.
     *
     * Bound to the secondary Log/Stop button in the template.
     */
    logOrStopTimer(): void {
      if (this.timerStatus === "stopped") {
        this.logManualTime();
      } else {
        this.stopTimer();
      }
    },

    /**
     * Show a dialog to manually log time for this task (no active timer).
     */
    logManualTime(): void {
      const project = getProjectName(this.node);
      const task = this.node.doc.name;

      const d = new frappe.ui.Dialog({
        title: "Log Time",
        fields: [
          {
            label: "Activity Type",
            fieldname: "activity_type",
            fieldtype: "Link",
            options: "Activity Type",
          },
          { label: "Hrs", fieldname: "hrs", fieldtype: "Float", reqd: 1 },
          { label: "Description", fieldname: "description", fieldtype: "Small Text" },
          { label: "Is Billable", fieldname: "is_billable", fieldtype: "Check" },
          {
            label: "Billable Time",
            fieldname: "billing_hrs",
            fieldtype: "Float",
            depends_on: "eval:doc.is_billable == 1",
            description: "Defaults to Hrs when Billable is checked. Edit independently if needed.",
          },
          { label: "Completed", fieldname: "completed", fieldtype: "Check" },
        ],
        size: "small",
        primary_action_label: "Submit",
        primary_action: async (values: any) => {
          if (!values.hrs) {
            frappe.throw(__("Hours is required"));
            return;
          }
          const now = new Date();
          const fromTime = new Date(now.getTime() - values.hrs * 3600 * 1000);
          try {
            const data = await saveDoc({
              doctype: "Timesheet Detail",
              project,
              task,
              from_time: fromTime.toISOString(),
              to_time: now.toISOString(),
              hours: values.hrs,
              description: values.description || "",
              activity_type: values.activity_type || "",
              is_billable: values.is_billable ? 1 : 0,
              billing_hours: values.is_billable ? values.billing_hrs || values.hrs : 0,
              completed: values.completed ? 1 : 0,
            });
            this.$emit("catch-success", data);
            d.hide();
          } catch (err) {
            this.$emit("catch-error", err);
          }
        },
      });
      // When Is Billable is toggled on, seed Billable Time from current Hrs
      d.fields_dict.is_billable.df.onchange = () => {
        if (d.get_value("is_billable") && !d.get_value("billing_hrs")) {
          d.set_value("billing_hrs", d.get_value("hrs") || 0);
        }
      };
      d.show();
    },
    /** Click on the subject text: emit interaction; blanks also enter edit mode. */
    handleSubjectClick(): void {
      this.emitInteraction();
      if (this.isBlank) {
        this.editTask();
      }
    },

    editTask(): void {
      this.isEditing = true;
      this.editedText = this.isBlank ? "" : this.displayText;
      nextTick(() => {
        const inputElement = this.$el.querySelector(".task-subject-edit") as HTMLInputElement;
        if (inputElement) inputElement.focus();
      });
    },

    /** Blur the input on Enter to trigger save via `handleBlur`. */
    unfocusInput(event: Event): void {
      (event.target as HTMLInputElement).blur();
    },

    /** Cancel editing on Escape — sets a flag so `handleBlur` skips save. */
    cancelEdit(): void {
      this.cancelTriggered = true;
      this.isEditing = false;
      this.editedText = this.displayText;
    },

    /**
     * Blur handler for the inline editor.
     *
     * If cancel was triggered (Escape), resets the flag and returns.
     * Otherwise delegates to {@link saveEdit}.
     */
    async handleBlur(): Promise<void> {
      if (this.cancelTriggered) {
        this.cancelTriggered = false;
        return;
      }
      await this.saveEdit();
    },

    /**
     * Persist the inline edit.
     *
     * For **blank nodes**, sends an insert (new Project or Task).
     * For **existing nodes**, sends an update with the changed field
     * (`project_name` for projects, `subject` for tasks).  Projects
     * display as `"NAME: Title"` so the user-edited text is split on
     * the first colon to extract the title portion.
     *
     * Emits `catch-success` or `catch-error` and updates `locals.nodes`
     * expand state.
     */
    async saveEdit(): Promise<void> {
      let saved = false;
      if (this.editedText.trim() !== "") {
        const currentText = this.displayText;
        if (this.editedText !== currentText) {
          saved = true;
          if (this.isBlank) {
            // INSERT a new Task or Project
            let newDoc: Partial<ProjectDoc> | Partial<TaskDoc>;
            if (this.isProject) {
              newDoc = { doctype: "Project", project_name: this.editedText, status: "Open" };
            } else {
              const taskDoc = this.node.doc as TaskDoc;
              newDoc = {
                doctype: "Task",
                subject: this.editedText,
                project: taskDoc.project,
                parent_task: taskDoc.parent_task || null,
                status: "Open",
                priority: "Medium",
                idx: taskDoc.idx || 0,
              };
            }
            try {
              const data = await saveDoc(newDoc);
              if (!this.isProject) {
                // Emit blank-saved for typewriter-style input: auto-focus next blank
                const parentName =
                  (this.node.doc as TaskDoc).parent_task || (this.node.doc as TaskDoc).project;
                this.$emit("blank-saved", { data, parentName });
              } else {
                this.$emit("catch-success", data);
              }
            } catch (error) {
              this.$emit("catch-error", error);
            }
          } else {
            // UPDATE existing Task or Project
            let text = this.editedText;
            if (this.isProject) {
              const parts = text.split(":", 2);
              if (parts.length === 2) text = parts[1].trim();
              try {
                const data = await saveDoc({ ...this.node.doc, project_name: text } as ProjectDoc);
                this.$emit("catch-success", data);
              } catch (error) {
                this.$emit("catch-error", error);
              }
            } else {
              try {
                const data = await saveDoc({ ...this.node.doc, subject: text } as TaskDoc);
                this.$emit("catch-success", data);
              } catch (error) {
                this.$emit("catch-error", error);
              }
            }
          }
        }
      }

      const projectName = getProjectName(this.node);
      if (this.node.doc.name === "" && this.isProject) {
        treeNodes.value[this.editedText] = true;
      } else {
        treeNodes.value[projectName] = true;
      }
      if (!this.isBlank && saved) {
        this.emitInteraction();
      }
      this.isEditing = false;
    },

    /** Open the full Frappe form for this doc in the sidebar. */
    emitSidebar(): void {
      this.$emit("open-sidebar", { doc: this.node.doc, isProject: this.isProject });
    },

    quickEntry(): void {
      const project = getProjectName(this.node);
      const parentTask = this.isProject ? null : this.node.doc.name;
      const label = this.isProject
        ? (this.node.doc as ProjectDoc).project_name
        : (this.node.doc as TaskDoc).subject;

      frappe.prompt(
        [
          {
            label: "Tasks (one per line)",
            fieldname: "tasks",
            fieldtype: "Small Text",
            reqd: true,
          },
        ],
        async (values) => {
          const subjects = (values.tasks as string)
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
          if (!subjects.length) return;
          try {
            const data = await bulkCreateTasks(subjects, project, parentTask);
            this.$emit("catch-success", data);
          } catch (error) {
            this.$emit("catch-error", error);
          }
        },
        `Quick add subtasks to ${frappe.utils.escape_html(label)}`,
        "Add Tasks",
      );
    },

    deleteTask(): void {
      const doc = this.node.doc;
      const label = this.isProject ? (doc as ProjectDoc).project_name : (doc as TaskDoc).subject;
      frappe.confirm(`Delete <b>${frappe.utils.escape_html(label)}</b>?`, async () => {
        try {
          const data = await apiDeleteTask(doc.name);
          this.$emit("catch-success", data);
        } catch (error) {
          this.$emit("catch-error", error);
        }
      });
    },

    async handleAssign(user: string): Promise<void> {
      try {
        const data = await assignTask(this.node.doc.name, user);
        this.$emit("catch-success", data);
      } catch (error) {
        this.$emit("catch-error", error);
      }
    },

    async handleUnassign(user: string): Promise<void> {
      try {
        const data = await unassignTask(this.node.doc.name, user);
        this.$emit("catch-success", data);
      } catch (error) {
        this.$emit("catch-error", error);
      }
    },

    async handlePin(): Promise<void> {
      try {
        const data = await pinTask(this.node.doc.name);
        this.$emit("catch-success", data);
      } catch (error) {
        this.$emit("catch-error", error);
      }
    },

    async handleUnpin(): Promise<void> {
      try {
        const data = await unpinTask(this.node.doc.name);
        this.$emit("catch-success", data);
      } catch (error) {
        this.$emit("catch-error", error);
      }
    },
  },

  /**
   * Lifecycle: set up reactive watchers after the component mounts.
   *
   * 1. **Timer expansion**: watches `timerStatus` and emits
   *    `request-expand` when a timer is running or paused, so the
   *    tree auto-opens ancestor nodes to make the active task visible.
   * 2. **Auto-focus**: watches `_autoFocus` on the node and enters
   *    edit mode when triggered by a keyboard shortcut (see
   *    `editRootBlankTask` in `taskview.ts`).
   */
  mounted() {
    // When this task has an active timer, emit request-expand so the tree opens ancestors
    this.$watch(
      "timerStatus",
      (status: string) => {
        if (status === "running" || status === "paused") {
          this.$emit("request-expand");
        }
      },
      { immediate: true },
    );

    // Auto-focus support for blank nodes (triggered by keyboard shortcut)
    this.$watch(
      () => this.node._autoFocus,
      (val: boolean | undefined) => {
        if (val && !this.isOpened) {
          this.editTask();
          this.node._autoFocus = false;
        }
      },
    );
  },
});
</script>

<style scoped>
.highlighted-project div .task-subject-container {
  font-weight: bold;
}

.task {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
}

.task-subject-container {
  flex-grow: 1;
  margin-right: 10px;
  margin-left: 10px;
  border-bottom: 1px dashed darkgrey;
}

.task-subject {
  padding: 0;
  margin: 0;
  cursor: text;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-customer {
  margin-left: 8px;
  font-size: 0.85em;
  font-weight: normal;
  color: var(--gray-600, #6c757d);
  opacity: 0.8;
}

.pinned-drag-handle {
  cursor: grab;
  color: var(--gray-400, #ced4da);
  font-size: 16px;
  user-select: none;
  flex-shrink: 0;
}

.pinned-drag-handle:active {
  cursor: grabbing;
}

.task-pinned-meta {
  display: block;
  font-size: 0.8em;
  color: var(--gray-600, #6c757d);
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-subject-edit {
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-controls {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 4px;
}

/* custom checkbox styles */
.custom-checkbox {
  display: flex;
  align-items: center;
  position: relative;
}

.custom-checkbox label {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin: 0;
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.custom-checkbox .checkmark {
  height: 20px;
  width: 20px;
  background-color: #d8dfed;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-checkbox input:checked ~ .checkmark {
  background-color: #2196f3;
}

.custom-checkbox .checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.custom-checkbox input:checked ~ .checkmark:after {
  display: block;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 3px 3px 0;
  transform: rotate(45deg);
}
</style>
