// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * Type surface of `frappe-ui` as used by the portal.
 *
 * frappe-ui ships raw TypeScript / JS sources that don't pass this repo's
 * strict compiler settings, so `portal/tsconfig.json` maps the package to this
 * declaration instead of type-checking the library.  Components are typed as
 * plain Vue components (their props and slots are frappe-ui's own concern);
 * add an export here when the portal starts using another one.
 */

// frappe-ui's dayjs has the relativeTime plugin; this adds its methods to `Dayjs`.
/// <reference types="dayjs/plugin/relativeTime" />

import type { Dayjs } from "dayjs";
import type { Component } from "vue";

export const Avatar: Component;
export const Badge: Component;
export const Button: Component;
export const Dialog: Component;
export const ErrorMessage: Component;
export const FileUploader: Component;
export const FormControl: Component;
export const FrappeUIProvider: Component;
export const Sidebar: Component;
export const SidebarHeader: Component;
export const SidebarItem: Component;
export const SidebarSection: Component;
export const TabButtons: Component;
export const TextInput: Component;

export const toast: {
	success(message: string): void;
	error(message: string): void;
	info(message: string): void;
	warning(message: string): void;
};

export function dayjs(date?: string | number | Date | Dayjs | null): Dayjs;
