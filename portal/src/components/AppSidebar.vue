<template>
  <Sidebar :header="header" :sections="sections" />
</template>

<script lang="ts">
import { defineComponent, markRaw, type Component } from "vue";
import { Sidebar } from "frappe-ui";
import {
  Clock,
  ExternalLink,
  FolderKanban,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Receipt,
  ShoppingCart,
  SquareArrowOutUpRight,
  UserRound,
} from "lucide-vue-next";
import { boot } from "../boot";
import { projectsStore } from "../store";

/** Icons for the standard ERPNext portal pages; anything else gets a link icon. */
const PORTAL_ICONS: Record<string, Component> = {
  "/orders": ShoppingCart,
  "/invoices": Receipt,
  "/issues": LifeBuoy,
  "/timesheets": Clock,
};

/**
 * Left navigation: the user's projects, then the rest of the customer portal
 * (Portal Settings menu, so Orders / Invoices / Issues stay one click away).
 */
export default defineComponent({
  name: "AppSidebar",
  components: { Sidebar },
  computed: {
    header() {
      return {
        title: boot.brand.title || "Client Portal",
        subtitle: boot.user_fullname,
        logo: boot.brand.logo || undefined,
        menuItems: [
          {
            label: "My account",
            icon: markRaw(UserRound),
            onClick: () => window.location.assign("/me"),
          },
          ...(boot.is_staff
            ? [
                {
                  label: "Open desk",
                  icon: markRaw(SquareArrowOutUpRight),
                  onClick: () => window.location.assign("/app/project"),
                },
              ]
            : []),
          {
            label: "Log out",
            icon: markRaw(LogOut),
            onClick: () => window.location.assign("/logout"),
          },
        ],
      };
    },
    sections() {
      const current = this.$route.params.project;
      return [
        {
          label: "Projects",
          items: [
            {
              label: "All projects",
              icon: markRaw(LayoutDashboard),
              onClick: () => this.$router.push({ name: "projects" }),
              isActive: this.$route.name === "projects",
            },
            ...projectsStore.list.map((p) => ({
              label: p.title,
              icon: markRaw(FolderKanban),
              // push, not the Sidebar's own `to` (which replaces history)
              onClick: () => this.$router.push({ name: "overview", params: { project: p.name } }),
              isActive: current === p.name,
            })),
          ],
        },
        ...(boot.portal_menu.length
          ? [
              {
                label: "Account",
                items: boot.portal_menu.map((item) => ({
                  label: item.title,
                  icon: markRaw(PORTAL_ICONS[item.route] || ExternalLink),
                  onClick: () =>
                    item.target === "_blank"
                      ? window.open(item.route, "_blank")
                      : window.location.assign(item.route),
                })),
              },
            ]
          : []),
      ];
    },
  },
});
</script>
