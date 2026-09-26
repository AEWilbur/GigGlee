<script lang="ts">
	import { account } from '$lib/state/account.svelte';

	const totalMonthlyExpenses = $derived(
		account.expenseCategories.reduce((total, category) => total + category.amount, 0)
	);

	function updateExpense(
		category: (typeof account.expenseCategories)[number],
		value: string
	): void {
		category.amount = Number(value) || 0;
		account.monthlyexpenses = totalMonthlyExpenses;
	}
</script>

<section class="page-shell">
	<div class="page-header">
		<h1>Settings</h1>
	</div>

	<div class="settings-grid">
		<div class="setting-card green expenses-card">
			<div>
				<h2 class="setting-title">Monthly bills</h2>
			</div>
			<div class="expense-list">
				{#each account.expenseCategories as category (category.name)}
					<label class="expense-row">
						<span>{category.name}</span>
						<span class="money-input">
							<span>$</span>
							<input
								type="number"
								min="0"
								placeholder="$0"
								value={category.amount || ''}
								oninput={(event) => updateExpense(category, event.currentTarget.value)}
							/>
						</span>
					</label>
				{/each}
			</div>
			<div class="total-row">
				<h2>Total monthly expenses</h2>
				<strong>${totalMonthlyExpenses.toLocaleString()}</strong>
			</div>
		</div>

		<div class="other-settings">
			<div class="setting-card blue">
				<label for="goal-saving-percent">Goal saving percentage</label>
				<p>Percentage of money left after bills that goes to goals.</p>
				<div class="money-input">
					<span>%</span>
					<input
						id="goal-saving-percent"
						type="number"
						min="0"
						max="100"
						bind:value={account.goalAllocationPercent}
					/>
				</div>
				<label for="reserve-months">Slow-month reserve length</label>
				<select id="reserve-months" bind:value={account.reserveMonths}>
					<option value={3}>3 months (recommended)</option>
					<option value={6}>6 months</option>
					<option value={12}>12 months</option>
				</select>
				<p class="reserve-help">
					Target: ${(totalMonthlyExpenses * account.reserveMonths).toLocaleString()}
				</p>
			</div>

			<div class="setting-card blue">
				<label for="tax-rate">Tax rate</label>
				<div class="rate-input">
					<input
						id="tax-rate"
						type="number"
						min="0"
						max="100"
						step="1"
						value={account.taxrate * 100}
						oninput={(event) => (account.taxrate = Number(event.currentTarget.value) / 100)}
					/>
					<span>%</span>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.settings-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(220px, 1fr));
		gap: 1rem;
		align-items: start;
	}

	.other-settings {
		display: grid;
		align-content: start;
		gap: 1rem;
	}

	.setting-card {
		display: grid;
		align-content: space-between;
		gap: 0.8rem;
		min-height: 120px;
		padding: 1rem;
		border: 1px solid var(--line);
		border-radius: 8px;
	}

	.expenses-card {
		gap: 1rem;
		min-height: 100%;
	}

	.green {
		background: var(--sage);
	}

	.blue {
		background: var(--blue-wash);
	}

	.expense-list {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.45rem 0.8rem;
	}

	.expense-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.8rem;
		font-weight: 400;
	}

	.total-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-top: 0.8rem;
		border-top: 1px solid rgba(80, 67, 100, 0.12);
		font-size: 0.8rem;
		color: var(--muted);
	}

	.total-row strong {
		font-size: 1rem;
		color: var(--ink);
	}

	label,
	.setting-title {
		display: block;
		margin: 0;
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--ink);
	}

	p {
		margin: 0;
		font-size: 0.76rem;
		line-height: 1.4;
		color: var(--muted);
	}

	.money-input,
	.rate-input {
		display: flex;
		align-items: center;
		width: min(100%, 150px);
		border: 1px solid var(--line);
		border-radius: 0.7rem;
		background: var(--surface);
		color: var(--muted);
	}

	.money-input span,
	.rate-input span {
		padding: 0 0.55rem;
		font-size: 0.85rem;
	}

	input {
		width: 100%;
		min-width: 0;
		border: 0;
		outline: 0;
		padding: 0.65rem 0.55rem;
		background: transparent;
		font: inherit;
		font-weight: 700;
		color: var(--ink);
	}

	select {
		width: 100%;
		border: 1px solid var(--line);
		border-radius: 0.7rem;
		padding: 0.65rem 0.55rem;
		background: var(--surface);
		font: inherit;
		font-weight: 700;
		color: var(--ink);
	}

	.reserve-help {
		font-size: 0.72rem;
		font-weight: 700;
		color: var(--sage-strong);
	}

	@media (max-width: 600px) {
		.settings-grid {
			grid-template-columns: 1fr;
		}

		.expenses-card {
			grid-column: 1;
		}

		.other-settings {
			grid-column: 1;
		}

		.expense-list {
			grid-template-columns: 1fr;
		}
	}
</style>
