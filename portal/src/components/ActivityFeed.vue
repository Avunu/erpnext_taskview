<template>
  <div v-if="!items.length" class="text-base text-ink-gray-5">Nothing yet.</div>
  <ol v-else class="flex flex-col gap-4">
    <li v-for="(item, i) in items" :key="i" class="flex gap-3">
      <div
        class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-gray-2"
      >
        <component :is="icons[item.kind]" class="h-3.5 w-3.5 text-ink-gray-6" />
      </div>
      <div class="min-w-0 flex-1 text-base">
        <div class="text-ink-gray-7">
          <span class="font-medium text-ink-gray-8">{{ item.by || "Someone" }}</span>
          {{ verb(item) }}
          <router-link
            v-if="item.task"
            :to="{ name: 'task', params: { project, task: item.task } }"
            class="font-medium text-ink-gray-8 hover:underline"
          >
            {{ item.task_subject || item.task }}
          </router-link>
          <span class="text-sm text-ink-gray-5"> · {{ fromNow(item.at) }}</span>
        </div>
        <p v-if="item.text" class="mt-0.5 line-clamp-2 text-sm text-ink-gray-6">{{ item.text }}</p>
      </div>
    </li>
  </ol>
</template>

<script lang="ts">
import { defineComponent, markRaw, type PropType } from "vue";
import { ArrowRightLeft, Clock, MessageSquare, Paperclip, Plus } from "lucide-vue-next";
import type { ActivityKind, PortalActivity } from "../types";
import { fromNow } from "../utils";

export default defineComponent({
  name: "ActivityFeed",
  props: {
    items: { type: Array as PropType<PortalActivity[]>, required: true },
    project: { type: String, required: true },
  },
  data() {
    return {
      icons: {
        created: markRaw(Plus),
        comment: markRaw(MessageSquare),
        status: markRaw(ArrowRightLeft),
        time: markRaw(Clock),
        attachment: markRaw(Paperclip),
      } as Record<ActivityKind, unknown>,
      verbs: {
        created: "added",
        comment: "commented on",
        status: "moved",
        time: "logged time on",
        attachment: "attached a file to",
      } as Record<ActivityKind, string>,
    };
  },
  methods: {
    fromNow,
    verb(item: PortalActivity): string {
      return item.task
        ? this.verbs[item.kind]
        : item.kind === "time"
          ? "logged time"
          : this.verbs[item.kind];
    },
  },
});
</script>
