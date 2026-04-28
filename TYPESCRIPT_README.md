<!-- Copyright (c) 2026, Avunu LLC and contributors
For license information, please see license.txt-->

# ERPNext TaskRunner - TypeScript Migration

This project has been successfully migrated from JavaScript to TypeScript, providing better type safety and development experience.

## Development Setup

### Prerequisites
- Node.js (v16 or higher)
- Yarn package manager

### Installation
```bash
yarn install
```

### Development Commands

**Type Checking**
```bash
yarn type-check
```

**Build for Production**
```bash
yarn build
```

**Development Mode (with file watching)**
```bash
yarn dev
```

## Project Structure

### TypeScript Files
- `app.bundle.ts` - Main entry point for Frappe integration
- `TaskRunner.vue` - Main Vue component
- `components/Task.vue` - Individual task component
- `components/TimeLogger.vue` - Time logging component
- `assets/js/script.ts` - Backend communication utilities
- `assets/js/task.ts` - Task management composable
- `assets/js/taskview.ts` - Main app logic composable
- `assets/js/timelogger.ts` - Time logging composable
- `types/frappe.d.ts` - TypeScript definitions for Frappe framework

### Output
- `erpnext_taskview/public/dist/app.bundle.iife.js` - Compiled JavaScript bundle
- `erpnext_taskview/public/dist/style.css` - Compiled CSS

## Build Configuration

The project uses Vite for building with the following configuration:
- Entry point: `app.bundle.ts`
- Output format: IIFE (Immediately Invoked Function Expression)
- External dependencies: Frappe framework (globally available)

## Type Safety

All JavaScript files have been converted to TypeScript with proper type annotations:
- Interface definitions for data structures
- Type-safe function parameters and return values
- Proper Vue 3 Composition API typing
- Frappe framework type definitions

## Migration Notes

- Original JavaScript files have been removed
- All imports updated to use TypeScript extensions
- Vue components now use `<script lang="ts">`
- Proper type definitions added for all function parameters
- Build output is ignored in `.gitignore`

## Contributing

When adding new features:
1. Use TypeScript for all new code
2. Add proper type annotations
3. Run `yarn type-check` before committing
4. Build the project with `yarn build` to ensure it compiles correctly