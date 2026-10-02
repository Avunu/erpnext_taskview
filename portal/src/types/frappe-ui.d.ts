// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * Type surface of `frappe-ui` as used by the portal.
 *
 * frappe-ui ships raw TypeScript / JS sources that don't pass this repo's
 * strict compiler settings, so `portal/tsconfig.json` maps the package to this
 * declaration instead of type-checking the library.  Components are typed
 * loosely; add an export here when the portal starts using another one.
 */

import type { Dayjs } from "dayjs";
import "dayjs/plugin/relativeTime";

// Untyped on purpose: props and slots are frappe-ui's own concern.
type AnyComponent = any;

export const Avatar: AnyComponent;
export const Badge: AnyComponent;
export const Button: AnyComponent;
export const Dialog: AnyComponent;
export const ErrorMessage: AnyComponent;
export const FileUploader: AnyComponent;
export const FormControl: AnyComponent;
export const FrappeUIProvider: AnyComponent;
export const Sidebar: AnyComponent;
export const TabButtons: AnyComponent;
export const TextEditor: AnyComponent;
export const TextInput: AnyComponent;

export const toast: {
  success(message: string): void;
  error(message: string): void;
  info(message: string): void;
  warning(message: string): void;
};

export function dayjs(date?: string | number | Date | Dayjs | null): Dayjs;
