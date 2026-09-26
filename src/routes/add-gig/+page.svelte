<script lang="ts">
	import { account } from '$lib/state/account.svelte';

	let gigName = $state('');
	let gigDate = $state('');
	let amountEarned = $state<number | ''>('');
	let gigExpense = $state<number | ''>('');
	let notes = $state('');
	let savedMessage = $state('');
	const planPreview = $derived(
		account.getPlanPreview(
			Number(amountEarned) || 0,
			Number(gigExpense) || 0,
			gigDate || new Date().toISOString()
		)
	);

	function saveGig() {
		const cleanedName = gigName.trim() || 'New Gig';
		const cleanedAmount = Number(amountEarned) || 0;

		account.addGig({
			name: cleanedName,
			date: gigDate || new Date().toISOString().slice(0, 10),
			amount: cleanedAmount,
			gigExpense: Number(gigExpense) || 0,
			notes: notes.trim() || undefined
		});

		savedMessage = `${cleanedName} added to your income.`;
		gigName = '';
		gigDate = '';
		amountEarned = '';
		gigExpense = '';
		notes = '';
	}
</script>

<section class="page-shell">
	<div class="card form-card">
		<div class="page-header">
			<h1>Add a new gig</h1>
		</div>

		<form
			class="gig-form"
			onsubmit={(event) => {
				event.preventDefault();
				saveGig();
			}}
		>
			<label>
				<span>Gig name</span>
				<input type="text" placeholder="e.g. Wedding ceremony" bind:value={gigName} />
			</label>

			<label>
				<span>Date</span>
				<input type="date" bind:value={gigDate} />
			</label>

			<label>
				<span>Amount earned</span>
				<input type="number" min="0" placeholder="$0" bind:value={amountEarned} />
			</label>

			<label>
				<span>Gig expenses</span>
				<input type="number" min="0" placeholder="$0" bind:value={gigExpense} />
			</label>

			<label>
				<span>Notes (optional)</span>
				<textarea rows="4" placeholder="Add a note about this gig" bind:value={notes}></textarea>
			</label>

			<section class="allocation-section">
				<div class="allocation-header">
					<div>
						<h2>Plan for this gig</h2>
						<p>Bills come first, then taxes, goals, and safe-to-spend money.</p>
					</div>
					<strong>{Math.round(account.goalAllocationPercent)}% to goals</strong>
				</div>
				<div class="plan-list">
					<div>
						<span>Net income</span><strong>${planPreview.summary.netIncome.toLocaleString()}</strong
						>
					</div>
					<div>
						<span>Tax reserve</span><strong
							>${planPreview.summary.taxReserve.toLocaleString()}</strong
						>
					</div>
					<div>
						<span>Bills paid</span><strong
							>${planPreview.summary.billPayment.toLocaleString()}</strong
						>
					</div>
					<div>
						<span>Slow-month reserve</span><strong
							>${planPreview.summary.slowMonthReserve.toLocaleString()}</strong
						>
					</div>
					<div>
						<span>Goal savings</span><strong
							>${planPreview.summary.goalReserve.toLocaleString()}</strong
						>
					</div>
					<div class="safe-line">
						<span>Safe to spend</span><strong
							>${planPreview.summary.safeToSpend.toLocaleString()}</strong
						>
					</div>
				</div>
			</section>

			<button type="submit">Save to Spend</button>
			{#if savedMessage}
				<p class="save-message">{savedMessage}</p>
			{/if}
		</form>
	</div>
</section>

<style>
	.page-shell {
		display: flex;
		justify-content: center;
		padding: 0.25rem 0 1rem;
	}

	.card {
		width: min(100%, 640px);
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 8px;
		padding: 1.25rem;
	}

	.page-header {
		margin-bottom: 1rem;
	}

	h1 {
		margin: 0;
		font-size: clamp(2rem, 3vw, 2.6rem);
		color: var(--ink);
		letter-spacing: -0.05em;
	}

	.gig-form {
		display: grid;
		gap: 1rem;
	}

	.allocation-section {
		display: grid;
		gap: 0.8rem;
		padding: 0.9rem;
		border: 1px solid var(--line);
		border-radius: 6px;
		background: var(--surface-muted);
	}

	.allocation-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.allocation-header h2 {
		margin: 0 0 0.2rem;
		font-size: 0.95rem;
		color: var(--ink);
	}

	.allocation-header p {
		margin: 0;
		font-size: 0.75rem;
		color: var(--muted);
	}

	.allocation-header > strong {
		white-space: nowrap;
		font-size: 0.8rem;
		color: var(--sage-strong);
	}

	.plan-list {
		display: grid;
		gap: 0.45rem;
	}

	.plan-list div {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.45rem 0;
		border-bottom: 1px solid var(--line);
		font-size: 0.75rem;
		color: var(--muted);
	}

	.plan-list strong {
		color: var(--ink);
	}

	.plan-list .safe-line {
		padding: 0.6rem;
		border: 0;
		border-radius: 0.5rem;
		background: var(--sage);
		font-weight: 700;
	}

	label {
		display: grid;
		gap: 0.45rem;
		font-size: 0.82rem;
		color: var(--muted);
	}

	input,
	textarea {
		border: 1px solid var(--line);
		background: var(--surface);
		border-radius: 0.8rem;
		padding: 0.8rem 0.9rem;
		font: inherit;
		color: var(--ink);
	}

	button {
		border: none;
		background: var(--action);
		color: white;
		padding: 0.85rem 1rem;
		border-radius: 0.9rem;
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.save-message {
		margin: 0;
		font-size: 0.9rem;
		color: var(--ink);
	}
</style>
