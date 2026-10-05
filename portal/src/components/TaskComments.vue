<template>
  <section>
    <h3 class="mb-3 text-sm-semibold text-ink-gray-8">
      Comments
      <span v-if="comments.length" class="font-normal text-ink-gray-5">{{ comments.length }}</span>
    </h3>

    <ol v-if="comments.length" class="mb-4 flex flex-col gap-4">
      <li v-for="c in comments" :key="c.name" class="flex gap-3">
        <Avatar :label="c.by" :image="c.by_image || undefined" size="md" class="mt-0.5 shrink-0" />
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-x-2 text-sm">
            <span class="font-medium text-ink-gray-8">{{ c.by }}</span>
            <Badge v-if="c.is_staff" label="Team" theme="blue" size="sm" />
            <span class="text-ink-gray-5" :title="c.creation">{{ fromNow(c.creation) }}</span>
          </div>
          <div class="prose prose-sm mt-1 max-w-none text-ink-gray-8" v-html="c.content"></div>
        </div>
      </li>
    </ol>

    <div class="rounded-4 border border-outline-gray-2">
      <RichTextEditor v-model="draft" placeholder="Write a comment…" content-class="min-h-[5rem]" />
      <div class="flex justify-end border-t border-outline-gray-1 p-2">
        <Button
          variant="solid"
          label="Comment"
          :loading="saving"
          :disabled="isBlank"
          @click="submit"
        />
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { Avatar, Badge, Button, toast } from "frappe-ui";
import { addComment, errorMessage } from "../api";
import RichTextEditor from "./RichTextEditor.vue";
import type { PortalComment } from "../types";
import { fromNow } from "../utils";

/** Every comment on the task (staff and customer alike), plus a composer. */
export default defineComponent({
  name: "TaskComments",
  components: { Avatar, Badge, Button, RichTextEditor },
  props: {
    task: { type: String, required: true },
    comments: { type: Array as PropType<PortalComment[]>, required: true },
  },
  emits: ["added"],
  data() {
    return { draft: "", saving: false };
  },
  computed: {
    isBlank(): boolean {
      const div = document.createElement("div");
      div.innerHTML = this.draft;
      return !div.textContent?.trim();
    },
  },
  methods: {
    fromNow,
    async submit(): Promise<void> {
      if (this.isBlank || this.saving) return;
      this.saving = true;
      try {
        const comment = await addComment(this.task, this.draft);
        this.draft = "";
        this.$emit("added", comment);
      } catch (error) {
        toast.error(errorMessage(error));
      } finally {
        this.saving = false;
      }
    },
  },
});
</script>
