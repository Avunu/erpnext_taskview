import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [vue()],
  root: './erpnext_taskview/public/js',
  base: '/assets/erpnext_taskview/',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        'taskview.bundle': resolve(__dirname, 'erpnext_taskview/public/js/taskview.bundle.ts'),
        'timerdock.bundle': resolve(__dirname, 'erpnext_taskview/public/js/timerdock.bundle.ts'),
      },
      external: ['frappe'],
      output: {
        format: 'iife',
        globals: {
          frappe: 'frappe'
        },
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]',
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './erpnext_taskview/public/js')
    }
  }
})