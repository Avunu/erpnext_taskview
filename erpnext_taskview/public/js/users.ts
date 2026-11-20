// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * @module users
 *
 * The desk's assignable users, fetched once per page and shared by every
 * component that shows or picks assignees: the row pills (`AssignTo.vue`) and
 * the expanded row panel (`RowPanel.vue` / `UserPicker.vue`).
 */

export interface UserOption {
	/** The user's ID (their email address). */
	value: string;
	/** Full name, or the ID when the user has none. */
	label: string;
}

/** Every assignable user, plus the avatar URL of those that have one. */
export interface UserDirectory {
	users: UserOption[];
	images: Record<string, string>;
}

/** A row of the `frappe.client.get_list` call below. */
interface UserRow {
	name: string;
	full_name: string | null;
	user_image: string | null;
}

// Module-level cache: shared across all instances and Vue app re-creations.
// The promise ensures only one API call is ever in-flight.
let _userCache: UserDirectory | null = null;
let _userCachePromise: Promise<UserDirectory> | null = null;

/** Enabled System Users other than Administrator and Guest, loaded once. */
export function fetchUsersOnce(): Promise<UserDirectory> {
	if (_userCache) return Promise.resolve(_userCache);
	if (_userCachePromise) return _userCachePromise;

	_userCachePromise = new Promise<UserDirectory>((resolve, reject) => {
		frappe.call<UserRow[]>({
			method: "frappe.client.get_list",
			args: {
				doctype: "User",
				filters: { enabled: 1, user_type: "System User" },
				fields: ["name", "full_name", "user_image"],
				limit_page_length: 0,
			},
			callback: (r) => {
				const result = r.message ?? [];
				const users: UserOption[] = [];
				const images: Record<string, string> = {};
				for (const u of result) {
					if (u.name === "Administrator" || u.name === "Guest") continue;
					users.push({ value: u.name, label: u.full_name || u.name });
					if (u.user_image) images[u.name] = u.user_image;
				}
				_userCache = { users, images };
				resolve(_userCache);
			},
			error: (err) => {
				_userCachePromise = null; // allow retry on failure
				reject(err);
			},
		});
	});

	return _userCachePromise;
}

/** The user's avatar URL, or `undefined` to fall back to initials. */
export function avatarUrl(images: Record<string, string>, email: string): string | undefined {
	return images[email] || undefined;
}

/**
 * The user's full name.  A user missing from the list (disabled since, or not
 * a System User) shows as their ID, which is still unambiguous.
 */
export function userLabel(users: UserOption[], email: string): string {
	return users.find((u) => u.value === email)?.label || email;
}

/** Up to two initials from the full name (or the email's name parts). */
export function userInitials(users: UserOption[], email: string): string {
	const [first, second] = userLabel(users, email)
		.split(/[\s@.]+/)
		.filter(Boolean);
	if (first && second) return (first.charAt(0) + second.charAt(0)).toUpperCase();
	return (first?.charAt(0) || "?").toUpperCase();
}
