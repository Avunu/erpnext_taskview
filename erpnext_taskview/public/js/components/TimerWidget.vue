<template>
	<div class="timer-widget"
		:class="{ 'timer-widget--running': !timer.paused, 'timer-widget--paused': !!timer.paused, 'timer-widget--expanded': expanded }">
		<div class="timer-widget__header" @click="toggleExpanded">
			<div class="timer-widget__info">
				<span class="timer-widget__project">{{ timer.project_name || timer.project }}</span>
				<span class="timer-widget__task">{{ timer.task_subject || timer.task }}</span>
			</div>
			<div class="timer-widget__time">
				{{ elapsedDisplay }}
			</div>
			<div class="timer-widget__controls" @click.stop>
				<button class="task-btn" :class="timer.paused ? 'task-btn--resume' : 'task-btn--pause'"
					@click="togglePause" :title="timer.paused ? 'Resume' : 'Pause'">
					{{ timer.paused ? '▶' : '⏸' }}
				</button>
				<button class="task-btn task-btn--stop" @click="stopTimer" title="Stop">
					⏹
				</button>
				<button class="task-btn task-btn--delete" @click="discardTimer" title="Discard timer">
					🗑
				</button>
			</div>
		</div>
		<div v-if="expanded" class="timer-widget__detail">
			<textarea v-model="description" class="timer-widget__description" placeholder="What are you working on?"
				rows="2" @input="scheduleDescriptionSave" @blur="persistDescription"></textarea>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { type ActiveTimer, sendTimerAction, getRunningTimer, saveTimerDescription } from '../timerStore';
import '../task-controls.css';

/**
 * Individual timer card within the {@link TimerDock}.
 *
 * Displays task/project name, a live elapsed clock, and pause/resume/stop
 * controls.  When expanded, shows a textarea for editing the work
 * description which is persisted on stop.
 *
 * @emits error - When a backend call fails.
 */
export default defineComponent({
	name: 'TimerWidget',
	props: {
		/** The enriched active timer record from the global store. */
		timer: {
			type: Object as PropType<ActiveTimer>,
			required: true,
		},
	},
	emits: ['error'],

	data() {
		return {
			/** Whether the detail/description panel is open. */
			expanded: false,
			/** Local copy of description for editing. */
			description: this.timer.description || '',
			/** Interval handle for the live clock. */
			tickInterval: null as ReturnType<typeof setInterval> | null,
			/** Current tick timestamp for elapsed calculation. */
			now: Date.now(),
			/** Debounce timer for persisting description. */
			descDebounce: null as ReturnType<typeof setTimeout> | null,
		};
	},

	computed: {
		/**
		 * Live elapsed time display string (HH:MM:SS).
		 *
		 * For running timers: accumulated paused seconds + current segment.
		 * For paused timers: just the accumulated paused seconds.
		 */
		elapsedDisplay(): string {
			const pausedSec = this.timer.paused_time_in_seconds || 0;
			let totalSeconds = pausedSec;

			if (!this.timer.paused && this.timer.start_time) {
				const segmentMs = this.now - new Date(this.timer.start_time).getTime();
				totalSeconds += Math.max(0, Math.floor(segmentMs / 1000));
			}

			const h = Math.floor(totalSeconds / 3600);
			const m = Math.floor((totalSeconds % 3600) / 60);
			const s = totalSeconds % 60;
			return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
		},
	},

	watch: {
		'timer.description'(val: string) {
			this.description = val || '';
		},
	},

	mounted() {
		this.startTick();
	},

	beforeUnmount() {
		this.stopTick();
		if (this.descDebounce !== null) {
			clearTimeout(this.descDebounce);
			this.descDebounce = null;
		}
	},

	methods: {
		/** Start the 1-second interval for the live clock. */
		startTick(): void {
			this.stopTick();
			this.tickInterval = setInterval(() => {
				this.now = Date.now();
			}, 1000);
		},

		/** Clear the tick interval. */
		stopTick(): void {
			if (this.tickInterval !== null) {
				clearInterval(this.tickInterval);
				this.tickInterval = null;
			}
		},

		/** Toggle the expanded detail panel. */
		toggleExpanded(): void {
			this.expanded = !this.expanded;
		},

		/**
		 * Toggle between pause and resume.
		 *
		 * When resuming, auto-pauses any other running timer first.
		 */
		async togglePause(): Promise<void> {
			try {
				if (this.timer.paused) {
					// Resume — pause any other running timer first
					const running = getRunningTimer();
					if (running && running.name !== this.timer.name) {
						await sendTimerAction({ name: running.name, paused: 1 });
					}
					await sendTimerAction({ name: this.timer.name, paused: 0 });
				} else {
					await sendTimerAction({ name: this.timer.name, paused: 1 });
				}
			} catch (err) {
				this.$emit('error', err);
			}
		},

		/**
		 * Stop the timer.
		 *
		 * Sends the stop signal with the current description.
		 */
		async stopTimer(): Promise<void> {
			try {
				await sendTimerAction({
					name: this.timer.name,
					to_time: new Date().toISOString(),
					description: this.description,
				});
			} catch (err) {
				this.$emit('error', err);
			}
		},

		/**
		 * Debounced save of description to the backend.
		 * Limits saves to at most once every 30 seconds.
		 */
		scheduleDescriptionSave(): void {
			if (this.descDebounce !== null) return; // already scheduled
			this.descDebounce = setTimeout(() => {
				this.descDebounce = null;
				this.persistDescription();
			}, 30_000);
		},

		/** Immediately persist the current description to the backend. */
		async persistDescription(): Promise<void> {
			try {
				await saveTimerDescription(this.timer.name, this.description);
			} catch (err) {
				this.$emit('error', err);
			}
		},

		/** Discard the timer entirely (delete the Timesheet Detail row). */
		async discardTimer(): Promise<void> {
			try {
				await sendTimerAction({ name: this.timer.name, delete: 1 });
			} catch (err) {
				this.$emit('error', err);
			}
		},
	},
});
</script>
