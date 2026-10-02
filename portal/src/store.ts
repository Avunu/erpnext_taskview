// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/** The user's project list, shared by the sidebar and the projects page. */

import { reactive } from "vue";
import { errorMessage, getProjects } from "./api";
import type { PortalProject } from "./types";

export const projectsStore = reactive({
  list: [] as PortalProject[],
  loading: false,
  loaded: false,
  error: "",
});

export async function loadProjects(): Promise<void> {
  projectsStore.loading = true;
  try {
    projectsStore.list = await getProjects();
    projectsStore.error = "";
  } catch (error) {
    projectsStore.error = errorMessage(error);
  } finally {
    projectsStore.loading = false;
    projectsStore.loaded = true;
  }
}
