// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

import { createRouter, createWebHistory } from "vue-router";
import ProjectList from "./pages/ProjectList.vue";
import ProjectLayout from "./pages/ProjectLayout.vue";
import ProjectOverview from "./pages/ProjectOverview.vue";
import ProjectTasks from "./pages/ProjectTasks.vue";
import TaskDrawer from "./components/TaskDrawer.vue";
import NotFound from "./pages/NotFound.vue";

export const router = createRouter({
  history: createWebHistory("/projects/"),
  routes: [
    { path: "/", name: "projects", component: ProjectList },
    {
      path: "/:project",
      component: ProjectLayout,
      props: true,
      children: [
        { path: "", name: "overview", component: ProjectOverview, props: true },
        {
          path: "tasks",
          name: "tasks",
          component: ProjectTasks,
          props: true,
          children: [{ path: ":task", name: "task", component: TaskDrawer, props: true }],
        },
      ],
    },
    { path: "/:pathMatch(.*)*", name: "not-found", component: NotFound },
  ],
});

// ERPNext's legacy links (/projects?project=X) are redirected server-side;
// this catches any that reach the SPA anyway.
router.beforeEach((to) => {
  if (to.name === "projects" && typeof to.query.project === "string" && to.query.project) {
    return { name: "overview", params: { project: to.query.project } };
  }
});
