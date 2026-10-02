// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * Customer project portal — a frappe-ui SPA served at /projects.
 *
 * Builds `portal/` into `erpnext_taskview/public/portal/` and copies the
 * generated index.html to `erpnext_taskview/www/projects.html`, which Frappe
 * renders as a Jinja template with `context.boot` from `www/projects.py`
 * (the jinjaBootData plugin turns every boot key into a `window` global).
 * Both outputs are build artifacts; `bench build` regenerates them by running
 * this app's `yarn build`.
 *
 * Nothing here may be named `*.bundle.*`: Frappe's esbuild compiles every
 * such file under `public/` on its own.
 */

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// @ts-expect-error -- frappe-ui ships its Vite plugin as untyped JS
import frappeui from "frappe-ui/vite";
import tailwindcss from "tailwindcss";
import { createRequire } from "module";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const portalRoot = resolve(__dirname, "portal");

// frappe-ui's components declare props with imported types, which Vue's SFC
// compiler resolves through TypeScript's JS API.  The app's `typescript` is the
// native TS 7 build, which has none, so point the compiler at the TS 5 copy
// (`typescript5` alias).  Same compiler instance plugin-vue loads (CJS require).
const require = createRequire(import.meta.url);
require("vue/compiler-sfc").registerTS(() => require("typescript5"));

export default defineConfig({
  root: portalRoot,
  plugins: [
    frappeui({
      frappeProxy: true,
      jinjaBootData: true,
      lucideIcons: true,
      // Absolute paths: the plugin's own app-directory detection walks up from
      // the working directory and can land on the wrong app.
      buildConfig: {
        outDir: resolve(__dirname, "erpnext_taskview/public/portal"),
        indexHtmlPath: resolve(__dirname, "erpnext_taskview/www/projects.html"),
        baseUrl: "/assets/erpnext_taskview/portal/",
        emptyOutDir: true,
        sourcemap: true,
      },
    }),
    vue(),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss({ config: resolve(portalRoot, "tailwind.config.js") })],
    },
  },
  resolve: {
    alias: {
      "@": resolve(portalRoot, "src"),
      // Pure helpers shared with the desk TaskView (budget meter maths).
      "@desk": resolve(__dirname, "erpnext_taskview/public/js"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "js/[name]-[hash].js",
        chunkFileNames: "js/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
