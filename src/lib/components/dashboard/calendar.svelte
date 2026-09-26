<script lang="ts">
	import { account } from '$lib/state/account.svelte';
	const formatCurrency = (value: number) =>
		`$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

	let calendarMonth = $state(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
	let selectedDate = $state('');
	const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	function dateKey(date: Date): string {
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
	}

	function gigDateKey(value: string): string {
		if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
		return dateKey(new Date(value));
	}

	function gigsForDate(key: string) {
		return account.gigs.filter((gig) => gigDateKey(gig.date) === key);
	}

	const calendarDays = $derived.by(() => {
		const year = calendarMonth.getFullYear();
		const month = calendarMonth.getMonth();
		const days: Array<{ key: string; number: number; gigs: typeof account.gigs }> = [];
		const firstDay = new Date(year, month, 1).getDay();
		const daysInMonth = new Date(year, month + 1, 0).getDate();

		for (let index = 0; index < firstDay; index += 1) {
			days.push({ key: `empty-${index}`, number: 0, gigs: [] });
		}

		for (let day = 1; day <= daysInMonth; day += 1) {
			const key = dateKey(new Date(year, month, day));
			days.push({ key, number: day, gigs: gigsForDate(key) });
		}

		return days;
	});

	const selectedGigs = $derived(selectedDate ? gigsForDate(selectedDate) : []);
	const todayKey = dateKey(new Date());
	const calendarTitle = $derived(
		calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
	);

	function changeMonth(offset: number): void {
		calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + offset, 1);
	}
</script>

<section class="calendar-card">
	<div class="section-head">
		<div>
			<h2>Gig calendar</h2>
			<span>{calendarTitle}</span>
		</div>
		<div class="calendar-buttons">
			<button type="button" aria-label="Previous month" onclick={() => changeMonth(-1)}
				>&lsaquo;</button
			>
			<button type="button" aria-label="Next month" onclick={() => changeMonth(1)}>&rsaquo;</button>
		</div>
	</div>
	<div class="calendar-grid">
		{#each weekdays as weekday (weekday)}
			<span class="weekday">{weekday}</span>
		{/each}
		{#each calendarDays as day (day.key)}
			{#if day.number === 0}
				<span class="calendar-empty"></span>
			{:else}
				<button
					type="button"
					class:has-gig={day.gigs.length > 0}
					class:selected={selectedDate === day.key}
					class:today={day.key === todayKey}
					aria-label={`${calendarMonth.toLocaleDateString(undefined, { month: 'long' })} ${day.number}${day.gigs.length ? `, ${day.gigs.length} gigs` : ''}`}
					onclick={() => (selectedDate = day.key)}
				>
					{day.number}
					{#if day.gigs.length > 0}<span class="calendar-dot"></span>{/if}
				</button>
			{/if}
		{/each}
	</div>
	<div class="calendar-details">
		{#if selectedDate}
			<strong>{selectedDate}</strong>
			{#if selectedGigs.length > 0}
				{#each selectedGigs as gig (gig.id)}
					<div class="calendar-gig">
						<span>{gig.name}</span>
						<strong>{formatCurrency(gig.amount)}</strong>
					</div>
				{/each}
			{:else}
				<span>No gigs booked for this day.</span>
			{/if}
		{:else}
			<span>Select a day to see what’s booked.</span>
		{/if}
	</div>
</section>

<style>
	.calendar-card {
		display: grid;
		gap: 0.85rem;
		padding: 1.4rem 0 0;
		border-top: 1px solid var(--line);
	}

	.calendar-buttons {
		display: flex;
		gap: 0.35rem;
	}

	.calendar-buttons button {
		width: 2rem;
		height: 2rem;
		border: 1px solid var(--line);
		border-radius: 0.55rem;
		background: var(--surface);
		color: var(--ink);
		font-size: 1.2rem;
		line-height: 1;
		cursor: pointer;
	}

	.calendar-grid {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: 0.3rem;
	}

	.weekday {
		padding: 0.2rem 0;
		text-align: center;
		font-size: 0.65rem;
		font-weight: 700;
		color: var(--muted);
	}

	.calendar-empty,
	.calendar-grid button {
		height: clamp(3rem, 5vw, 4rem);
	}

	.calendar-grid button {
		position: relative;
		border: 1px solid var(--line);
		border-radius: 0.7rem;
		background: var(--surface);
		color: var(--ink);
		font: inherit;
		font-size: 0.82rem;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease,
			transform 0.15s ease;
	}

	.calendar-grid button:hover {
		transform: translateY(-1px);
	}

	.calendar-grid button.today:not(.selected) {
		border-color: var(--coral);
		box-shadow: inset 0 0 0 1px var(--coral);
	}

	.calendar-grid button.has-gig {
		background: var(--sage);
		border-color: var(--sage-strong);
		font-weight: 700;
	}

	.calendar-grid button.selected,
	.calendar-grid button:hover {
		border-color: var(--action);
		background: var(--blue-wash);
	}

	.calendar-grid button.today.selected {
		border-color: var(--coral);
		background: var(--coral-wash);
	}

	.calendar-dot {
		position: absolute;
		bottom: 0.28rem;
		left: 50%;
		width: 0.28rem;
		height: 0.28rem;
		border-radius: 50%;
		background: var(--sage-strong);
		transform: translateX(-50%);
	}

	.calendar-details {
		display: grid;
		gap: 0.45rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--line);
		font-size: 0.75rem;
		color: var(--muted);
	}

	.calendar-gig {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.55rem 0.65rem;
		border-radius: 0.55rem;
		background: var(--surface-muted);
		color: var(--ink);
	}

	h2 {
		margin: 0;
		color: var(--ink);
		font-weight: 700;
		letter-spacing: -0.02em;
		font-size: 1.15rem;
	}

	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 0 0.2rem;
	}
</style>
