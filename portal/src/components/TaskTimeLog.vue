<template>
  <section>
    <h3 class="mb-2 flex items-baseline justify-between text-sm font-semibold text-ink-gray-8">
      <span>Time logged</span>
      <span class="font-normal tabular-nums text-ink-gray-6">
        {{ formatHours(total) }} h<span v-if="notBilled > 0">
          · {{ formatHours(notBilled) }} h not billed</span
        >
      </span>
    </h3>

    <p v-if="!logs.length" class="text-base text-ink-gray-5">No time logged yet.</p>
    <div v-else class="overflow-x-auto rounded border border-outline-gray-2">
      <table class="w-full text-left text-sm">
        <thead class="bg-surface-gray-1 text-xs text-ink-gray-5">
          <tr>
            <th class="px-3 py-2 font-normal">Date</th>
            <th class="px-3 py-2 font-normal">Who</th>
            <th class="px-3 py-2 font-normal">Work</th>
            <th class="px-3 py-2 text-right font-normal">Hours</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-gray-1 text-ink-gray-8">
          <tr v-for="log in logs" :key="log.name" class="align-top">
            <td class="whitespace-nowrap px-3 py-2">{{ formatDate(log.date) }}</td>
            <td class="whitespace-nowrap px-3 py-2">{{ log.staff }}</td>
            <td class="px-3 py-2">
              <div v-if="log.task && log.task !== task" class="text-xs text-ink-gray-5">
                {{ log.task_subject }}
              </div>
              <div class="whitespace-pre-line">
                {{ log.description || log.activity_type || "—" }}
              </div>
              <div class="mt-1 flex gap-1">
                <Badge v-if="log.running" label="In progress" theme="blue" size="sm" />
                <Badge v-if="log.not_billed" label="Not billed" theme="gray" size="sm" />
              </div>
            </td>
            <td class="whitespace-nowrap px-3 py-2 text-right tabular-nums">
              {{ formatHours(log.hours) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { Badge } from "frappe-ui";
import { formatHours } from "@desk/budget";
import type { PortalTimeLog } from "../types";
import { formatDate } from "../utils";

/** Every time entry on the task and its subtasks (draft and submitted timesheets). */
export default defineComponent({
  name: "TaskTimeLog",
  components: { Badge },
  props: {
    logs: { type: Array as PropType<PortalTimeLog[]>, required: true },
    total: { type: Number, required: true },
    notBilled: { type: Number, required: true },
    task: { type: String, required: true },
  },
  methods: { formatDate, formatHours },
});
</script>
