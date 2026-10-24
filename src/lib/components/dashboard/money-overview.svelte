<script lang="ts">
	import { account } from '$lib/state/account.svelte';

	const monthlyProgress = $derived(account.getMonthlyProgress());
	const safeToSpend = $derived(account.getSafeToSpend());
	const hasGigs = $derived(account.gigs.length > 0);

	const formatCurrency = (amount: number) =>
		`$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
</script>

<section class="overview-card" aria-label="Money overview">
	<div class="overview-heading">
		<h1>Hi, {account.username}!</h1>
		<span class="month-label">{monthlyProgress.month}</span>
	</div>

	<div class="overview-content">
		<div class="spending-block">
			<span class="spending-label">Safe to spend</span>
			<strong>{hasGigs ? formatCurrency(safeToSpend) : '—'}</strong>
			<p>
				{hasGigs
					? 'After bills, tax and savings have had their share.'
					: 'Log a gig to see what is left after your plan.'}
			</p>
		</div>

		<section class="plan-section" aria-labelledby="plan-title">
			<div class="plan-heading">
				<h2 id="plan-title">This month's plan</h2>
				{#if hasGigs}<span>{formatCurrency(monthlyProgress.income)} take-home</span>{/if}
			</div>

			{#if hasGigs}
				<dl class="plan-list">
					<div class="plan-row">
						<dt>Must-pay funded</dt>
						<dd>{formatCurrency(monthlyProgress.billsPaid)}</dd>
					</div>
					<div class="plan-row">
						<dt>Tax set aside</dt>
						<dd>{formatCurrency(monthlyProgress.taxes)}</dd>
					</div>
					<div class="plan-row">
						<dt>Nice-to-have funded</dt>
						<dd>{formatCurrency(monthlyProgress.niceToHavePaid)}</dd>
					</div>
					<div class="plan-row">
						<dt>Slow-month cushion</dt>
						<dd>{formatCurrency(monthlyProgress.slowMonthReserve)}</dd>
					</div>
					<div class="plan-row">
						<dt>Goals funded</dt>
						<dd>{formatCurrency(monthlyProgress.goalSavings)}</dd>
					</div>
				</dl>
			{:else}
				<p class="empty-plan">
					Once you add a gig, you'll see how its take-home pay is split between bills, tax, savings
					and spending.
				</p>
			{/if}
		</section>
	</div>
</section>

<style>
	.overview-card {
		display: grid;
		gap: 1rem;
		padding: 0 0 1.35rem;
		border-bottom: 2px solid var(--ink);
	}

	.overview-heading {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem;
	}

	h1,
	h2 {
		margin: 0;
		color: var(--ink);
	}

	h1 {
		font-size: 1.7rem;
	}

	h2 {
		font-size: 1.15rem;
	}

	.month-label {
		color: var(--muted);
		font-size: 0.82rem;
	}

	.overview-content {
		display: grid;
		grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
		gap: 1.5rem;
		align-items: stretch;
	}

	.spending-block {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		min-height: 10rem;
		padding: 1.1rem 1.2rem;
		border-left: 3px solid var(--coral);
		background: var(--butter);
	}

	.spending-label {
		font-size: 0.8rem;
		font-weight: 700;
	}

	.spending-block > strong {
		margin: 0.2rem 0 0.15rem;
		font-size: 2.5rem;
		line-height: 1.1;
		font-variant-numeric: tabular-nums;
	}

	.spending-block p {
		max-width: 24rem;
		margin: 0.35rem 0 0;
		color: var(--muted);
		font-size: 0.8rem;
		line-height: 1.45;
	}

	.plan-section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-width: 0;
	}

	.plan-heading {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.plan-heading span {
		color: var(--muted);
		font-size: 0.75rem;
		white-space: nowrap;
	}

	.plan-list {
		margin: 0;
	}

	.plan-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.55rem 0;
		border-top: 1px solid var(--line);
	}

	.plan-row dt {
		color: var(--muted);
		font-size: 0.82rem;
	}

	.plan-row dd {
		margin: 0;
		font-size: 0.9rem;
		font-variant-numeric: tabular-nums;
		font-weight: 700;
	}

	.empty-plan {
		margin: 0;
		padding: 0.75rem 0 0;
		border-top: 1px solid var(--line);
		color: var(--muted);
		font-size: 0.82rem;
		line-height: 1.5;
	}

	@media (max-width: 620px) {
		.overview-heading {
			align-items: baseline;
		}

		.overview-content {
			grid-template-columns: 1fr;
			gap: 1.1rem;
		}

		.spending-block {
			min-height: 8.5rem;
		}
	}
</style>
