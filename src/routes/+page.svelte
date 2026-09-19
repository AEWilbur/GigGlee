<script lang="ts">
	import { account, type GigAllocation } from '$lib/state/account.svelte';
	import Calendar from '$lib/components/dashboard/calendar.svelte';
	import Snapshot from '$lib/components/dashboard/snapshot.svelte';

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
	<!-- Main dashboard panel -->
	<section class="main-panel">
		<Snapshot />

		<Calendar />
	</section>

	<!-- Sidebar list of upcoming gigs -->
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
						<label>Date <input type="text" bind:value={editGigDate} /></label>
						<label>Amount <input type="number" min="0" bind:value={editGigAmount} /></label>
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
				<p class="empty-gigs">No upcoming gigs.</p>
			{/if}
		</div>
	</aside>
</div>

<style>
	.dashboard-shell {
		display: grid;
		grid-template-columns: minmax(0, 1.7fr) minmax(320px, 0.9fr);
		gap: 1rem;
		max-width: 1250px;
		margin: 0 auto;
	}

	.main-panel,
	.side-panel {
		background: #ffffff;
		border: 1px solid #ded5e8;
		border-radius: 8px;
		padding: 1.1rem;
	}

	.main-panel {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}

	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 0 0.2rem;
	}

	h1,
	h2 {
		margin: 0;
		color: #2d2340;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	h1 {
		font-size: clamp(1.8rem, 2vw, 2.25rem);
	}

	h2 {
		font-size: 1.15rem;
	}

	.overview-card {
		display: grid;
		gap: 1rem;
		padding: 1.1rem;
		border: 1px solid #c5d5e7;
		border-radius: 8px;
		background: #e1efe4;
	}

	.overview-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e4dfeb;
	}

	.overview-heading h1 {
		font-size: clamp(1.8rem, 3vw, 2.3rem);
	}

	.safe-amount {
		display: grid;
		gap: 0.15rem;
		text-align: right;
	}

	.safe-amount span {
		font-size: 0.72rem;
		color: rgba(45, 35, 64, 0.65);
	}

	.safe-amount strong {
		font-size: clamp(1.7rem, 4vw, 2.7rem);
		color: #2f8f5b;
	}

	.overview-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
	}

	.overview-stats div {
		display: grid;
		gap: 0.2rem;
		padding: 0.65rem;
		border-radius: 6px;
		border: 1px solid rgba(80, 67, 100, 0.1);
		background: rgba(255, 255, 255, 0.82);
	}

	.overview-stats span {
		font-size: 0.68rem;
		color: rgba(45, 35, 64, 0.65);
	}

	.overview-stats strong {
		font-size: 0.95rem;
		color: #2d2340;
	}

	.progress-heading {
		margin-bottom: 1rem;
	}

	.progress-heading > strong {
		font-size: 0.82rem;
		color: #2d2340;
	}

	.progress-heading h2 {
		font-size: 1.15rem;
	}

	.saved-line {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0.8rem;
		font-size: 0.76rem;
		color: rgba(45, 35, 64, 0.7);
	}

	.saved-line strong {
		color: #2d2340;
	}

	.progress-list {
		display: grid;
		gap: 0.75rem;
	}

	.progress-item {
		display: grid;
		gap: 0.35rem;
	}

	.progress-item > div:first-child {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.76rem;
		color: rgba(45, 35, 64, 0.72);
	}

	.progress-item strong {
		color: #2d2340;
	}

	.progress-track {
		height: 0.55rem;
		overflow: hidden;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.65);
	}

	.progress-track span {
		display: block;
		height: 100%;
		border-radius: inherit;
	}

	.bills-bar {
		background: #3c9a70;
	}
	.reserve-bar {
		background: #8b7a55;
	}
	.goals-bar {
		background: #2f8f5b;
	}

	.gig-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.empty-gigs {
		margin: 0;
		padding: 1rem 0.5rem;
		font-size: 0.8rem;
		color: #526579;
	}

	.gig-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		background: #f5f5f2;
		border: 1px solid #c9d8e8;
		border-radius: 6px;
		padding: 0.8rem 0.75rem;
		font-size: 0.9rem;
		color: #2d2340;
	}

	.gig-row div {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.gig-row span {
		font-size: 0.72rem;
		color: rgba(45, 35, 64, 0.7);
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
		border: 1px solid #c9bdd8;
		border-radius: 0.5rem;
		padding: 0.4rem 0.55rem;
		background: rgba(125, 103, 216, 0.1);
		color: #245b9f;
		font: inherit;
		font-size: 0.68rem;
		font-weight: 700;
		cursor: pointer;
	}

	.gig-actions button.delete-button {
		background: #fff0f0;
		color: #a44d4d;
	}

	.gig-editor {
		display: grid;
		gap: 0.6rem;
		padding: 0.8rem;
		border: 1px solid rgba(80, 67, 100, 0.08);
		border-radius: 0.9rem;
		background: #fffaf0;
	}

	.gig-editor > label {
		display: grid;
		gap: 0.25rem;
		font-size: 0.7rem;
		color: #453a59;
	}

	.gig-editor input {
		min-width: 0;
		border: 1px solid rgba(80, 67, 100, 0.14);
		border-radius: 0.5rem;
		padding: 0.45rem;
		background: white;
		font: inherit;
		font-size: 0.75rem;
		color: #2d2340;
	}

	.allocation-editor {
		display: grid;
		gap: 0.45rem;
		padding: 0.65rem;
		border-radius: 0.65rem;
		background: rgba(223, 238, 207, 0.55);
	}

	.allocation-editor > strong {
		font-size: 0.75rem;
		color: #245b9f;
	}

	.allocation-editor label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		font-size: 0.7rem;
		color: #453a59;
	}

	.allocation-editor label input {
		width: 5rem;
	}

	.editor-actions {
		display: flex;
		gap: 0.45rem;
	}

	.editor-actions button:first-child {
		background: #2f6fbd;
		color: white;
	}

	.edit-error {
		font-size: 0.72rem;
		color: #9a4b56;
	}

	@media (max-width: 900px) {
		.dashboard-shell {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 620px) {
		.overview-heading {
			align-items: flex-start;
			flex-direction: column;
		}

		.safe-amount {
			text-align: left;
		}

		.overview-stats {
			grid-template-columns: 1fr;
		}
	}
</style>
