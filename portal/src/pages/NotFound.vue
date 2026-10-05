<template>
  <div class="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
    <h1 class="text-2xl-semibold text-ink-gray-8">Page not found</h1>
    <p class="text-base text-ink-gray-6">
      This page doesn't exist, or you don't have access to it.
    </p>
    <Button variant="subtle" label="Back to projects" @click="$router.push({ name: 'projects' })" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Button } from "frappe-ui";

export default defineComponent({
  name: "NotFound",
  components: { Button },
});
</script>
