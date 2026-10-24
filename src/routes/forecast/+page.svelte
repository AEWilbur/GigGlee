<script lang="ts">
	import { account } from '$lib/state/account.svelte';

	const formatCurrency = (value: number) =>
		`$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
	let additionalGigs = $state(4);
	const forecast = $derived(account.getForecast(additionalGigs));
</script>

<section class="page-shell forecast-page">
	<div class="page-header">
		<h1>Forecast</h1>
	</div>

	<div class="forecast-layout">
		<div class="forecast-main">
			<section class="scenario-section" aria-labelledby="scenario-title">
				<div class="section-heading">
					<div>
						<h2 id="scenario-title">Extra gigs</h2>
						<p>Adjust how many more gigs to include.</p>
					</div>
					<div class="average-gig">
						<span>Average gig</span>
						<strong>{formatCurrency(forecast.averageGig)}</strong>
					</div>
				</div>

				<div class="gig-planner">
					<output for="extra-gigs">{additionalGigs}</output>
					<div class="range-control">
						<label for="extra-gigs">Extra gigs to plan for</label>
						<input id="extra-gigs" type="range" min="0" max="20" bind:value={additionalGigs} />
						<div class="range-labels"><span>0</span><span>20</span></div>
					</div>
				</div>
			</section>

			<section class="breakdown-section" aria-labelledby="breakdown-title">
				<div class="section-heading breakdown-heading">
					<h2 id="breakdown-title">Projected money</h2>
					<span>Estimated from your gig history</span>
				</div>

				<dl class="breakdown-list">
					<div class="breakdown-row income-row">
						<dt>
							<span>Projected income</span>
							<small>Before gig expenses and allocations</small>
						</dt>
						<dd>{formatCurrency(forecast.projectedIncome)}</dd>
					</div>
					<div class="breakdown-row">
						<dt>Gig expenses</dt>
						<dd>{formatCurrency(forecast.gigExpenses)}</dd>
					</div>
					<div class="breakdown-row">
						<dt>Must-pay expenses</dt>
						<dd>{formatCurrency(forecast.mustPayPayment)}</dd>
					</div>
					<div class="breakdown-row">
						<dt>Tax reserve</dt>
						<dd>{formatCurrency(forecast.taxes)}</dd>
					</div>
					<div class="breakdown-row">
						<dt>Nice-to-have spending</dt>
						<dd>{formatCurrency(forecast.niceToHavePayment)}</dd>
					</div>
					<div class="breakdown-row">
						<dt>Slow-month backup</dt>
						<dd>{formatCurrency(forecast.slowMonthReserve)}</dd>
					</div>
					<div class="breakdown-row">
						<dt>Saving goals</dt>
						<dd>{formatCurrency(forecast.goalReserve)}</dd>
					</div>
					<div class="breakdown-row total-row">
						<dt>Safe to spend now</dt>
						<dd>{formatCurrency(forecast.safeToSpend)}</dd>
					</div>
				</dl>
			</section>
		</div>

		<aside class="outlook-section" aria-labelledby="outlook-title">
			<div class="outlook-heading">
				<h2 id="outlook-title">Estimated money left over</h2>
				<p>At this pace</p>
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
		</aside>
	</div>
</section>

<style>
	.forecast-page {
		gap: 1.5rem;
	}

	.forecast-layout {
		display: grid;
		grid-template-columns: minmax(0, 1.5fr) minmax(250px, 0.8fr);
		gap: clamp(2rem, 4vw, 4rem);
		align-items: start;
	}

	.forecast-main {
		display: grid;
		gap: 2rem;
		min-width: 0;
	}

	.section-heading {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1.5rem;
	}

	.section-heading h2,
	.outlook-heading h2 {
		margin: 0;
		color: var(--ink);
		font-size: 1.15rem;
		font-weight: 700;
	}

	.section-heading p,
	.section-heading > span,
	.outlook-heading p {
		margin: 0.25rem 0 0;
		color: var(--muted);
		font-size: 0.78rem;
	}

	.scenario-section {
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--line);
	}

	.average-gig {
		display: grid;
		gap: 0.15rem;
		text-align: right;
		white-space: nowrap;
	}

	.average-gig span {
		color: var(--muted);
		font-size: 0.75rem;
	}

	.average-gig strong {
		font-size: 1.05rem;
		font-variant-numeric: tabular-nums;
	}

	.gig-planner {
		display: grid;
		grid-template-columns: 3rem minmax(0, 1fr);
		align-items: center;
		gap: 1rem;
		margin-top: 1.2rem;
	}

	.gig-planner output {
		color: var(--ink);
		font-size: 2rem;
		font-variant-numeric: tabular-nums;
		text-align: center;
	}

	.range-control label {
		display: block;
		margin-bottom: 0.45rem;
		color: var(--ink);
		font-size: 0.8rem;
		font-weight: 700;
	}

	.range-control input {
		width: 100%;
		accent-color: var(--action);
	}

	.range-labels {
		display: flex;
		justify-content: space-between;
		color: var(--muted);
		font-size: 0.65rem;
	}

	.breakdown-heading {
		align-items: end;
		margin-bottom: 0.8rem;
	}

	.breakdown-heading > span {
		text-align: right;
	}

	.breakdown-list {
		margin: 0;
		border-top: 1px solid var(--line);
	}

	.breakdown-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.8rem 0;
		border-bottom: 1px solid var(--line);
	}

	.breakdown-row dt {
		display: grid;
		gap: 0.2rem;
		color: var(--muted);
		font-size: 0.86rem;
	}

	.breakdown-row dt small {
		font-size: 0.72rem;
	}

	.breakdown-row dd {
		margin: 0;
		color: var(--ink);
		font-size: 0.95rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.income-row dt {
		color: var(--ink);
		font-weight: 700;
	}

	.income-row dd {
		color: var(--sage-strong);
		font-size: 1.2rem;
	}

	.total-row {
		margin-top: 0.4rem;
		padding: 1rem 0;
		border-top: 2px solid var(--ink);
		border-bottom: 0;
	}

	.total-row dt,
	.total-row dd {
		color: var(--ink);
		font-size: 1rem;
		font-weight: 700;
	}

	.outlook-section {
		padding-left: clamp(1.25rem, 2.5vw, 2rem);
		border-left: 1px solid var(--line);
	}

	.outlook-heading {
		margin-bottom: 1rem;
	}

	.time-block {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 1rem 0;
		border-top: 1px solid var(--line);
	}

	.time-block span {
		color: var(--muted);
		font-size: 0.78rem;
	}

	.time-block strong {
		color: var(--ink);
		font-size: 1.35rem;
		font-variant-numeric: tabular-nums;
	}

	@media (max-width: 900px) {
		.forecast-layout {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.outlook-section {
			padding: 1.5rem 0 0;
			border-top: 1px solid var(--line);
			border-left: 0;
		}

		.timeline {
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 1rem;
		}

		.time-block {
			align-items: start;
			flex-direction: column;
			gap: 0.4rem;
		}
	}

	@media (max-width: 560px) {
		.forecast-layout {
			gap: 1.5rem;
		}

		.section-heading {
			align-items: start;
		}

		.breakdown-heading {
			flex-direction: column;
			gap: 0.25rem;
		}

		.breakdown-heading > span {
			text-align: left;
		}

		.gig-planner {
			grid-template-columns: 2.5rem minmax(0, 1fr);
			gap: 0.75rem;
		}

		.timeline {
			grid-template-columns: 1fr;
			gap: 0;
		}

		.time-block {
			align-items: baseline;
			flex-direction: row;
		}
	}
</style>
