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

const taskviewConfig = defineConfig({
  ...common,
  build: {
    outDir: '../dist',
    manifest: 'manifest-taskview.json',
    rollupOptions: {
      input: resolve(__dirname, 'erpnext_taskview/public/js/taskview.bundle.ts'),
      external: ['frappe'],
      output: {
        format: 'iife',
        globals: { frappe: 'frappe' },
        entryFileNames: 'js/taskview.bundle.[hash].js',
        assetFileNames: 'css/taskview.bundle.[hash].[ext]',
        inlineDynamicImports: true,
      },
    },
    sourcemap: true,
    cssCodeSplit: false,
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
      output: {
        format: 'iife',
        globals: { frappe: 'frappe' },
        entryFileNames: 'js/timerdock.bundle.[hash].js',
        assetFileNames: 'css/timerdock.bundle.[hash].[ext]',
        inlineDynamicImports: true,
      },
    },
    sourcemap: true,
    cssCodeSplit: false,
  },
});

export default target === 'timerdock' ? timerdockConfig : taskviewConfig;