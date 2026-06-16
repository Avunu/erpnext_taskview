// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const common = {
  plugins: [vue()],
  root: './erpnext_taskview/public/js',
  base: '/assets/erpnext_taskview/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './erpnext_taskview/public/js')
    }
  }
} as const;

const target = process.env.BUNDLE;

// Drop noisy "/* #__PURE__ */" INVALID_ANNOTATION warnings from third-party deps
// (e.g. @vueuse/core) — not actionable in our code. Anything outside node_modules
// still surfaces normally.
const onwarn = (warning: any, warn: (w: any) => void): void => {
  const where = String(warning.id ?? warning.loc?.file ?? warning.message ?? '');
  if (warning.code === 'INVALID_ANNOTATION' && where.includes('node_modules')) return;
  warn(warning);
};

const taskviewConfig = defineConfig({
  ...common,
  build: {
    outDir: '../dist',
    manifest: 'manifest-taskview.json',
    rollupOptions: {
      input: resolve(__dirname, 'erpnext_taskview/public/js/taskview.bundle.ts'),
      external: ['frappe'],
      onwarn,
      output: {
        format: 'iife',
        globals: { frappe: 'frappe' },
        entryFileNames: 'js/taskview.bundle.[hash].js',
        assetFileNames: 'css/taskview.bundle.[hash].[ext]',
      },
    },
    sourcemap: true,
    cssCodeSplit: false,
    // taskview and timerdock build into the same ../dist sequentially, so we
    // must NOT auto-empty (the second build would wipe the first). Setting this
    // explicitly to false also silences Vite's out-of-root emptyOutDir warning.
    emptyOutDir: false,
  },
});

const timerdockConfig = defineConfig({
  ...common,
  build: {
    outDir: '../dist',
    manifest: 'manifest-timerdock.json',
    rollupOptions: {
      input: resolve(__dirname, 'erpnext_taskview/public/js/timerdock.bundle.ts'),
      external: ['frappe'],
      onwarn,
      output: {
        format: 'iife',
        globals: { frappe: 'frappe' },
        entryFileNames: 'js/timerdock.bundle.[hash].js',
        assetFileNames: 'css/timerdock.bundle.[hash].[ext]',
      },
    },
    sourcemap: true,
    cssCodeSplit: false,
    emptyOutDir: false,
  },
});

export default target === 'timerdock' ? timerdockConfig : taskviewConfig;