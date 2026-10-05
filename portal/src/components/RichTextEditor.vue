<template>
  <div class="relative w-full">
    <Editor
      :model-value="modelValue"
      :extensions="extensions"
      :placeholder="placeholder"
      @update:model-value="$emit('update:modelValue', $event ?? '')"
    >
      <EditorFixedMenu
        :items="toolbar"
        size="sm"
        class="w-full overflow-x-auto border-b border-outline-gray-1 px-1 py-1"
      />
      <EditorContent :class="['prose-sm px-3 py-2', contentClass]" />
    </Editor>
  </div>
</template>

<script lang="ts">
import { defineComponent, markRaw } from "vue";
import {
  Blockquote,
  Bold,
  BulletList,
  CommentKit,
  Editor,
  EditorContent,
  EditorFixedMenu,
  H2,
  H3,
  InsertLink,
  Italic,
  OrderedList,
  Paragraph,
  Separator,
  Strike,
  type CommandMenuItem,
  type MenuItem,
} from "frappe-ui/editor";

/**
 * frappe-ui's toolbar presets have no code-block button (only inline code),
 * while the portal's toolbar always offered one.
 */
const CodeBlock: CommandMenuItem = {
  label: "Code block",
  icon: "lucide-code",
  action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  isActive: (editor) => editor.isActive("codeBlock"),
};

/** Rich-text toolbar for customer input: no images, embeds or task lists. */
const TOOLBAR: MenuItem[] = [
  Paragraph,
  H2,
  H3,
  Separator,
  Bold,
  Italic,
  Strike,
  Separator,
  BulletList,
  OrderedList,
  Separator,
  InsertLink,
  Blockquote,
  CodeBlock,
];

/**
 * The portal's rich-text input (task descriptions and comments), on
 * frappe-ui's `Editor`.  `v-model` is the HTML.
 *
 * `CommentKit` with its media, emoji, mention and tag members switched off
 * matches the toolbar: text formatting, headings, lists, links, quotes and
 * code, nothing that uploads files.
 */
export default defineComponent({
  name: "RichTextEditor",
  components: { Editor, EditorContent, EditorFixedMenu },
  props: {
    modelValue: { type: String, default: "" },
    placeholder: { type: String, default: "" },
    /** Extra classes for the editable area, e.g. a minimum height. */
    contentClass: { type: String, default: "" },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      // Menu items and TipTap extensions are plain config / class instances
      // that the editor reads directly; keep Vue's proxies off them.
      toolbar: markRaw(TOOLBAR),
      extensions: markRaw([
        CommentKit.configure({
          heading: { levels: [2, 3] },
          image: false,
          video: false,
          attachment: false,
          emoji: false,
          mention: false,
          tag: false,
        }),
      ]),
    };
  },
});
</script>
