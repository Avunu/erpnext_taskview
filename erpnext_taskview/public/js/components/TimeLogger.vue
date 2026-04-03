<template>
  <div class="sidebar-content time-logger-sidebar" :data-theme="currentTheme">
    <h3>{{ descriptionOnly ? "Add Description" : "Log time for " + docText }}</h3>
    <form id="log-time-form" @submit.prevent="logTime">
      <label for="description">Description:</label>
      <textarea
        id="description"
        v-model="description"
        rows="4"
        cols="40"
        placeholder="Add a description..."
        ref="descriptionInput"
      >
      </textarea>

      <!-- Conditionally show the datetime pickers -->
      <div v-if="!descriptionOnly" class="datetime-pickers">
        <label for="start-time">Start Time:</label>
        <input type="datetime-local" id="start-time" v-model="startTime" required />

        <label for="stop-time">Stop Time:</label>
        <input type="datetime-local" id="stop-time" v-model="stopTime" required />
      </div>

      <div class="button-group">
        <button type="submit" id="log-button">Log</button>
        <button v-if="!descriptionOnly" type="button" id="cancel-button" @click="closeSidebar">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, type PropType } from "vue";
import { saveDoc } from "../types";

export default defineComponent({
  name: "TimeLogger",

  props: {
    doc: {
      type: Object as PropType<any>,
      required: true,
    },
    isOpened: {
      type: Boolean,
      required: true,
    },
    currentTheme: {
      type: String,
      required: false,
    },
    descriptionOnly: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  emits: ["close-time-logger", "catch-error"],

  data() {
    const pad = (n: number) => String(n).padStart(2, "0");
    const d = new Date();
    const now = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return {
      description: "",
      startTime: now as string | null,
      stopTime: now as string | null,
    };
  },

  computed: {
    docText(): string {
      if (!this.doc?.doc) return "";
      return this.doc.doc.subject || this.doc.doc.project_name || this.doc.doc.name || "";
    },
  },

  watch: {
    isOpened(val: boolean) {
      if (val) {
        nextTick(() => {
          (this.$refs.descriptionInput as HTMLTextAreaElement)?.focus();
        });
      }
    },
  },

  mounted() {
    nextTick(() => {
      if (this.isOpened) {
        (this.$refs.descriptionInput as HTMLTextAreaElement)?.focus();
      }
    });
  },

  beforeUnmount() {
    const input = this.$refs.descriptionInput as HTMLTextAreaElement;
    if (input) {
      this.description = "";
      input.blur();
    }
  },

  methods: {
    formatDateTime(date: Date): string {
      const pad = (num: number): string => String(num).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    },

    async logTime(): Promise<void> {
      if (!this.descriptionOnly) {
        if (!this.startTime || !this.stopTime) {
          alert("Both start time and stop time are required!");
          return;
        }

        try {
          const project = this.doc.doc.project || this.doc.doc.name;
          await saveDoc({
            doctype: "Timesheet Detail",
            project: project,
            task: this.doc.doc.name,
            from_time: this.startTime,
            to_time: this.stopTime,
            description: this.description || "",
          } as any);

          frappe.show_alert({
            message: __(`Time logged for ${this.docText}`),
            indicator: "green",
          });
        } catch (error) {
          this.$emit("catch-error", error);
        }
      }
      this.closeSidebar();
    },

    closeSidebar(): void {
      if (this.descriptionOnly && this.doc?.timesheetDetail?.name) {
        saveDoc({
          doctype: "Timesheet Detail",
          name: this.doc.timesheetDetail.name,
          to_time: new Date().toISOString(),
          description: this.description || "",
        } as any);
      }
      this.$emit("close-time-logger");
    },
  },
});
</script>

<style>
.time-logger-sidebar {
  text-align: center;
  background-color: var(--sidebar-background, #f9f9f9);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.time-logger-sidebar h3 {
  color: var(--text-color, #333);
}

.time-logger-sidebar form,
.time-logger-sidebar .datetime-pickers {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.time-logger-sidebar label {
  margin-bottom: 5px;
  color: var(--label-color, #333);
}

.time-logger-sidebar input,
.time-logger-sidebar textarea {
  padding: 5px;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 4px;
  background-color: var(--input-background-color, #fff);
  color: var(--input-color, #333);
}

.time-logger-sidebar .button-group {
  margin-top: 15px;
}

.time-logger-sidebar button {
  padding: 8px 16px;
  margin-right: 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.time-logger-sidebar button[type="submit"] {
  background-color: var(--submit-button-bg, #007bff);
  color: white;
}

.time-logger-sidebar button[type="button"] {
  background-color: var(--cancel-button-bg, #dc3545);
  color: white;
}

.time-logger-sidebar[data-theme="dark"] {
  --sidebar-background: #252525;
  --text-color: #f1f1f1;
  --label-color: #f1f1f1;
  --border-color: #555;
  --input-background-color: #444;
  --input-color: #f1f1f1;
  --submit-button-bg: #007bff;
  --cancel-button-bg: #dc3545;
}
</style>
