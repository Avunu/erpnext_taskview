<template>
	<!-- keydown.stop: the tree's own keyboard navigation (he-tree) claims Enter,
	     Space and the arrows from anything inside a node, and TaskView's
	     document shortcuts would turn typing into "start typing to create". -->
	<section
		class="tv-panel"
		:data-name="node.doc.name"
		:aria-label="`Details of ${title}`"
		@keydown="onPanelKeydown"
	>
		<div class="tv-panel__toolbar">
			<span v-if="loadError" class="tv-panel__error">
				Couldn't load the details.
				<button type="button" class="tv-ghost-btn" @click="loadDetail">Retry</button>
			</span>
			<span v-else-if="detail && !detail.can_write" class="tv-panel__muted">Read only</span>
			<div class="tv-panel__actions">
				<button
					type="button"
					class="tv-icon-btn"
					title="Open in side panel"
					aria-label="Open in side panel"
					@click="openSidebar"
				>
					<PanelRightOpen :size="16" />
				</button>
				<button
					type="button"
					class="tv-icon-btn"
					title="Collapse (Esc)"
					aria-label="Collapse"
					@click="$emit('collapse')"
				>
					<ChevronUp :size="16" />
				</button>
			</div>
		</div>

		<div class="tv-panel__grid">
			<dl class="tv-panel__fields">
				<dt>Status</dt>
				<dd>
					<span class="tv-status">
						<span class="tv-status__dot" :class="`tv-status__dot--${statusTone}`"></span>
						{{ node.doc.status || "—" }}
					</span>
				</dd>

				<template v-if="isProject">
					<dt>Customer</dt>
					<dd>{{ projectDoc.customer || "—" }}</dd>
				</template>
				<template v-else>
					<dt>Priority</dt>
					<dd>
						<div v-if="editable" ref="ctl_priority" class="tv-panel__control tv-panel__control--select"></div>
						<span v-else>{{ detail?.priority || taskDoc.priority || "—" }}</span>
					</dd>
				</template>

				<dt>Expected start</dt>
				<dd>
					<div v-if="editable" ref="ctl_start_date" class="tv-panel__control tv-panel__control--date"></div>
					<span v-else>{{ dateText(detail?.start_date) }}</span>
				</dd>

				<dt>Expected end</dt>
				<dd>
					<div v-if="editable" ref="ctl_end_date" class="tv-panel__control tv-panel__control--date"></div>
					<span v-else>{{ dateText(detail?.end_date) }}</span>
				</dd>

				<dt>Budget</dt>
				<dd class="tv-panel__budget">
					<div class="tv-panel__estimate">
						<div
							v-if="editable"
							ref="ctl_expected_hours"
							class="tv-panel__control tv-panel__control--hours"
						></div>
						<span v-else>{{ hoursText(detail?.expected_hours) }}</span>
						<span class="tv-panel__muted">{{ isProject ? "h budgeted" : "h expected" }}</span>
					</div>
					<BudgetMeter
						v-if="budget > 0"
						:logged="node.doc.logged_hours || 0"
						:budget="budget"
						:liveExtra="liveExtra"
						:large="true"
					/>
					<span class="tv-panel__muted">{{ budgetText }}</span>
					<span v-if="node.doc.budget_source === 'rollup'" class="tv-panel__muted">
						Rolled up from {{ isProject ? "its tasks" : "subtasks" }}; an estimate here takes over.
					</span>
				</dd>

				<template v-if="isProject">
					<dt>Complete</dt>
					<dd>{{ detail?.progress != null ? `${Math.round(detail.progress)}%` : "—" }}</dd>
				</template>
				<template v-else>
					<dt>Assigned to</dt>
					<dd>
						<ul v-if="assignees.length" class="tv-assignees">
							<li v-for="user in assignees" :key="user" class="tv-assignee">
								<img v-if="avatar(user)" class="tv-assignee__avatar" :src="avatar(user)" alt="" />
								<span v-else class="tv-assignee__avatar tv-assignee__avatar--initials">
									{{ initials(user) }}
								</span>
								<span class="tv-assignee__name" :title="user">{{ fullName(user) }}</span>
								<button
									v-if="canAssign"
									type="button"
									class="tv-icon-btn tv-icon-btn--small"
									:title="`Unassign ${fullName(user)}`"
									:aria-label="`Unassign ${fullName(user)}`"
									:disabled="busyUsers.includes(user)"
									@click="unassign(user)"
								>
									<X :size="14" />
								</button>
							</li>
						</ul>
						<span v-else-if="!canAssign">—</span>
						<UserPicker v-if="canAssign" :exclude="assignees" @select="assign" />
					</dd>
				</template>
			</dl>

			<div class="tv-panel__description">
				<div class="tv-panel__description-head">
					<span class="tv-panel__label">{{ isProject ? "Notes" : "Description" }}</span>
					<button
						v-if="editable && !editingDescription && hasDescription"
						type="button"
						class="tv-ghost-btn"
						@click="editDescription"
					>
						<Pencil :size="14" /> Edit
					</button>
				</div>
				<template v-if="editingDescription">
					<div ref="descriptionEditor" class="tv-panel__editor"></div>
					<div class="tv-panel__editor-actions">
						<button
							type="button"
							class="btn btn-primary btn-xs"
							:disabled="savingDescription"
							@click="saveDescription"
						>
							Save
						</button>
						<button
							type="button"
							class="btn btn-default btn-xs"
							:disabled="savingDescription"
							@click="closeDescriptionEditor"
						>
							Cancel
						</button>
					</div>
				</template>
				<!-- Stored HTML from the desk's own Text Editor, shown as the form shows it. -->
				<div
					v-else-if="hasDescription"
					class="ql-editor read-mode tv-panel__rich"
					v-html="detail?.description"
				></div>
				<div v-else class="tv-panel__empty">
					<span class="tv-panel__muted">{{ detail ? `No ${descriptionNoun}` : "Loading..." }}</span>
					<button v-if="editable" type="button" class="tv-ghost-btn" @click="editDescription">
						<Plus :size="14" /> Add {{ descriptionNoun }}
					</button>
				</div>
			</div>
		</div>

		<!-- Quick entry for children, as in the Pinned view: Enter adds and keeps
		     focus for the next one; a multi-line paste adds one per line. -->
		<div v-if="canAddChildren" class="tv-panel__entry-block">
			<div class="tv-panel__entry">
				<Plus :size="16" class="tv-panel__entry-icon" />
				<input
					v-model="entryText"
					class="tv-panel__entry-input"
					:placeholder="isProject ? 'Add task…' : 'Add subtask…'"
					:aria-label="isProject ? 'Add task' : 'Add subtask'"
					@keydown="onEntryKeydown"
					@paste="onEntryPaste"
					@focus="onEntryFocus"
					@blur="onEntryBlur"
				/>
			</div>
			<div v-for="p in pending" :key="p.key" class="tv-panel__pending">
				<span class="tv-panel__spinner"></span>
				<span class="tv-panel__pending-subject">{{ p.subject }}</span>
			</div>
		</div>
	</section>
</template>

<script lang="ts">
// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

import { defineComponent, markRaw, nextTick, type PropType } from "vue";
import type { BaseControl, FieldType, FrappeDoc } from "frappe-types";
import { ChevronUp, PanelRightOpen, Pencil, Plus, X } from "lucide-vue-next";
import {
	type GetResponse,
	type ProjectDoc,
	type RowDetail,
	type RowDetailValues,
	type RowDoctype,
	type TaskDoc,
	type TreeNode,
	assignTask,
	fetchRowDetail,
	getDisplayText,
	getProjectName,
	saveDoc,
	unassignTask,
	updateRow,
} from "../types";
import { budgetSummary, formatHours } from "../budget";
import { liveExtraByNode } from "../budgetLive";
import { treeNodes } from "../treeState";
import { type UserOption, avatarUrl, fetchUsersOnce, userInitials, userLabel } from "../users";
import BudgetMeter from "./BudgetMeter.vue";
import UserPicker from "./UserPicker.vue";

/** Panel fields edited through a desk control, keyed like {@link RowDetailValues}. */
type ControlKey = "start_date" | "end_date" | "expected_hours" | "priority";

/** A child task waiting for the server. */
interface PendingTask {
	key: string;
	subject: string;
}

/**
 * Last detail read per row, so re-opening a panel shows its fields at once
 * while a fresh read runs (someone may have edited the row in the side panel
 * or the form meanwhile).
 */
const detailCache = new Map<string, RowDetail>();

/**
 * Row whose child entry input had focus.  The panel is keyed by doc name, so
 * a tree rebuild keeps it mounted; should it ever be re-created mid-burst,
 * the new instance takes the caret back (cf. PinnedView's `layout` watcher).
 */
let focusedEntry: string | null = null;

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

/** Status → dot colour.  Anything unknown (custom statuses) stays grey. */
const STATUS_TONES: Record<string, string> = {
	Open: "blue",
	Working: "orange",
	"Pending Review": "purple",
	Overdue: "red",
	Completed: "green",
	Cancelled: "gray",
	Template: "gray",
};

/** Desk control internals a teardown has to reach; not part of BaseControl's typing. */
interface ControlExtras {
	datepicker?: { destroy?: () => void };
	editor_app?: { unmount(): void };
	$input?: { val(): unknown };
}

/** Remove a desk control and what it left outside its wrapper (datepicker, editor app). */
function destroyControl(control: BaseControl): void {
	const extras = control as unknown as ControlExtras;
	extras.datepicker?.destroy?.();
	extras.editor_app?.unmount();
	control.$wrapper.remove();
}

/** Text of stored editor HTML, to tell "no description" from an empty `<p><br></p>`. */
function hasVisibleContent(html: string | null | undefined): boolean {
	if (!html) return false;
	if (/<(img|iframe|video|table)\b/i.test(html)) return true;
	return (
		html
			.replace(/<[^>]*>/g, "")
			.replace(/&nbsp;/g, " ")
			.trim() !== ""
	);
}

/**
 * Carbon-style expandable row panel for the TaskView tree.
 *
 * Opens under the selected row (one at a time, `TaskView.expandedName`) and
 * shows what the row itself has no room for: status, priority, the expected
 * schedule, the hour budget, assignees and the description, plus an entry
 * for adding children.  It replaces the old blank "Add task..." rows.
 *
 * ## Data
 *
 * - Fields the tree snapshot doesn't carry (description, dates, the row's own
 *   estimate, priority, progress, write permission) come from
 *   `get_row_detail`, read when the panel opens.
 * - Budget, logged and live hours come from the reactive tree doc
 *   (`node.doc`), exactly as the row's own meter, so both tick together.
 * - Every edit is saved at once through `update_row`, which runs ERPNext's
 *   validation and answers with a fresh snapshot (`applySnapshot`), so the
 *   meters of the row and its ancestors follow a changed estimate.
 *
 * ## Desk controls
 *
 * Dates, hours, priority and the description editor are the desk's own
 * controls (`frappe.ui.form.make_control`), so they follow the user's date
 * format, number format and editor.  They live outside Vue: mounted into refs
 * once the detail says the row is writable, kept in step with later reads,
 * and torn down with the panel.
 *
 * ## Results
 *
 * Saves report through the `applySnapshot` / `reportError` callback props,
 * not events: a save can return after the panel has closed, and Vue drops
 * an unmounted component's emits, which would leave the tree stale and the
 * error unseen.
 *
 * ## Events emitted
 *
 * | Event           | Payload            | When                                  |
 * |-----------------|--------------------|---------------------------------------|
 * | `editing`       | `boolean`          | The description editor opened/closed  |
 * | `open-sidebar`  | `{doc, isProject}` | "Open in side panel"                  |
 * | `collapse`      | —                  | Collapse button, or Escape in the panel |
 */
export default defineComponent({
	name: "RowPanel",
	components: { BudgetMeter, UserPicker, ChevronUp, PanelRightOpen, Pencil, Plus, X },

	props: {
		node: { type: Object as PropType<TreeNode>, required: true },
		/** In "My Tasks", children are self-assigned so they stay in view once saved. */
		viewMode: {
			type: String as PropType<"all" | "my_tasks" | "pinned">,
			default: "all",
		},
		/** Highest child `idx` in the full snapshot ("My Tasks" filters `node.children`). */
		minChildIdx: { type: Number, default: 0 },
		/** Rebuild the tree from a save's fresh snapshot (TaskView's `premount`). */
		applySnapshot: {
			type: Function as PropType<(data: GetResponse) => void>,
			required: true,
		},
		/** Report a failed save (TaskView's `catchError`: message and refetch). */
		reportError: {
			type: Function as PropType<(error: unknown) => void>,
			required: true,
		},
	},

	emits: ["open-sidebar", "collapse", "editing"],

	data() {
		return {
			detail: (detailCache.get(this.node.doc.name) ?? null) as RowDetail | null,
			loadError: false,
			/** Live desk controls by field.  Raw: Vue must not proxy jQuery-backed objects. */
			controls: markRaw({} as Partial<Record<ControlKey, BaseControl>>),
			editingDescription: false,
			savingDescription: false,
			descriptionControl: null as BaseControl | null,
			users: [] as UserOption[],
			userImages: {} as Record<string, string>,
			/** Users with an assign/unassign call in flight. */
			busyUsers: [] as string[],
			entryText: "",
			pending: [] as PendingTask[],
			pendingSeq: 0,
			/** Serialises child saves so they land in the order they were typed. */
			queue: Promise.resolve() as Promise<void>,
			/** Highest `idx` handed out by this panel, so a burst keeps appending. */
			lastIdx: 0,
		};
	},

	computed: {
		isProject(): boolean {
			return this.node.doc.doctype === "Project";
		},
		doctype(): RowDoctype {
			return this.isProject ? "Project" : "Task";
		},
		taskDoc(): TaskDoc {
			return this.node.doc as TaskDoc;
		},
		projectDoc(): ProjectDoc {
			return this.node.doc as ProjectDoc;
		},
		title(): string {
			return getDisplayText(this.node);
		},
		descriptionNoun(): string {
			return this.isProject ? "notes" : "description";
		},
		/** Writable fields render as desk controls; otherwise as plain text. */
		editable(): boolean {
			return !!this.detail?.can_write;
		},
		/** Assignment follows the row's write permission, like every other panel edit. */
		canAssign(): boolean {
			return this.editable;
		},
		/** Children need an open row with a project: timesheets and tasks are kept per project. */
		canAddChildren(): boolean {
			return this.node.doc.status !== "Completed" && !!getProjectName(this.node);
		},
		statusTone(): string {
			return STATUS_TONES[this.node.doc.status] ?? "gray";
		},
		budget(): number {
			return this.node.doc.budget_hours ?? 0;
		},
		liveExtra(): number {
			return liveExtraByNode.value.get(this.node.doc.name) ?? 0;
		},
		budgetText(): string {
			return budgetSummary((this.node.doc.logged_hours ?? 0) + this.liveExtra, this.budget);
		},
		assignees(): string[] {
			return this.isProject ? [] : this.taskDoc.assigned_to || [];
		},
		hasDescription(): boolean {
			return hasVisibleContent(this.detail?.description);
		},
	},

	watch: {
		editable: {
			handler(editable: boolean): void {
				if (editable) nextTick(() => this.mountControls());
			},
		},
		detail(): void {
			this.syncControls();
		},
		editingDescription(editing: boolean): void {
			this.$emit("editing", editing);
		},
	},

	created() {
		this.loadDetail();
		if (!this.isProject) this.loadUsers();
	},

	mounted() {
		if (this.editable) this.mountControls();
		if (focusedEntry === this.node.doc.name && document.activeElement === document.body) {
			this.focusEntry();
		}
	},

	beforeUnmount() {
		for (const control of Object.values(this.controls)) {
			if (control) destroyControl(control);
		}
		this.controls = markRaw({} as Partial<Record<ControlKey, BaseControl>>);
		this.destroyDescriptionControl();
		if (this.editingDescription) this.$emit("editing", false);
	},

	methods: {
		// ── Detail ────────────────────────────────────────────

		async loadDetail(): Promise<void> {
			const name = this.node.doc.name;
			this.loadError = false;
			try {
				const detail = await fetchRowDetail(this.doctype, name);
				detailCache.set(name, detail);
				this.detail = detail;
			} catch (error) {
				console.error("erpnext_taskview: row detail failed", error);
				// A stale cached copy is still worth showing; flag only a blank panel.
				this.loadError = !this.detail;
			}
		},

		/**
		 * Save panel fields.  On failure (e.g. ERPNext rejecting an end date
		 * before the start) the controls snap back to the stored values.
		 */
		async save(values: RowDetailValues): Promise<boolean> {
			try {
				const response = await updateRow(this.doctype, this.node.doc.name, values);
				detailCache.set(response.detail.name, response.detail);
				this.detail = response.detail;
				// Show what was stored even in the field just edited: ERPNext may
				// derive it (a cleared Task end date comes back as start + estimate).
				this.syncControls(false, Object.keys(values) as ControlKey[]);
				this.applySnapshot(response);
				return true;
			} catch (error) {
				this.syncControls(true);
				this.reportError(error);
				return false;
			}
		},

		// ── Desk controls ─────────────────────────────────────

		/** A stored date in the user's date format, for read-only rows. */
		dateText(value: string | null | undefined): string {
			return value ? frappe.datetime.str_to_user(value) : "—";
		},

		/** A stored hour figure, for read-only rows. */
		hoursText(value: number | null | undefined): string {
			return value ? formatHours(value) : "—";
		},

		controlValue(key: ControlKey): string | number | null {
			const detail = this.detail;
			if (!detail) return null;
			if (key === "priority") return detail.priority ?? this.taskDoc.priority ?? null;
			return detail[key];
		},

		mountControls(): void {
			const specs: [ControlKey, FieldType, string?][] = [
				["start_date", "Date"],
				["end_date", "Date"],
				["expected_hours", "Float"],
			];
			if (!this.isProject) specs.push(["priority", "Select", PRIORITIES.join("\n")]);

			for (const [key, fieldtype, options] of specs) {
				const parent = this.$refs[`ctl_${key}`] as HTMLElement | undefined;
				if (!parent || this.controls[key]) continue;
				const value = this.controlValue(key);
				// A plain doc object gives the control a model to compare against,
				// so setting the same value again never fires a change.
				const doc = { [key]: value ?? "" } as unknown as FrappeDoc;
				const control = frappe.ui.form.make_control({
					df: {
						fieldname: key,
						fieldtype,
						...(options ? { options } : {}),
						placeholder: "—",
						change: () => this.onControlChange(key),
					},
					parent,
					doc,
					only_input: true,
					render_input: true,
				});
				if (control) this.controls[key] = markRaw(control);
			}
		},

		/**
		 * Put the stored values back into the controls after a read or save.
		 * A control the user is in is left alone unless `force` (a failed save)
		 * or it is one of `saved`, the fields a save just stored.
		 */
		syncControls(force = false, saved: ControlKey[] = []): void {
			for (const [key, control] of Object.entries(this.controls) as [ControlKey, BaseControl][]) {
				const focused = control.$wrapper.get(0)?.contains(document.activeElement);
				if (!force && focused && !saved.includes(key)) continue;
				const value = this.controlValue(key) ?? "";
				const doc = control.doc as Record<string, unknown> | undefined;
				if (!doc || (doc[key] === value && !force)) continue;
				doc[key] = value;
				control.refresh();
			}
		},

		/** A control's change event: save the field if it really changed. */
		onControlChange(key: ControlKey): void {
			const control = this.controls[key];
			if (!control || !this.detail) return;
			let value: string | number | null;
			if (key === "expected_hours") {
				const raw = String((control as unknown as ControlExtras).$input?.val() ?? "").trim();
				value = raw === "" ? null : Number(control.get_value()) || 0;
				if ((value ?? 0) === (this.detail.expected_hours ?? 0)) return;
			} else {
				value = (control.get_value() as string | null | undefined) || null;
				if (value === (this.controlValue(key) || null)) return;
			}
			this.save({ [key]: value });
		},

		// ── Description ───────────────────────────────────────

		editDescription(): void {
			this.editingDescription = true;
			nextTick(() => {
				const parent = this.$refs.descriptionEditor as HTMLElement | undefined;
				if (!parent) return;
				const control = frappe.ui.form.make_control({
					df: { fieldname: "description", fieldtype: "Text Editor" },
					parent,
					doc: { description: this.detail?.description ?? "" } as unknown as FrappeDoc,
					render_input: true,
				});
				if (!control) return;
				this.descriptionControl = markRaw(control);
				// Editors build their toolbar asynchronously; focus once they have.
				setTimeout(() => control.set_focus(), 50);
			});
		},

		async saveDescription(): Promise<void> {
			const control = this.descriptionControl;
			if (!control) return;
			const html = (control.get_value() as string | null | undefined) ?? "";
			if (html === (this.detail?.description ?? "")) {
				this.closeDescriptionEditor();
				return;
			}
			this.savingDescription = true;
			const ok = await this.save({ description: hasVisibleContent(html) ? html : null });
			this.savingDescription = false;
			if (ok) this.closeDescriptionEditor();
		},

		closeDescriptionEditor(): void {
			this.destroyDescriptionControl();
			this.editingDescription = false;
		},

		destroyDescriptionControl(): void {
			if (this.descriptionControl) destroyControl(this.descriptionControl);
			this.descriptionControl = null;
		},

		// ── Assignees ─────────────────────────────────────────

		async loadUsers(): Promise<void> {
			try {
				const directory = await fetchUsersOnce();
				this.users = directory.users;
				this.userImages = directory.images;
			} catch (err) {
				console.error("erpnext_taskview: failed to load users", err);
			}
		},

		avatar(email: string): string | undefined {
			return avatarUrl(this.userImages, email);
		},

		initials(email: string): string {
			return userInitials(this.users, email);
		},

		fullName(email: string): string {
			return userLabel(this.users, email);
		},

		async assign(user: string): Promise<void> {
			await this.withUserBusy(user, () => assignTask(this.node.doc.name, user));
		},

		async unassign(user: string): Promise<void> {
			await this.withUserBusy(user, () => unassignTask(this.node.doc.name, user));
		},

		async withUserBusy(user: string, call: () => Promise<unknown>): Promise<void> {
			this.busyUsers = [...this.busyUsers, user];
			try {
				this.applySnapshot((await call()) as GetResponse);
			} catch (error) {
				this.reportError(error);
			} finally {
				this.busyUsers = this.busyUsers.filter((u) => u !== user);
			}
		},

		// ── Child entry ───────────────────────────────────────

		/**
		 * `idx` for the next child: after every sibling (also those "My Tasks"
		 * hides) and after the last one added.  A method, not a computed: the
		 * queue keeps inserting after the panel unmounts, when computeds freeze.
		 */
		nextChildIdx(): number {
			const children = this.node.children ?? [];
			const maxIdx = children.reduce((max, c) => Math.max(max, c.doc.idx ?? 0), 0);
			return Math.max(children.length, maxIdx, this.minChildIdx, this.lastIdx) + 1;
		},

		/** Focus the child entry input; TaskView's start-typing shortcut seeds it with the key. */
		focusEntry(): HTMLInputElement | null {
			const input = (this.$el as HTMLElement).querySelector<HTMLInputElement>(".tv-panel__entry-input");
			input?.focus({ preventScroll: true });
			return input;
		},

		onEntryFocus(): void {
			focusedEntry = this.node.doc.name;
		},

		onEntryBlur(event: FocusEvent): void {
			// No related target: the element is going away (rebuild) or the click
			// landed on nothing focusable; keep the claim so a remount can refocus.
			if (event.relatedTarget) focusedEntry = null;
		},

		onEntryKeydown(event: KeyboardEvent): void {
			if (event.key === "Enter") {
				event.preventDefault();
				const subject = this.entryText.trim();
				this.entryText = "";
				if (subject) this.enqueue([subject]);
			} else if (event.key === "Escape") {
				// Escape on an empty entry closes the panel; otherwise it clears.
				if (this.entryText) event.stopPropagation();
				this.entryText = "";
				focusedEntry = null;
				(event.target as HTMLInputElement).blur();
			}
		},

		/** Pasting several lines adds one task per line, in order. */
		onEntryPaste(event: ClipboardEvent): void {
			const pasted = event.clipboardData?.getData("text") ?? "";
			if (!/[\r\n]/.test(pasted)) return;
			event.preventDefault();
			const input = event.target as HTMLInputElement;
			const value =
				input.value.slice(0, input.selectionStart ?? input.value.length) +
				pasted +
				input.value.slice(input.selectionEnd ?? input.value.length);
			this.entryText = "";
			this.enqueue(
				value
					.split(/\r?\n/)
					.map((s) => s.trim())
					.filter(Boolean),
			);
		},

		enqueue(subjects: string[]): void {
			for (const subject of subjects) {
				const key = `pending:${++this.pendingSeq}`;
				this.pending = [...this.pending, { key, subject }];
				this.queue = this.queue.then(() => this.createChild(key, subject));
			}
		},

		/**
		 * Insert one child.  `idx` appends it after the current children (the
		 * snapshot sorts by idx, so a bare insert would land at the top).
		 */
		async createChild(key: string, subject: string): Promise<void> {
			const parent = this.node.doc;
			const idx = this.nextChildIdx();
			this.lastIdx = idx;
			try {
				const data = await saveDoc(
					{
						doctype: "Task",
						subject,
						project: getProjectName(this.node),
						parent_task: this.isProject ? null : parent.name,
						status: "Open",
						priority: "Medium",
						idx,
					},
					undefined,
					undefined,
					this.viewMode === "my_tasks",
				);
				this.pending = this.pending.filter((p) => p.key !== key);
				// Show the new child under its parent.
				treeNodes.value[parent.name] = true;
				this.applySnapshot(data);
			} catch (error) {
				this.pending = this.pending.filter((p) => p.key !== key);
				if (this.$.isUnmounted) {
					// The panel closed meanwhile: name the subject, it has nowhere to go back to.
					this.reportError(`Couldn't add "${subject}": ${error}`);
					return;
				}
				// Hand the title back so it isn't lost, unless the user is typing another.
				if (!this.entryText) this.entryText = subject;
				this.reportError(error);
			}
		},

		// ── Panel ─────────────────────────────────────────────

		openSidebar(): void {
			this.$emit("open-sidebar", { doc: this.node.doc, isProject: this.isProject });
		},

		/**
		 * Keep every key inside the panel (see the template comment), and let
		 * Escape outside a field collapse it.
		 */
		onPanelKeydown(event: KeyboardEvent): void {
			event.stopPropagation();
			if (event.key !== "Escape" || event.defaultPrevented) return;
			const target = event.target as HTMLElement;
			if (target.closest("input, textarea, select, [contenteditable='true']")) {
				// The entry input handles its own Escape; an empty one collapses too.
				if (!target.classList.contains("tv-panel__entry-input")) return;
			}
			if (this.editingDescription) return;
			this.$emit("collapse");
		},
	},
});
</script>

<style scoped>
/* Body text and spacing follow Carbon's expandable data-table row; colours
   use Carbon tokens when carbon_theme is installed and the desk's own
   variables otherwise. */
.tv-panel {
	container-type: inline-size;
	padding-block: 0.5rem 1.5rem;
	padding-inline-end: 1rem;
	font-size: 14px;
	color: var(--cds-text-primary, var(--text-color));
	cursor: auto;
	/* Desk controls on the panel's grey: without carbon_theme --control-bg is
	   that same grey (and borderless), so use frappe's on-grey field colour. */
	--control-bg: var(--cds-field-02, var(--control-bg-on-gray));
}

.tv-panel__toolbar {
	display: flex;
	align-items: center;
	gap: 8px;
	min-height: 28px;
	margin-bottom: 0.5rem;
}

.tv-panel__actions {
	display: flex;
	gap: 2px;
	margin-left: auto;
}

.tv-panel__error {
	color: var(--cds-text-error, var(--red-600));
}

.tv-panel__muted {
	color: var(--cds-text-secondary, var(--text-muted));
}

.tv-panel__grid {
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: 1.5rem;
}

@container (min-width: 640px) {
	.tv-panel__grid {
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 2rem;
	}
}

.tv-panel__fields {
	display: grid;
	grid-template-columns: max-content minmax(0, 1fr);
	column-gap: 1.5rem;
	row-gap: 0.75rem;
	align-items: center;
	/* Rows keep their own height when the description column is the taller one. */
	align-content: start;
	margin: 0;
}

.tv-panel__fields dt,
.tv-panel__label {
	font-weight: var(--weight-semibold, 600);
	color: var(--cds-text-primary, var(--text-color));
}

.tv-panel__fields dt {
	align-self: start;
	/* Every value cell is at least one control tall, so centring the label's
	   first line in that height lines it up with the control's text. */
	padding-top: calc((var(--input-height, 28px) - 1lh) / 2);
}

.tv-panel__fields dd {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 6px 8px;
	min-height: var(--input-height, 28px);
	margin: 0;
}

.tv-status {
	display: inline-flex;
	align-items: center;
	gap: 6px;
}

.tv-status__dot {
	width: 8px;
	height: 8px;
	border-radius: var(--border-radius-full);
	background: var(--gray-500);
}

.tv-status__dot--blue {
	background: var(--cds-support-info, var(--blue-500));
}

.tv-status__dot--orange {
	background: var(--orange-500);
}

.tv-status__dot--purple {
	background: var(--purple-500);
}

.tv-status__dot--red {
	background: var(--cds-support-error, var(--red-500));
}

.tv-status__dot--green {
	background: var(--cds-support-success, var(--green-500));
}

/* ── Desk controls ──────────────────────────────────────────── */
.tv-panel__control {
	min-width: 0;
}

.tv-panel__control--date {
	width: 160px;
}

.tv-panel__control--select {
	width: 160px;
}

.tv-panel__control--hours {
	width: 88px;
}

.tv-panel__control :deep(.frappe-control),
.tv-panel__control :deep(.form-group) {
	margin-bottom: 0;
}

.tv-panel__budget {
	flex-direction: column;
	align-items: flex-start !important;
}

.tv-panel__estimate {
	display: flex;
	align-items: center;
	gap: 8px;
}

/* ── Assignees ──────────────────────────────────────────────── */
.tv-assignees {
	display: flex;
	flex-direction: column;
	gap: 4px;
	width: 100%;
	margin: 0;
	padding: 0;
	list-style: none;
}

.tv-assignee {
	display: flex;
	align-items: center;
	gap: 8px;
	min-width: 0;
}

.tv-assignee__avatar {
	width: 24px;
	height: 24px;
	border-radius: var(--border-radius-full);
	object-fit: cover;
	flex-shrink: 0;
}

.tv-assignee__avatar--initials {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	background: var(--gray-300);
	color: var(--text-on-gray);
	font-size: 10px;
	font-weight: var(--weight-semibold);
}

.tv-assignee__name {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

/* ── Description ────────────────────────────────────────────── */
.tv-panel__description {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	min-width: 0;
}

.tv-panel__description-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-height: 28px;
}

.tv-panel__rich {
	padding: 0;
	max-height: 320px;
	overflow: auto;
	font-size: 14px;
	overflow-wrap: anywhere;
}

/* Quill marks its own lists with data-list; plain <ul>/<ol> (API or legacy
   content) would otherwise lose their markers to .ql-editor's list reset. */
.tv-panel__rich :deep(ul > li:not([data-list])) {
	list-style-type: disc;
}

.tv-panel__rich :deep(ol > li:not([data-list])) {
	list-style-type: decimal;
}

.tv-panel__rich :deep(p:last-child) {
	margin-bottom: 0;
}

.tv-panel__empty {
	display: flex;
	align-items: center;
	gap: 8px;
}

.tv-panel__editor :deep(.frappe-control) {
	margin-bottom: 0;
}

.tv-panel__editor :deep(.control-label) {
	display: none;
}

.tv-panel__editor-actions {
	display: flex;
	gap: 8px;
}

/* ── Child entry (cf. PinnedView's quick entry) ─────────────── */
.tv-panel__entry-block {
	margin-top: 1rem;
}

.tv-panel__entry,
.tv-panel__pending {
	display: flex;
	align-items: center;
	gap: 10px;
	min-width: 0;
	min-height: 28px;
}

.tv-panel__entry-icon {
	flex-shrink: 0;
	margin: 0 2px;
	color: var(--text-light);
}

.tv-panel__entry-input {
	flex-grow: 1;
	min-width: 0;
	padding: 2px 0;
	border: none;
	border-bottom: 1px dashed var(--cds-border-subtle, var(--border-color));
	outline: none;
	background: transparent;
	color: var(--text-color);
	font-size: var(--text-md);
}

.tv-panel__entry-input:focus {
	border-bottom: 1px solid var(--cds-focus, var(--primary));
}

.tv-panel__pending {
	color: var(--text-muted);
}

.tv-panel__pending-subject {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.tv-panel__spinner {
	flex-shrink: 0;
	box-sizing: border-box;
	width: 16px;
	height: 16px;
	margin: 0 2px;
	border: 2px solid var(--border-color);
	border-top-color: var(--text-muted);
	border-radius: var(--border-radius-full);
	animation: tv-panel-spin 0.8s linear infinite;
}

@keyframes tv-panel-spin {
	to {
		transform: rotate(360deg);
	}
}

@media (prefers-reduced-motion: reduce) {
	.tv-panel__spinner {
		animation-duration: 2.4s;
	}
}
</style>
