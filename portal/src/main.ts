// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import { applyTheme, loadBoot } from "./boot";
import "./index.css";

loadBoot().then((boot) => {
  applyTheme(boot.theme);
  if (boot.brand.title) document.title = `Projects · ${boot.brand.title}`;
  createApp(App).use(router).mount("#app");
});
