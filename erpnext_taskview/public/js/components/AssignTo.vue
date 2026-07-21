<template>
  <div class="assign-to" @click.stop>
    <!-- Avatars / pills for current assignees -->
    <div class="assign-pills">
      <span v-for="user in assignedUsers" :key="user" class="assign-pill" :title="user">
        <img v-if="avatarUrl(user)" class="assign-avatar" :src="avatarUrl(user)" :alt="user" />
        <span v-else class="assign-avatar assign-avatar--initials">{{ initials(user) }}</span>
        <button class="assign-pill-remove" @click="removeUser(user)" title="Unassign">
          &times;
        </button>
      </span>
    </div>

    <!-- Pin button -->
    <button
      class="task-btn assign-btn--pin"
      :class="{ 'assign-btn--pinned': isPinned }"
      @click="togglePin"
      :title="isPinned ? 'Unpin task' : 'Pin task'"
    >
      <Pin :size="14" :fill="isPinned ? 'currentColor' : 'none'" />
    </button>

    <!-- Dropdown trigger -->
    <button class="task-btn assign-btn--add" @click="toggleDropdown" title="Assign to...">+</button>

    <!-- Dropdown -->
    <div v-if="dropdownOpen" class="assign-dropdown">
      <input
        ref="searchInput"
        v-model="search"
        class="assign-search"
        placeholder="Search users..."
        @keydown.esc="closeDropdown"
        @keydown.stop
      />
      <ul class="assign-user-list">
        <li
          v-for="user in filteredUsers"
          :key="user.value"
          class="assign-user-item"
          @click="addUser(user.value)"
        >
          <img
            v-if="avatarUrl(user.value)"
            class="assign-avatar"
            :src="avatarUrl(user.value)"
            :alt="user.value"
          />
          <span v-else class="assign-avatar assign-avatar--initials">{{
            initials(user.value)
          }}</span>
          <span class="assign-user-label">{{ user.label || user.value }}</span>
        </li>
        <li v-if="filteredUsers.length === 0" class="assign-user-item assign-user-item--empty">
          No users found
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, type PropType } from "vue";
import { Pin } from "lucide-vue-next";

interface UserOption {
  value: string;
  label: string;
}

// Module-level cache: shared across all instances and Vue app re-creations.
// The promise ensures only one API call is ever in-flight.
let _userCache: { users: UserOption[]; images: Record<string, string> } | null = null;
let _userCachePromise: Promise<{ users: UserOption[]; images: Record<string, string> }> | null =
  null;

function fetchUsersOnce(): Promise<{ users: UserOption[]; images: Record<string, string> }> {
  if (_userCache) return Promise.resolve(_userCache);
  if (_userCachePromise) return _userCachePromise;

  _userCachePromise = new Promise<{ users: UserOption[]; images: Record<string, string> }>(
    (resolve, reject) => {
      frappe.call({
        method: "frappe.client.get_list",
        args: {
          doctype: "User",
          filters: { enabled: 1, user_type: "System User" },
          fields: ["name", "full_name", "user_image"],
          limit_page_length: 0,
        },
        callback: (r: any) => {
          const result = r.message || [];
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
        error: (err: any) => {
          _userCachePromise = null; // allow retry on failure
          reject(err);
        },
      });
    },
  );

  return _userCachePromise;
}

export default defineComponent({
  name: "AssignTo",
  components: { Pin },

  props: {
    assignedTo: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    taskName: {
      type: String,
      required: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["assign", "unassign", "pin", "unpin"],

  data() {
    return {
      dropdownOpen: false,
      search: "",
      allUsers: [] as UserOption[],
      userImages: {} as Record<string, string>,
    };
  },

  computed: {
    assignedUsers(): string[] {
      return this.assignedTo || [];
    },

    isAssignedToMe(): boolean {
      return this.assignedUsers.includes(frappe.session.user);
    },

    filteredUsers(): UserOption[] {
      const assigned = new Set(this.assignedUsers);
      const q = this.search.toLowerCase();
      return this.allUsers.filter(
        (u) =>
          !assigned.has(u.value) &&
          (u.value.toLowerCase().includes(q) || u.label.toLowerCase().includes(q)),
      );
    },
  },

  created() {
    this.loadUsers();
  },

  methods: {
    async loadUsers(): Promise<void> {
      try {
        const cached = await fetchUsersOnce();
        this.allUsers = cached.users;
        this.userImages = cached.images;
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    },

    avatarUrl(email: string): string | undefined {
      return this.userImages[email] || undefined;
    },

    initials(email: string): string {
      const user = this.allUsers.find((u) => u.value === email);
      const name = user?.label || email;
      const parts = name.split(/[\s@.]+/).filter(Boolean);
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return (parts[0]?.[0] || "?").toUpperCase();
    },

    togglePin(): void {
      if (this.isPinned) {
        this.$emit("unpin");
      } else {
        this.$emit("pin");
      }
    },

    addUser(user: string): void {
      this.$emit("assign", user);
      this.closeDropdown();
    },

    removeUser(user: string): void {
      this.$emit("unassign", user);
    },

    toggleDropdown(): void {
      this.dropdownOpen = !this.dropdownOpen;
      if (this.dropdownOpen) {
        this.search = "";
        nextTick(() => {
          (this.$refs.searchInput as HTMLInputElement)?.focus();
        });
      }
    },

    closeDropdown(): void {
      this.dropdownOpen = false;
      this.search = "";
    },
  },

  mounted() {
    const onClickOutside = (e: MouseEvent) => {
      if (this.dropdownOpen && !(this.$el as HTMLElement).contains(e.target as Node)) {
        this.closeDropdown();
      }
    };
    document.addEventListener("click", onClickOutside);
    (this as any)._onClickOutside = onClickOutside;
  },

  beforeUnmount() {
    document.removeEventListener("click", (this as any)._onClickOutside);
  },
});
</script>

<style scoped>
.assign-to {
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
}

.assign-pills {
  display: flex;
  align-items: center;
  gap: 2px;
}

.assign-pill {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: var(--bg-light-blue);
  border: 1px solid var(--blue-200);
  border-radius: var(--border-radius-lg);
  padding: 1px 4px 1px 1px;
  font-size: var(--text-tiny);
  max-width: 120px;
}

.assign-pill:hover .assign-pill-remove {
  opacity: 1;
}

.assign-pill-remove {
  border: none;
  background: none;
  cursor: pointer;
  font-size: var(--text-sm);
  line-height: 1;
  color: var(--text-muted);
  opacity: 0;
  transition: opacity 0.15s;
  padding: 0 2px;
}

.assign-pill-remove:hover {
  color: var(--red-600);
}

.assign-avatar {
  width: 20px;
  height: 20px;
  border-radius: var(--border-radius-full);
  object-fit: cover;
  flex-shrink: 0;
}

.assign-avatar--initials {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-300);
  color: var(--text-on-gray);
  font-size: 9px;
  font-weight: var(--weight-semibold);
}

.assign-btn--pin {
  background: var(--bg-gray);
  color: var(--text-on-gray);
  font-size: var(--text-sm);
}

.assign-btn--pin:hover {
  background: var(--bg-blue);
  color: var(--text-on-blue);
}

.assign-btn--pinned {
  background: var(--bg-blue);
  color: var(--text-on-blue);
}

.assign-btn--add {
  background: var(--bg-gray);
  color: var(--text-on-gray);
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
}

.assign-btn--add:hover {
  background: var(--bg-blue);
  color: var(--text-on-blue);
}

.assign-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 100;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  width: 240px;
  max-height: 280px;
  display: flex;
  flex-direction: column;
}

.assign-search {
  padding: 8px 10px;
  border: none;
  border-bottom: 1px solid var(--border-color);
  font-size: var(--text-sm);
  outline: none;
  background: transparent;
  color: var(--text-color);
}

.assign-user-list {
  list-style: none;
  margin: 0;
  padding: 4px 0;
  overflow-y: auto;
  max-height: 230px;
}

.assign-user-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: var(--text-sm);
}

.assign-user-item:hover {
  background: var(--bg-light-blue);
}

.assign-user-item--empty {
  color: var(--text-muted);
  cursor: default;
  justify-content: center;
}

.assign-user-item--empty:hover {
  background: transparent;
}

.assign-user-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
