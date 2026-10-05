<template>
  <div class="project-picker" @click.stop>
    <button
      class="project-chip"
      :class="{ 'project-chip--empty': !project }"
      :title="project ? chipLabel : 'Choose a project'"
      @click="toggleDropdown"
    >
      <template v-if="project">
        <span class="project-chip-label">{{ chipLabel }}</span>
        <ChevronDown :size="12" />
      </template>
      <template v-else><Plus :size="12" /> Project</template>
    </button>

    <div v-if="dropdownOpen" class="project-dropdown">
      <input
        ref="searchInput"
        v-model="search"
        class="project-search"
        placeholder="Search projects or customers..."
        @keydown.stop="onSearchKeydown"
      />
      <ul ref="list" class="project-list">
        <li
          v-for="(p, i) in matches"
          :key="p.name"
          class="project-item"
          :class="{
            'project-item--active': i === highlighted,
            'project-item--current': p.name === project,
          }"
          @mouseenter="highlighted = i"
          @click="pick(p.name)"
        >
          <span class="project-item-title">{{ p.project_name || p.name }}</span>
          <span class="project-item-meta">
            {{ [p.customer, p.name].filter(Boolean).join(" · ") }}
          </span>
        </li>
        <li v-if="loading && !matches.length" class="project-item project-item--empty">
          Loading...
        </li>
        <li v-else-if="!matches.length" class="project-item project-item--empty">
          No open projects found
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, type PropType } from "vue";
import { ChevronDown, Plus } from "lucide-vue-next";

interface ProjectOption {
  name: string;
  project_name: string;
  customer: string | null;
}

/** Rows shown at once; typing narrows the rest down. */
const MAX_MATCHES = 50;

// Module-level cache shared by every picker on the page (cf. AssignTo.vue's
// user cache).  Refreshed in the background each time a dropdown opens, so
// projects created since the page loaded show up on the next open.
let _projects: ProjectOption[] | null = null;
let _projectsPromise: Promise<ProjectOption[]> | null = null;

function fetchOpenProjects(): Promise<ProjectOption[]> {
  if (_projectsPromise) return _projectsPromise;
  _projectsPromise = new Promise<ProjectOption[]>((resolve, reject) => {
    frappe.call({
      method: "frappe.client.get_list",
      args: {
        doctype: "Project",
        filters: { status: "Open" },
        fields: ["name", "project_name", "customer"],
        order_by: "idx asc, creation asc",
        limit_page_length: 0,
      },
      callback: (r: { message: ProjectOption[] }) => {
        _projects = r.message || [];
        resolve(_projects);
      },
      error: (err: unknown) => reject(err),
    });
  }).finally(() => {
    _projectsPromise = null;
  });
  return _projectsPromise;
}

/**
 * Searchable project selector for a task row.
 *
 * Shows the task's project as a chip (`Customer · Project`), or a `+ Project`
 * chip when it has none.  Clicking it opens a dropdown that filters open
 * projects as you type: every word of the search must appear in the project's
 * ID, title or customer.  ↑/↓ move, Enter picks, Esc closes.
 */
export default defineComponent({
  name: "ProjectPicker",
  components: { ChevronDown, Plus },

  props: {
    /** The task's current project, or "" when it has none. */
    project: { type: String, default: "" },
    projectName: { type: String as PropType<string | null>, default: null },
    customer: { type: String as PropType<string | null>, default: null },
    /** Projects to list first when the search is empty (e.g. those of other pinned tasks). */
    recentProjects: { type: Array as PropType<string[]>, default: () => [] },
  },

  emits: ["select"],

  data() {
    return {
      dropdownOpen: false,
      search: "",
      highlighted: 0,
      projects: (_projects ?? []) as ProjectOption[],
      loading: false,
    };
  },

  computed: {
    chipLabel(): string {
      return [this.customer, this.projectName || this.project].filter(Boolean).join(" · ");
    },

    matches(): ProjectOption[] {
      const terms = this.search.toLowerCase().split(/\s+/).filter(Boolean);
      if (!terms.length) {
        const rank = new Map(this.recentProjects.map((p, i) => [p, i]));
        const recent = this.projects
          .filter((p) => rank.has(p.name))
          .sort((a, b) => rank.get(a.name)! - rank.get(b.name)!);
        const rest = this.projects.filter((p) => !rank.has(p.name));
        return [...recent, ...rest].slice(0, MAX_MATCHES);
      }
      return this.projects
        .filter((p) => {
          const haystack = `${p.name} ${p.project_name} ${p.customer ?? ""}`.toLowerCase();
          return terms.every((t) => haystack.includes(t));
        })
        .slice(0, MAX_MATCHES);
    },
  },

  watch: {
    search(): void {
      this.highlighted = 0;
    },
  },

  methods: {
    async loadProjects(): Promise<void> {
      this.loading = true;
      try {
        this.projects = await fetchOpenProjects();
      } catch (err) {
        console.error("erpnext_taskview: failed to load projects", err);
      } finally {
        this.loading = false;
      }
    },

    toggleDropdown(): void {
      if (this.dropdownOpen) {
        this.closeDropdown();
        return;
      }
      this.dropdownOpen = true;
      this.search = "";
      this.highlighted = 0;
      this.loadProjects();
      nextTick(() => (this.$refs.searchInput as HTMLInputElement | undefined)?.focus());
    },

    closeDropdown(): void {
      this.dropdownOpen = false;
      this.search = "";
    },

    pick(name: string): void {
      this.closeDropdown();
      if (name !== this.project) this.$emit("select", name);
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
          if (choice) this.pick(choice.name);
          break;
        }
        case "Escape":
          this.closeDropdown();
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

  // Capture phase: the chip's @click.stop would otherwise hide clicks on
  // another row's picker from this listener, leaving two dropdowns open.
  mounted() {
    document.addEventListener("click", this.onClickOutside, true);
  },

  beforeUnmount() {
    document.removeEventListener("click", this.onClickOutside, true);
  },
});
</script>

<style scoped>
.project-picker {
  position: relative;
  flex-shrink: 0;
  margin-right: 8px;
}

.project-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 240px;
  height: 22px;
  padding: 0 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-full);
  background: var(--control-bg);
  color: var(--text-muted);
  font-size: var(--text-xs);
  cursor: pointer;
}

.project-chip:hover {
  color: var(--text-color);
}

.project-chip-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* A task without a project is unfinished business: make the chip stand out.
   currentColor keeps the dashed border in step with each theme's text tone. */
.project-chip--empty,
.project-chip--empty:hover {
  border: 1px dashed currentColor;
  background: var(--bg-yellow);
  color: var(--text-on-yellow);
}

.project-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 100;
  margin-top: 2px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  width: 320px;
  display: flex;
  flex-direction: column;
}

.project-search {
  padding: 8px 10px;
  border: none;
  border-bottom: 1px solid var(--border-color);
  font-size: var(--text-sm);
  outline: none;
  background: transparent;
  color: var(--text-color);
}

.project-list {
  list-style: none;
  margin: 0;
  padding: 4px 0;
  overflow-y: auto;
  max-height: 280px;
}

.project-item {
  display: flex;
  flex-direction: column;
  padding: 6px 10px;
  cursor: pointer;
  font-size: var(--text-sm);
}

.project-item--active {
  background: var(--bg-light-blue);
}

.project-item--current .project-item-title {
  font-weight: var(--weight-semibold);
}

.project-item-title,
.project-item-meta {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-item-meta {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.project-item--empty {
  color: var(--text-muted);
  cursor: default;
  align-items: center;
}
</style>
