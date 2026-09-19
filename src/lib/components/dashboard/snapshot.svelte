<script lang="ts">
	import { account } from '$lib/state/account.svelte';
	const totalGoalsSaved = $derived(account.goals.reduce((sum, goal) => sum + goal.saved, 0));
	const monthlyProgress = $derived(account.getMonthlyProgress());
	const formatCurrency = (value: number) =>
		`$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

	const safeToSpend = $derived(account.getSafeToSpend());
</script>

<section class="overview-card">
	<div class="overview-heading">
		<div>
			<h1>Hey Amelie!</h1>
		</div>
		<div class="safe-amount">
			<span>Safe to spend</span>
			<strong>{formatCurrency(safeToSpend)}</strong>
		</div>
	</div>

	<div class="overview-stats">
		<div><span>Income</span><strong>{formatCurrency(monthlyProgress.income)}</strong></div>
		<div><span>Bills</span><strong>{formatCurrency(account.monthlyexpenses)}</strong></div>
		<div><span>Goals</span><strong>{formatCurrency(totalGoalsSaved)}</strong></div>
	</div>

	<div class="section-head progress-heading">
		<div>
			<h2>Monthly progress</h2>
			<span>{monthlyProgress.month}</span>
		</div>
		<strong>{formatCurrency(monthlyProgress.income)} earned</strong>
	</div>

	<div class="saved-line">
		<span>Saved this month</span>
		<strong>{formatCurrency(monthlyProgress.saved)}</strong>
	</div>

	<div class="progress-list">
		<div class="progress-item">
			<div>
				<span>Bills left this month</span>
				<strong>
					{formatCurrency(Math.max(monthlyProgress.monthlyBills - monthlyProgress.billsPaid, 0))}
				</strong>
			</div>
			<div class="progress-track">
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
			<div class="progress-track">
				<span
					class="reserve-bar"
					style={`width: ${Math.min((monthlyProgress.slowMonthReserve / Math.max(monthlyProgress.bills, 1)) * 100, 100)}%`}
				></span>
			</div>
		</div>
		<div class="progress-item">
			<div>
				<span>Goals</span><strong>{formatCurrency(monthlyProgress.goalSavings)}</strong>
			</div>
			<div class="progress-track">
				<span
					class="goals-bar"
					style={`width: ${Math.min((monthlyProgress.goalSavings / Math.max(monthlyProgress.income, 1)) * 100, 100)}%`}
				></span>
			</div>
		</div>
	</div>
</section>

<style>
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
