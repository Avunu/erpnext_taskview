<template>
	<div class="user-picker">
		<button
			ref="addButton"
			type="button"
			class="tv-ghost-btn"
			:aria-expanded="dropdownOpen"
			aria-haspopup="listbox"
			:disabled="disabled"
			@click="toggleDropdown"
		>
			<Plus :size="14" /> Add
		</button>

		<div v-if="dropdownOpen" class="user-dropdown">
			<input
				ref="searchInput"
				v-model="search"
				class="user-search"
				placeholder="Search users..."
				role="combobox"
				aria-autocomplete="list"
				:aria-expanded="true"
				:aria-controls="listId"
				:aria-activedescendant="matches[highlighted] ? optionId(highlighted) : undefined"
				@keydown.stop="onSearchKeydown"
			/>
			<ul :id="listId" ref="list" class="user-list" role="listbox">
				<li
					v-for="(u, i) in matches"
					:id="optionId(i)"
					:key="u.value"
					class="user-item"
					:class="{ 'user-item--active': i === highlighted }"
					role="option"
					:aria-selected="i === highlighted"
					@mouseenter="highlighted = i"
					@click="pick(u.value)"
				>
					<img v-if="avatar(u.value)" class="user-avatar" :src="avatar(u.value)" alt="" />
					<span v-else class="user-avatar user-avatar--initials">{{ initials(u.value) }}</span>
					<span class="user-item-text">
						<span class="user-item-label">{{ u.label }}</span>
						<span v-if="u.label !== u.value" class="user-item-meta">{{ u.value }}</span>
					</span>
				</li>
				<li v-if="loading && !matches.length" class="user-item user-item--empty">Loading...</li>
				<li v-else-if="!matches.length" class="user-item user-item--empty">No users found</li>
			</ul>
		</div>
	</div>
</template>

<script lang="ts">
// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

import { defineComponent, nextTick, type PropType } from "vue";
import { Plus } from "lucide-vue-next";
import { type UserOption, avatarUrl, fetchUsersOnce, userInitials } from "../users";

/** Gives each picker's listbox its own element ids. */
let pickerSeq = 0;

/**
 * "Add" button with a searchable user dropdown, for the expanded row panel's
 * assignee list.  Modelled on `ProjectPicker.vue`: every word of the search
 * must appear in the user's name or email, ↑/↓ move, Enter picks, Esc closes,
 * and a click anywhere else closes it (capture phase, see `mounted`).
 */
export default defineComponent({
	name: "UserPicker",
	components: { Plus },

	props: {
		/** Users not to offer, i.e. those already assigned. */
		exclude: { type: Array as PropType<string[]>, default: () => [] },
		disabled: { type: Boolean, default: false },
	},

	emits: ["select"],

	data() {
		return {
			dropdownOpen: false,
			search: "",
			highlighted: 0,
			users: [] as UserOption[],
			images: {} as Record<string, string>,
			loading: false,
			listId: `tv-user-picker-${++pickerSeq}`,
		};
	},

	computed: {
		matches(): UserOption[] {
			const excluded = new Set(this.exclude);
			const terms = this.search.toLowerCase().split(/\s+/).filter(Boolean);
			return this.users.filter((u) => {
				if (excluded.has(u.value)) return false;
				const haystack = `${u.label} ${u.value}`.toLowerCase();
				return terms.every((t) => haystack.includes(t));
			});
		},
	},

	watch: {
		search(): void {
			this.highlighted = 0;
		},
	},

	methods: {
		async loadUsers(): Promise<void> {
			this.loading = true;
			try {
				const directory = await fetchUsersOnce();
				this.users = directory.users;
				this.images = directory.images;
			} catch (err) {
				console.error("erpnext_taskview: failed to load users", err);
			} finally {
				this.loading = false;
			}
		},

		avatar(email: string): string | undefined {
			return avatarUrl(this.images, email);
		},

		initials(email: string): string {
			return userInitials(this.users, email);
		},

		toggleDropdown(): void {
			if (this.dropdownOpen) {
				this.closeDropdown();
				return;
			}
			this.dropdownOpen = true;
			this.search = "";
			this.highlighted = 0;
			this.loadUsers();
			nextTick(() => (this.$refs.searchInput as HTMLInputElement | undefined)?.focus());
		},

		optionId(index: number): string {
			return `${this.listId}-${index}`;
		},

		closeDropdown(): void {
			this.dropdownOpen = false;
			this.search = "";
		},

		/** Close from the keyboard: the focused search input goes away, so focus returns to "Add". */
		closeAndRefocus(): void {
			this.closeDropdown();
			(this.$refs.addButton as HTMLButtonElement | undefined)?.focus({ preventScroll: true });
		},

		pick(user: string, refocus = false): void {
			if (refocus) this.closeAndRefocus();
			else this.closeDropdown();
			this.$emit("select", user);
		},

		onSearchKeydown(event: KeyboardEvent): void {
			switch (event.key) {
				case "ArrowDown":
					event.preventDefault();
					this.moveHighlight(1);
					break;
				case "ArrowUp":
					event.preventDefault();
					this.moveHighlight(-1);
					break;
				case "Enter": {
					event.preventDefault();
					const choice = this.matches[this.highlighted];
					if (choice) this.pick(choice.value, true);
					break;
				}
				case "Escape":
					this.closeAndRefocus();
					break;
			}
		},

		moveHighlight(step: number): void {
			const count = this.matches.length;
			if (!count) return;
			this.highlighted = (this.highlighted + step + count) % count;
			nextTick(() => {
				const list = this.$refs.list as HTMLElement | undefined;
				list?.children[this.highlighted]?.scrollIntoView({ block: "nearest" });
			});
		},

		onClickOutside(event: MouseEvent): void {
			if (this.dropdownOpen && !(this.$el as HTMLElement).contains(event.target as Node)) {
				this.closeDropdown();
			}
		},
	},

	// Capture phase: row controls stop their clicks from bubbling, which would
	// otherwise hide them from this listener and leave the dropdown open.
	mounted() {
		document.addEventListener("click", this.onClickOutside, true);
	},

	beforeUnmount() {
		document.removeEventListener("click", this.onClickOutside, true);
	},
});
</script>

<style scoped>
.user-picker {
	position: relative;
	display: inline-flex;
}

.user-dropdown {
	position: absolute;
	top: 100%;
	left: 0;
	z-index: 100;
	margin-top: 2px;
	background: var(--card-bg);
	border: 1px solid var(--cds-border-subtle, var(--border-color));
	border-radius: var(--border-radius);
	box-shadow: var(--shadow-md);
	width: 280px;
	display: flex;
	flex-direction: column;
}

.user-search {
	padding: 8px 10px;
	border: none;
	border-bottom: 1px solid var(--cds-border-subtle, var(--border-color));
	font-size: var(--text-sm);
	outline: none;
	background: transparent;
	color: var(--text-color);
}

/* The outline would clash with the dropdown's border; mark focus on the rule below. */
.user-search:focus-visible {
	border-bottom-color: var(--cds-focus, var(--primary));
	box-shadow: inset 0 -1px var(--cds-focus, var(--primary));
}

.user-list {
	list-style: none;
	margin: 0;
	padding: 4px 0;
	overflow-y: auto;
	max-height: 260px;
}

.user-item {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 6px 10px;
	cursor: pointer;
	font-size: var(--text-sm);
}

.user-item--active {
	background: var(--cds-layer-hover-01, var(--bg-light-blue));
}

.user-item--empty {
	color: var(--text-muted);
	cursor: default;
	justify-content: center;
}

.user-item-text {
	display: flex;
	flex-direction: column;
	min-width: 0;
}

.user-item-label,
.user-item-meta {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.user-item-meta {
	font-size: var(--text-xs);
	color: var(--text-muted);
}

.user-avatar {
	width: 24px;
	height: 24px;
	border-radius: var(--border-radius-full);
	object-fit: cover;
	flex-shrink: 0;
}

.user-avatar--initials {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	background: var(--gray-300);
	color: var(--text-on-gray);
	font-size: 10px;
	font-weight: var(--weight-semibold);
}
</style>
