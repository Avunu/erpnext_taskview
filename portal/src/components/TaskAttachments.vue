<template>
  <section>
    <div class="mb-2 flex items-center justify-between">
      <h3 class="text-sm font-semibold text-ink-gray-8">
        Files
        <span v-if="attachments.length" class="font-normal text-ink-gray-5">{{
          attachments.length
        }}</span>
      </h3>
      <FileUploader
        :upload-args="{
          upload_endpoint: uploadEndpoint,
          doctype: 'Task',
          docname: task,
          private: true,
        }"
        :validate-file="validateFile"
        @success="onUploaded"
        @failure="onFailed"
      >
        <template #default="{ openFileSelector, uploading, progress }">
          <Button
            variant="subtle"
            size="sm"
            :loading="uploading"
            :icon-left="uploadIcon"
            @click="openFileSelector"
          >
            {{ uploading ? `Uploading ${progress}%` : "Attach file" }}
          </Button>
        </template>
      </FileUploader>
    </div>

    <p v-if="!attachments.length" class="text-base text-ink-gray-5">No files yet.</p>
    <ul v-else class="divide-y divide-outline-gray-1 rounded border border-outline-gray-2">
      <li v-for="file in attachments" :key="file.name" class="flex items-center gap-3 px-3 py-2">
        <img
          v-if="file.is_image"
          :src="file.url"
          alt=""
          class="h-9 w-9 shrink-0 rounded object-cover"
          loading="lazy"
        />
        <FileText v-else class="h-5 w-5 shrink-0 text-ink-gray-5" />
        <div class="min-w-0 flex-1">
          <a
            :href="file.url"
            target="_blank"
            rel="noopener"
            class="block truncate text-base text-ink-gray-8 hover:underline"
          >
            {{ file.file_name }}
          </a>
          <div class="text-xs text-ink-gray-5">
            {{
              [formatFileSize(file.file_size), file.by, fromNow(file.creation)]
                .filter(Boolean)
                .join(" · ")
            }}
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>

<script lang="ts">
import { defineComponent, markRaw, type PropType } from "vue";
import { Button, FileUploader, toast } from "frappe-ui";
import { FileText, Paperclip } from "lucide-vue-next";
import { UPLOAD_ENDPOINT, errorMessage } from "../api";
import type { PortalAttachment } from "../types";
import { formatFileSize, fromNow } from "../utils";

/** Files on the task; uploads go through the portal's permission-checked endpoint as private files. */
export default defineComponent({
  name: "TaskAttachments",
  components: { Button, FileUploader, FileText },
  props: {
    task: { type: String, required: true },
    attachments: { type: Array as PropType<PortalAttachment[]>, required: true },
  },
  emits: ["changed"],
  data() {
    return { uploadEndpoint: UPLOAD_ENDPOINT, uploadIcon: markRaw(Paperclip) };
  },
  methods: {
    formatFileSize,
    fromNow,
    validateFile(file: File): string | undefined {
      // Frappe's own default cap; the server enforces the site's real limit.
      if (file.size > 25 * 1024 * 1024) return "Files must be 25 MB or smaller.";
      return undefined;
    },
    onUploaded(): void {
      toast.success("File attached");
      this.$emit("changed");
    },
    onFailed(error: unknown): void {
      toast.error(errorMessage(error));
    },
  },
});
</script>
