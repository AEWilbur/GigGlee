<script lang="ts">
	import { account } from '$lib/state/account.svelte';

	const formatCurrency = (value: number) =>
		`$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
	let additionalGigs = $state(4);
	const forecast = $derived(account.getForecast(additionalGigs));
	const projectedAfterCosts = $derived(forecast.projectedNet - forecast.bills - forecast.taxes);
</script>

<section class="page-shell">
	<div class="page-header">
		<h1>Forecast</h1>
	</div>

	<section class="overview-section">
		<div class="section-heading">
			<div>
				<h2>Extra gigs</h2>
				<span>Plan with {additionalGigs} more</span>
			</div>
			<span class="period-label">Average gig: {formatCurrency(forecast.averageGig)}</span>
		</div>

		<div class="gig-planner">
			<strong>{additionalGigs}</strong>
			<div>
				<label for="extra-gigs">Extra gigs</label>
				<input id="extra-gigs" type="range" min="0" max="20" bind:value={additionalGigs} />
				<div class="range-labels"><span>0</span><span>20</span></div>
			</div>
		</div>

		<div class="income-card">
			<strong>{formatCurrency(forecast.projectedIncome)}</strong>
			<span>before gig expenses and bills</span>
			<div class="bar"><span style="width: 100%"></span></div>
		</div>

		<div class="cost-grid">
			<div class="cost-card gig-expense">
				<span>Gig expenses</span>
				<strong>{formatCurrency(forecast.extraExpenses)}</strong>
			</div>
			<div class="cost-card bills">
				<span>Bills</span>
				<strong>{formatCurrency(forecast.bills)}</strong>
			</div>
			<div class="cost-card taxes">
				<span>Taxes</span>
				<strong>{formatCurrency(forecast.taxes)}</strong>
			</div>
			<div class="cost-card remaining">
				<span>After bills and taxes</span>
				<strong>{formatCurrency(projectedAfterCosts)}</strong>
			</div>
		</div>
	</section>

	<section class="outlook-section">
		<div class="section-heading">
			<div>
				<span>Estimated money left over</span>
			</div>
		</div>

		<div class="timeline">
			<div class="time-block">
				<span>Next month</span>
				<strong>{formatCurrency(forecast.nextMonth)}</strong>
			</div>
			<div class="time-block">
				<span>3 months</span>
				<strong>{formatCurrency(forecast.threeMonths)}</strong>
			</div>
			<div class="time-block">
				<span>6 months</span>
				<strong>{formatCurrency(forecast.sixMonths)}</strong>
			</div>
		</div>
	</section>
</section>

<style>
	.overview-section,
	.outlook-section {
		border: 1px solid var(--line);
		border-radius: 8px;
		padding: 1rem;
		box-shadow: none;
	}

	.overview-section {
		display: grid;
		gap: 1rem;
		background: var(--blue-wash);
	}

	.section-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.section-heading h2 {
		margin: 0;
		font-size: 1.15rem;
		color: var(--ink);
		font-weight: 700;
	}

	.period-label {
		font-size: 0.78rem;
		color: var(--muted);
	}

	.gig-planner {
		display: grid;
		grid-template-columns: 3rem 1fr;
		align-items: center;
		gap: 1rem;
		padding: 0.8rem;
		border-radius: 0.9rem;
		background: var(--surface-muted);
	}

	.gig-planner > strong {
		font-size: 1.8rem;
		text-align: center;
		color: var(--ink);
	}

	.gig-planner label {
		display: block;
		margin-bottom: 0.2rem;
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--ink);
	}

	.gig-planner input {
		width: 100%;
		accent-color: var(--action);
	}

	.range-labels {
		display: flex;
		justify-content: space-between;
		font-size: 0.65rem;
		color: var(--muted);
	}

	.income-card {
		display: grid;
		gap: 0.25rem;
		padding: 1.2rem;
		border-radius: 0.9rem;
		background: var(--sage);
	}

	.income-card strong {
		font-size: clamp(2rem, 5vw, 3.2rem);
		line-height: 1;
		color: var(--ink);
	}

	.income-card > span {
		font-size: 0.78rem;
		color: var(--muted);
	}

	.bar {
		height: 0.7rem;
		background: rgba(255, 255, 255, 0.6);
		border-radius: 999px;
		overflow: hidden;
		margin-top: 0.8rem;
	}

	.bar span {
		display: block;
		height: 100%;
		background: var(--sage-strong);
		border-radius: inherit;
	}

	.cost-grid,
	.timeline {
		display: grid;
		grid-template-columns: repeat(3, minmax(180px, 1fr));
		gap: 1rem;
	}

	.cost-card,
	.time-block {
		display: grid;
		align-content: center;
		gap: 0.25rem;
		min-height: 90px;
		padding: 0.9rem;
		border: 1px solid var(--line);
		border-radius: 0.9rem;
		background: var(--surface);
	}

	.cost-card span,
	.time-block span {
		font-size: 0.78rem;
		color: var(--muted);
	}

	.cost-card strong,
	.time-block strong {
		font-size: clamp(1.35rem, 3vw, 2rem);
		color: var(--ink);
	}

	.cost-card.bills {
		background: var(--butter);
	}

	.cost-card.taxes {
		background: var(--blue-wash);
	}

	.cost-card.gig-expense {
		background: var(--coral-wash);
	}

	.cost-card.remaining {
		background: var(--sage);
	}

	.outlook-section {
		display: grid;
		gap: 1rem;
		background: var(--sage);
	}

	.time-block {
		background: var(--surface);
	}

	@media (max-width: 700px) {
		.cost-grid,
		.timeline {
			grid-template-columns: 1fr;
		}
	}
</style>
