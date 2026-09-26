<script lang="ts">
	import { resolve } from '$app/paths';
	import { account, type GigAllocation } from '$lib/state/account.svelte';
	import Calendar from '$lib/components/dashboard/calendar.svelte';
	import MoneyOverview from '$lib/components/dashboard/money-overview.svelte';

	const formatCurrency = (value: number) =>
		`$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

	const upcomingGigs = $derived(
		account.gigs.filter((gig) => gigDateKey(gig.date) >= dateKey(new Date()))
	);

	function dateKey(date: Date): string {
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
	}

	function gigDateKey(value: string): string {
		if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
		return dateKey(new Date(value));
	}

	let editingGigId = $state<number | null>(null);
	let editGigName = $state('');
	let editGigDate = $state('');
	let editGigAmount = $state(0);
	let editGigExpense = $state(0);
	let editGigNotes = $state('');
	let editAllocations = $state<Record<number, number>>({});
	let editMessage = $state('');

	const editAllocatedAmount = $derived(
		Object.values(editAllocations).reduce((total, amount) => total + (Number(amount) || 0), 0)
	);
	const editAmountLeft = $derived(Number(editGigAmount) - editAllocatedAmount);

	function startEditingGig(gig: (typeof upcomingGigs)[number]): void {
		editingGigId = gig.id;
		editGigName = gig.name;
		editGigDate = gig.date;
		editGigAmount = gig.amount;
		editGigExpense = gig.gigExpense ?? 0;
		editGigNotes = gig.notes ?? '';
		editAllocations = Object.fromEntries(
			(gig.allocations ?? []).map((allocation) => [allocation.goalId, allocation.amount])
		);
		editMessage = '';
	}

	function updateEditAllocation(goalId: number, value: string): void {
		editAllocations[goalId] = Number(value) || 0;
		editMessage = '';
	}

	function saveGigEdit(): void {
		if (editingGigId === null) return;
		if (editAmountLeft < 0) {
			editMessage = 'Allocations cannot be more than the gig amount.';
			return;
		}

		const allocations: GigAllocation[] = Object.entries(editAllocations)
			.filter(([, amount]) => Number(amount) > 0)
			.map(([goalId, amount]) => ({ goalId: Number(goalId), amount: Number(amount) }));

		account.updateGig(editingGigId, {
			name: editGigName.trim() || 'New Gig',
			date: editGigDate || new Date().toISOString().slice(0, 10),
			amount: Number(editGigAmount) || 0,
			gigExpense: Number(editGigExpense) || 0,
			notes: editGigNotes.trim() || undefined,
			allocations
		});
		editingGigId = null;
	}

	function cancelGigEdit(): void {
		editingGigId = null;
	}

	function deleteGig(gig: (typeof upcomingGigs)[number]): void {
		if (window.confirm(`Delete ${gig.name}? This will also undo its goal allocations.`)) {
			account.deleteGig(gig.id);
			if (editingGigId === gig.id) cancelGigEdit();
		}
	}
</script>

<div class="dashboard-shell">
	<section class="main-panel">
		<MoneyOverview />

		<Calendar />
	</section>

	<aside class="side-panel">
		<div class="section-head">
			<h2>Upcoming Gigs</h2>
		</div>

		<div class="gig-list">
			{#each upcomingGigs as gig (gig.id)}
				<div class="gig-row">
					<div>
						<span>{gig.date}</span>
						<strong>{gig.name}</strong>
					</div>
					<div class="gig-actions">
						<strong>{formatCurrency(gig.amount)}</strong>
						<button type="button" onclick={() => startEditingGig(gig)}>Edit allocation</button>
						<button type="button" class="delete-button" onclick={() => deleteGig(gig)}
							>Delete</button
						>
					</div>
				</div>
				{#if editingGigId === gig.id}
					<form
						class="gig-editor"
						onsubmit={(event) => {
							event.preventDefault();
							saveGigEdit();
						}}
					>
						<label>Name <input type="text" bind:value={editGigName} /></label>
						<label>Date <input type="date" bind:value={editGigDate} /></label>
						<label>Amount <input type="number" min="0" bind:value={editGigAmount} /></label>
						<label>Expenses <input type="number" min="0" bind:value={editGigExpense} /></label>
						<label>Notes <input type="text" bind:value={editGigNotes} /></label>
						<div class="allocation-editor">
							<strong>${Math.max(editAmountLeft, 0).toLocaleString()} left to allocate</strong>
							{#each account.goals as goal (goal.id)}
								<label>
									<span>{goal.name}</span>
									<input
										type="number"
										min="0"
										value={editAllocations[goal.id] ?? 0}
										oninput={(event) => updateEditAllocation(goal.id, event.currentTarget.value)}
									/>
								</label>
							{/each}
						</div>
						<div class="editor-actions">
							<button type="submit">Save changes</button>
							<button type="button" onclick={cancelGigEdit}>Cancel</button>
						</div>
						{#if editMessage}<small class="edit-error">{editMessage}</small>{/if}
					</form>
				{/if}
			{/each}
			{#if upcomingGigs.length === 0}
				<div class="empty-gigs">
					<p>Your next gig will show up here.</p>
					<a href={resolve('/add-gig')}>Add your first gig <span aria-hidden="true">↗</span></a>
				</div>
			{/if}
		</div>
	</aside>
</div>

<style>
	.dashboard-shell {
		display: grid;
		grid-template-columns: minmax(0, 1.7fr) minmax(320px, 0.9fr);
		gap: clamp(1.5rem, 3vw, 2.5rem);
		max-width: 1250px;
		margin: 0 auto;
	}

	.main-panel,
	.side-panel {
		min-width: 0;
	}

	.main-panel {
		padding: 0;
	}

	.side-panel {
		padding: 0.65rem 0 0;
		border-top: 2px solid var(--ink);
	}

	.side-panel .section-head {
		padding: 0.75rem 0 1rem;
		border-bottom: 1px solid var(--line);
	}

	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 0 0.2rem;
	}

	h2 {
		margin: 0;
		color: var(--ink);
		font-weight: 700;
		letter-spacing: -0.02em;
		font-size: 1.15rem;
	}

	.gig-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.empty-gigs {
		margin: 0.4rem 0 0;
		padding: 1.1rem 0.25rem;
		font-size: 0.86rem;
		color: var(--muted);
	}

	.empty-gigs p {
		margin: 0 0 0.65rem;
	}

	.empty-gigs a {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		color: var(--sage-strong);
		font-size: 0.8rem;
		font-weight: 700;
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
	}

	.gig-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding: 0.9rem 0;
		border-bottom: 1px solid var(--line);
		font-size: 0.9rem;
		color: var(--ink);
	}

	.gig-row div {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.gig-row span {
		font-size: 0.72rem;
		color: var(--muted);
	}

	.gig-row strong {
		font-size: 0.97rem;
	}

	.gig-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.gig-actions button,
	.editor-actions button {
		border: 1px solid var(--line);
		border-radius: 0.5rem;
		padding: 0.4rem 0.55rem;
		background: var(--blue-wash);
		color: var(--blue-ink);
		font: inherit;
		font-size: 0.68rem;
		font-weight: 700;
		cursor: pointer;
	}

	.gig-actions button.delete-button {
		background: var(--coral-wash);
		color: var(--coral);
	}

	.gig-editor {
		display: grid;
		gap: 0.6rem;
		padding: 0.8rem;
		border-top: 1px solid var(--line);
		background: var(--surface-muted);
	}

	.gig-editor > label {
		display: grid;
		gap: 0.25rem;
		font-size: 0.7rem;
		color: var(--muted);
	}

	.gig-editor input {
		min-width: 0;
		border: 1px solid var(--line);
		border-radius: 0.5rem;
		padding: 0.45rem;
		background: white;
		font: inherit;
		font-size: 0.75rem;
		color: var(--ink);
	}

	.allocation-editor {
		display: grid;
		gap: 0.45rem;
		padding: 0.65rem;
		border-radius: 0.65rem;
		background: var(--sage);
	}

	.allocation-editor > strong {
		font-size: 0.75rem;
		color: var(--sage-strong);
	}

	.allocation-editor label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		font-size: 0.7rem;
		color: var(--muted);
	}

	.allocation-editor label input {
		width: 5rem;
	}

	.editor-actions {
		display: flex;
		gap: 0.45rem;
	}

	.editor-actions button:first-child {
		background: var(--action);
		color: white;
	}

	.edit-error {
		font-size: 0.72rem;
		color: var(--coral);
	}

	@media (max-width: 900px) {
		.dashboard-shell {
			grid-template-columns: 1fr;
		}
	}
</style>
