// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

import frappeUIPreset, { content as frappeUIContent } from "frappe-ui/tailwind";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [frappeUIPreset],
  content: {
    relative: true,
    // frappe-ui's own globs cover every source that emits classes, including
    // the editor (`src/molecules`) and its `lucide-*` toolbar icons.
    files: ["./index.html", "./src/**/*.{vue,js,ts}", ...frappeUIContent],
  },
};
