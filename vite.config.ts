import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [vue()],
  root: './erpnext_taskrunner/public/js',
  base: '/assets/erpnext_taskrunner/',
  build: {
    outDir: '../dist',
    lib: {
      entry: resolve(__dirname, 'erpnext_taskrunner/public/js/app.bundle.ts'),
      name: 'TaskRunner',
      fileName: () => 'app.bundle.js',
      formats: ['iife']
    },
    rollupOptions: {
      external: ['frappe'],
      output: {
        globals: {
          frappe: 'frappe'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './erpnext_taskrunner/public/js')
    }
  }
})