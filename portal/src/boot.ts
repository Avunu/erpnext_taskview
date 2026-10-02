// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * Boot data from `erpnext_taskview/www/projects.py`.
 *
 * In a built page the frappe-ui jinjaBootData plugin writes every boot key
 * onto `window`.  Under the Vite dev server there is no Jinja pass, so the
 * same payload is fetched from `get_context_for_dev`.
 */

import { reactive } from "vue";

export interface PortalMenuItem {
  title: string;
  route: string;
  target: string | null;
}

export interface PortalBoot {
  csrf_token: string;
  site_name: string;
  user: string;
  user_fullname: string;
  user_image: string;
  is_staff: boolean;
  lang: string;
  theme: "light" | "dark" | "automatic";
  brand: { logo: string; title: string };
  portal_menu: PortalMenuItem[];
}

const KEYS: (keyof PortalBoot)[] = [
  "csrf_token",
  "site_name",
  "user",
  "user_fullname",
  "user_image",
  "is_staff",
  "lang",
  "theme",
  "brand",
  "portal_menu",
];

export const boot = reactive({}) as PortalBoot;

export async function loadBoot(): Promise<PortalBoot> {
  const w = window as unknown as Record<string, unknown>;
  let data: Partial<PortalBoot>;
  if (import.meta.env.DEV && !w.user) {
    const res = await fetch("/api/method/erpnext_taskview.www.projects.get_context_for_dev", {
      method: "POST",
      headers: { Accept: "application/json" },
    });
    data = (await res.json()).message ?? {};
    w.csrf_token = data.csrf_token;
  } else {
    data = Object.fromEntries(KEYS.map((k) => [k, w[k]])) as Partial<PortalBoot>;
  }
  Object.assign(boot, {
    portal_menu: [],
    brand: { logo: "", title: "" },
    ...data,
  });
  return boot;
}

/** Apply the user's desk theme preference (frappe-ui styles key off `data-theme`). */
export function applyTheme(theme: PortalBoot["theme"]): void {
  const resolved =
    theme === "automatic"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme || "light";
  document.documentElement.setAttribute("data-theme", resolved);
}
