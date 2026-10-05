<template>
  <Sidebar>
    <SidebarHeader
      :title="header.title"
      :subtitle="header.subtitle"
      :logo="header.logo"
      :menu-items="header.menuItems"
    />
    <div class="flex-1 overflow-y-auto">
      <SidebarSection v-for="section in sections" :key="section.label" :label="section.label">
        <SidebarItem
          v-for="item in section.items"
          :key="item.label"
          :label="item.label"
          :icon="item.icon"
          :active="item.active"
          @click="item.onClick"
        />
      </SidebarSection>
    </div>
  </Sidebar>
</template>

<script lang="ts">
import { defineComponent, markRaw, type Component } from "vue";
import { Sidebar, SidebarHeader, SidebarItem, SidebarSection } from "frappe-ui";
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

/** One row of the navigation. */
interface NavItem {
  label: string;
  icon: Component;
  onClick: () => unknown;
  active?: boolean;
}

/**
 * Left navigation: the user's projects, then the rest of the customer portal
 * (Portal Settings menu, so Orders / Invoices / Issues stay one click away).
 */
export default defineComponent({
  name: "AppSidebar",
  components: { Sidebar, SidebarHeader, SidebarItem, SidebarSection },
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
    sections(): { label: string; items: NavItem[] }[] {
      const current = this.$route.params.project;
      return [
        {
          label: "Projects",
          items: [
            {
              label: "All projects",
              icon: markRaw(LayoutDashboard),
              onClick: () => this.$router.push({ name: "projects" }),
              active: this.$route.name === "projects",
            },
            ...projectsStore.list.map((p) => ({
              label: p.title,
              icon: markRaw(FolderKanban),
              onClick: () => this.$router.push({ name: "overview", params: { project: p.name } }),
              active: current === p.name,
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
