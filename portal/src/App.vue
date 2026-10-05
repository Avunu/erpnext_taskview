<template>
  <FrappeUIProvider>
    <div class="flex h-screen w-full overflow-hidden bg-surface-base text-ink-gray-8">
      <AppSidebar />
      <main class="flex min-w-0 flex-1 flex-col overflow-hidden">
        <router-view />
      </main>
    </div>
  </FrappeUIProvider>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { FrappeUIProvider } from "frappe-ui";
import AppSidebar from "./components/AppSidebar.vue";
import { loadProjects } from "./store";

export default defineComponent({
  name: "App",
  components: { FrappeUIProvider, AppSidebar },
  created() {
    loadProjects();
  },
});
</script>
