<script lang="ts">
	import { account } from '$lib/state/account.svelte';

	const totalGoalsSaved = $derived(account.goals.reduce((total, goal) => total + goal.saved, 0));
	const monthlyProgress = $derived(account.getMonthlyProgress());
	const safeToSpend = $derived(account.getSafeToSpend());

	const formatCurrency = (amount: number) =>
		`$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
</script>

<section class="overview-card" aria-label="Money overview">
	<div class="overview-heading">
		<div>
			<h1>Hey Amelie!</h1>
			<span class="month-label">{monthlyProgress.month}</span>
		</div>
		<div class="safe-amount">
			<span>Safe to spend</span>
			<strong>{formatCurrency(safeToSpend)}</strong>
		</div>
	</div>

	<div class="overview-stats">
		<div><span>Income</span><strong>{formatCurrency(monthlyProgress.income)}</strong></div>
		<div><span>Monthly bills</span><strong>{formatCurrency(account.monthlyexpenses)}</strong></div>
		<div><span>Goals</span><strong>{formatCurrency(totalGoalsSaved)}</strong></div>
	</div>

	<section class="progress-section" aria-labelledby="progress-title">
		<div class="progress-heading">
			<h2 id="progress-title">Monthly progress</h2>
			<span>{formatCurrency(monthlyProgress.saved)} saved</span>
		</div>

		<div class="progress-list">
			<div class="progress-item">
				<div>
					<span>Bills left this month</span>
					<strong
						>{formatCurrency(
							Math.max(monthlyProgress.monthlyBills - monthlyProgress.billsPaid, 0)
						)}</strong
					>
				</div>
				<div class="progress-track" aria-hidden="true">
					<span
						class="bills-bar"
						style={`width: ${Math.min((monthlyProgress.billsPaid / Math.max(monthlyProgress.monthlyBills, 1)) * 100, 100)}%`}
					></span>
				</div>
			</div>

			<div class="progress-item">
				<div>
					<span>Slow-month reserve</span>
					<strong>{formatCurrency(monthlyProgress.slowMonthReserve)}</strong>
				</div>
				<div class="progress-track" aria-hidden="true">
					<span
						class="reserve-bar"
						style={`width: ${Math.min((monthlyProgress.slowMonthReserve / Math.max(monthlyProgress.bills, 1)) * 100, 100)}%`}
					></span>
				</div>
			</div>

			<div class="progress-item">
				<div>
					<span>Goals</span>
					<strong>{formatCurrency(monthlyProgress.goalSavings)}</strong>
				</div>
				<div class="progress-track" aria-hidden="true">
					<span
						class="goals-bar"
						style={`width: ${Math.min((monthlyProgress.goalSavings / Math.max(monthlyProgress.income, 1)) * 100, 100)}%`}
					></span>
				</div>
			</div>
		</div>
	</section>
</section>

<style>
	.overview-card {
		display: grid;
		gap: 1.25rem;
		padding: clamp(1.1rem, 3vw, 1.75rem);
		border: 1px solid #c9d9c2;
		border-radius: 1.1rem;
		background: var(--sage);
	}

	.overview-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid rgb(32 36 30 / 14%);
	}

	h1,
	h2 {
		margin: 0;
		color: var(--ink);
	}

	h1 {
		font-size: clamp(1.8rem, 3vw, 2.3rem);
	}

	h2 {
		font-size: 1.1rem;
	}

	.month-label {
		display: block;
		margin-top: 0.2rem;
		color: var(--muted);
		font-size: 0.8rem;
	}

	.safe-amount {
		display: grid;
		gap: 0.15rem;
		text-align: right;
	}

	.safe-amount span,
	.overview-stats span {
		color: var(--muted);
		font-size: 0.76rem;
	}

	.safe-amount strong {
		color: var(--sage-strong);
		font-size: clamp(1.7rem, 4vw, 2.7rem);
	}

	.overview-stats {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0;
		padding: 0.1rem 0 0.25rem;
	}

	.overview-stats div {
		display: grid;
		gap: 0.3rem;
		padding: 0.2rem 0.85rem;
		border-left: 1px solid rgb(32 36 30 / 16%);
	}

	.overview-stats div:first-child {
		padding-left: 0;
		border-left: 0;
	}

	.overview-stats span {
		font-size: 0.76rem;
	}

	.overview-stats strong {
		color: var(--ink);
		font-size: 1.08rem;
	}

	.progress-section {
		padding-top: 0.25rem;
	}

	.progress-heading,
	.progress-item > div:first-child {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.progress-heading {
		margin-bottom: 0.75rem;
	}

	.progress-heading span,
	.progress-item > div:first-child {
		color: var(--muted);
		font-size: 0.78rem;
	}

	.progress-item strong {
		color: var(--ink);
	}

	.progress-list {
		display: grid;
		gap: 0.7rem;
	}

	.progress-item {
		display: grid;
		gap: 0.3rem;
	}

	.progress-track {
		height: 6px;
		overflow: hidden;
		border-radius: 999px;
		background: rgb(255 253 248 / 72%);
	}

	.progress-track span {
		display: block;
		height: 100%;
		border-radius: inherit;
	}

	.bills-bar,
	.goals-bar {
		background: var(--sage-strong);
	}

	.reserve-bar {
		background: var(--blue-ink);
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
			gap: 0.65rem;
		}

		.overview-stats div,
		.overview-stats div:first-child {
			padding: 0.55rem 0;
			border-top: 1px solid rgb(32 36 30 / 16%);
			border-left: 0;
		}
	}
</style>
