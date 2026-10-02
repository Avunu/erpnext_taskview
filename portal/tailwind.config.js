// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

import frappeUIPreset from "frappe-ui/tailwind";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [frappeUIPreset],
  content: {
    relative: true,
    files: [
      "./index.html",
      "./src/**/*.{vue,js,ts}",
      "../node_modules/frappe-ui/src/components/**/*.{vue,js,ts}",
    ],
  },
};
