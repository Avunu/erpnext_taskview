<template>
  <Dialog v-model="open" :options="{ title: 'New task', size: 'xl' }">
    <template #body-content>
      <form class="flex flex-col gap-4" @submit.prevent="submit">
        <FormControl
          v-model="subject"
          type="text"
          label="Title"
          placeholder="What needs doing?"
          :required="true"
          autofocus
        />

        <div class="grid gap-4 sm:grid-cols-2">
          <label v-if="phases.length" class="flex flex-col gap-1.5">
            <span class="text-xs text-ink-gray-5">Phase</span>
            <select
              v-model="phase"
              class="form-select rounded border-outline-gray-2 bg-surface-gray-2 text-base text-ink-gray-8"
            >
              <option :value="''">No phase</option>
              <option v-for="p in phases" :key="p.name" :value="p.name">{{ p.label }}</option>
            </select>
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-xs text-ink-gray-5">Priority</span>
            <select
              v-model="priority"
              class="form-select rounded border-outline-gray-2 bg-surface-gray-2 text-base text-ink-gray-8"
            >
              <option v-for="p in priorities" :key="p" :value="p">{{ p }}</option>
            </select>
          </label>
        </div>

        <div class="flex flex-col gap-1.5">
          <span class="text-xs text-ink-gray-5">Description</span>
          <TextEditor
            :key="editorKey"
            :content="description"
            placeholder="Details, links, acceptance criteria…"
            :fixed-menu="menu"
            editor-class="prose-sm min-h-[8rem] max-w-none px-3 py-2"
            class="rounded border border-outline-gray-2"
            @change="description = $event"
          />
        </div>

        <ErrorMessage v-if="error" :message="error" />
      </form>
    </template>
    <template #actions>
      <div class="flex justify-end gap-2">
        <Button variant="subtle" label="Cancel" @click="open = false" />
        <Button
          variant="solid"
          label="Add task"
          :loading="saving"
          :disabled="!subject.trim()"
          @click="submit"
        />
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { Button, Dialog, ErrorMessage, FormControl, TextEditor, toast } from "frappe-ui";
import { createTask, errorMessage } from "../api";
import { EDITOR_MENU } from "../projectContext";
import type { PortalTaskCard } from "../types";

/** Add a task to the project, optionally under one of its open phases (group tasks). */
export default defineComponent({
  name: "NewTaskDialog",
  components: { Button, Dialog, ErrorMessage, FormControl, TextEditor },
  props: {
    modelValue: { type: Boolean, required: true },
    project: { type: String, required: true },
    tasks: { type: Array as PropType<PortalTaskCard[]>, required: true },
    defaultPhase: { type: String as PropType<string | null>, default: null },
  },
  emits: ["update:modelValue", "created"],
  data() {
    return {
      subject: "",
      description: "",
      phase: "",
      priority: "Medium",
      priorities: ["Low", "Medium", "High", "Urgent"],
      menu: EDITOR_MENU,
      saving: false,
      error: "",
      editorKey: 0,
    };
  },
  computed: {
    open: {
      get(): boolean {
        return this.modelValue;
      },
      set(value: boolean) {
        this.$emit("update:modelValue", value);
      },
    },
    /** Open group tasks, labelled with their parent phase when nested. */
    phases(): { name: string; label: string }[] {
      return this.tasks
        .filter((t) => t.is_group && t.status !== "Completed")
        .map((t) => ({
          name: t.name,
          label: t.parent_subject ? `${t.parent_subject} › ${t.subject}` : t.subject,
        }));
    },
  },
  watch: {
    modelValue(value: boolean) {
      if (value) this.reset();
    },
  },
  methods: {
    reset(): void {
      this.subject = "";
      this.description = "";
      this.phase = this.defaultPhase || "";
      this.priority = "Medium";
      this.error = "";
      this.editorKey++;
    },
    async submit(): Promise<void> {
      if (!this.subject.trim() || this.saving) return;
      this.saving = true;
      this.error = "";
      try {
        const { name } = await createTask({
          project: this.project,
          subject: this.subject.trim(),
          description: this.description,
          parent_task: this.phase || null,
          priority: this.priority,
        });
        toast.success("Task added");
        this.open = false;
        this.$emit("created", name);
      } catch (error) {
        this.error = errorMessage(error);
      } finally {
        this.saving = false;
      }
    },
  },
});
</script>
