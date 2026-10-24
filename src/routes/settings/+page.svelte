<script lang="ts">
	import { account, type ExpenseCategory } from '$lib/state/account.svelte';

	const mustPayExpenses = $derived(
		account.expenseCategories.filter((category) => category.group === 'must-pay')
	);
	const customCategories = $derived(
		account.expenseCategories.filter((category) => category.custom)
	);
	const niceToHaveExpenses = $derived(
		account.expenseCategories.filter((category) => category.group === 'nice-to-have')
	);

	function expenseTotal(expenses: (typeof account.expenseCategories)[number][]): number {
		return expenses.reduce((total, category) => total + category.amount, 0);
	}
	const mustPayTotal = $derived(expenseTotal(mustPayExpenses));
	const niceToHaveTotal = $derived(expenseTotal(niceToHaveExpenses));
	const totalMonthlyExpenses = $derived(expenseTotal(account.expenseCategories));

	let customCategoryName = $state('');
	let customCategoryGroup = $state<ExpenseCategory['group']>('must-pay');
	let customCategoryError = $state('');

	function updateExpense(
		category: (typeof account.expenseCategories)[number],
		value: string
	): void {
		category.amount = Number(value) || 0;
		account.monthlyexpenses = totalMonthlyExpenses;
	}

	function addCustomCategory(event: SubmitEvent): void {
		event.preventDefault();
		const name = customCategoryName.trim();

		if (!name) {
			customCategoryError = 'Enter a category name.';
			return;
		}

		if (
			account.expenseCategories.some(
				(category) => category.name.toLowerCase() === name.toLowerCase()
			)
		) {
			customCategoryError = 'That category already exists.';
			return;
		}

		account.expenseCategories = [
			...account.expenseCategories,
			{ name, amount: 0, group: customCategoryGroup, custom: true }
		];
		customCategoryName = '';
		customCategoryError = '';
	}

	function removeCustomCategory(categoryToRemove: ExpenseCategory): void {
		const remainingCategories = account.expenseCategories.filter(
			(category) => category !== categoryToRemove
		);
		account.expenseCategories = remainingCategories;
		account.monthlyexpenses = remainingCategories.reduce(
			(total, category) => total + category.amount,
			0
		);
	}
</script>

<section class="page-shell">
	<div class="page-header">
		<h1>My Info</h1>
	</div>

	<div class="settings-grid">
		<section class="setting-card expenses-card" aria-label="Monthly expenses">
			<div class="expenses-title">
				<h2>Monthly expenses</h2>
				<p>Typical costs for each month</p>
			</div>
			<div class="expense-group">
				<div class="expense-section-heading must-pay-heading">
					<h2>Must-pay expenses</h2>
					<span>Home and work essentials</span>
				</div>
				<div class="expense-list">
					{#each mustPayExpenses as category (category.name)}
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
				<div class="group-total">
					<span>Must-pay subtotal</span>
					<strong>${mustPayTotal.toLocaleString()}</strong>
				</div>
			</div>

			<div class="expense-divider" aria-hidden="true"></div>

			<div class="expense-group">
				<div class="expense-section-heading nice-to-have-heading">
					<h2>Nice-to-have spending</h2>
					<span>Flexible</span>
				</div>
				<div class="expense-list">
					{#each niceToHaveExpenses as category (category.name)}
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
				<div class="group-total">
					<span>Flexible subtotal</span>
					<strong>${niceToHaveTotal.toLocaleString()}</strong>
				</div>
			</div>

			<div class="total-row">
				<h2>Total monthly expenses</h2>
				<strong>${totalMonthlyExpenses.toLocaleString()}</strong>
			</div>
		</section>

		<div class="other-settings">
			<div class="setting-card savings-settings">
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
					<option value={1}>1 month</option>
					<option value={3}>3 months (recommended)</option>
					<option value={6}>6 months</option>
					<option value={12}>12 months</option>
				</select>
				<p class="reserve-help">
					Target: ${(totalMonthlyExpenses * account.reserveMonths).toLocaleString()}
				</p>
			</div>

			<div class="setting-card tax-settings">
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

			<section class="setting-card category-settings" aria-labelledby="category-title">
				<h2 id="category-title">Your categories</h2>
				<p>Add an expense that is not listed above.</p>

				<form class="category-form" onsubmit={addCustomCategory}>
					<label for="custom-category-name">Category name</label>
					<input
						id="custom-category-name"
						maxlength="40"
						bind:value={customCategoryName}
						required
					/>
					<label for="custom-category-group">Add to</label>
					<div class="category-controls">
						<select id="custom-category-group" bind:value={customCategoryGroup}>
							<option value="must-pay">Must-pay</option>
							<option value="nice-to-have">Nice-to-have</option>
						</select>
						<button type="submit">Add category</button>
					</div>
					{#if customCategoryError}
						<p class="category-error" role="alert">{customCategoryError}</p>
					{/if}
				</form>

				{#if customCategories.length > 0}
					<div class="custom-category-list" aria-label="Added categories">
						{#each customCategories as category (category.name)}
							<div class="custom-category-row">
								<span>
									{category.name}
									<small>{category.group === 'must-pay' ? 'Must-pay' : 'Nice-to-have'}</small>
								</span>
								<button
									type="button"
									aria-label={`Remove ${category.name}`}
									onclick={() => removeCustomCategory(category)}
								>
									Remove
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		</div>
	</div>
</section>

<style>
	.settings-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.55fr) minmax(260px, 0.8fr);
		gap: 1rem;
		align-items: start;
	}

	.expenses-card {
		align-content: start;
		gap: 0;
		min-width: 0;
		padding: 1rem;
		background: var(--surface);
	}

	.expenses-title {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0.8rem;
		padding-bottom: 0.65rem;
		border-bottom: 1px solid var(--line);
	}

	.expenses-title h2 {
		margin: 0;
		font-size: 1rem;
	}

	.expenses-title p {
		font-size: 0.72rem;
	}

	.expense-group {
		display: grid;
		gap: 0.7rem;
	}

	.expense-section-heading {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.45rem 0.55rem;
		border-radius: 2px;
	}

	.must-pay-heading {
		background: var(--sage);
	}

	.nice-to-have-heading {
		background: var(--butter);
	}

	.expense-section-heading h2 {
		margin: 0;
		color: var(--ink);
		font-size: 0.95rem;
	}

	.expense-section-heading > span {
		color: var(--muted);
		font-size: 0.72rem;
	}

	.expense-list {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.5rem 1rem;
	}

	.expense-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem;
		min-width: 0;
		font-size: 0.8rem;
		font-weight: 400;
	}

	.expense-row > span:first-child {
		min-width: 0;
	}

	.expense-divider {
		margin: 1rem 0;
		border-top: 1px solid var(--line);
	}

	.group-total {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding-top: 0.45rem;
		border-top: 1px solid var(--line);
		color: var(--muted);
		font-size: 0.74rem;
	}

	.group-total strong {
		color: var(--ink);
		font-variant-numeric: tabular-nums;
	}

	.other-settings {
		display: grid;
		align-content: start;
		gap: 1rem;
	}

	.setting-card {
		display: grid;
		align-content: start;
		gap: 0.7rem;
		min-width: 0;
		padding: 0.9rem;
		border: 1px solid var(--line);
		border-radius: 4px;
	}

	.savings-settings {
		background: var(--sage);
	}

	.tax-settings {
		background: var(--blue-wash);
	}

	.category-settings {
		background: var(--surface-muted);
	}

	.category-settings h2 {
		margin: 0;
		font-size: 0.9rem;
	}

	.category-form {
		display: grid;
		gap: 0.4rem;
	}

	.category-form > label {
		margin-top: 0.15rem;
		font-size: 0.75rem;
	}

	.category-form > input {
		min-height: 2.3rem;
		padding: 0.5rem;
		border: 1px solid var(--line);
		border-radius: 4px;
		background: var(--surface);
	}

	.category-controls {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 0.5rem;
	}

	.category-controls button {
		padding: 0 0.7rem;
		border: 0;
		border-radius: 3px;
		background: var(--action);
		color: var(--surface);
		font-weight: 700;
		cursor: pointer;
	}

	.custom-category-list {
		display: grid;
		gap: 0.35rem;
		margin-top: 0.25rem;
		padding-top: 0.6rem;
		border-top: 1px solid var(--line);
	}

	.custom-category-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		font-size: 0.78rem;
	}

	.custom-category-row small {
		display: block;
		margin-top: 0.1rem;
		color: var(--muted);
		font-size: 0.68rem;
	}

	.custom-category-row button {
		padding: 0.2rem;
		border: 0;
		background: transparent;
		color: var(--coral);
		font: inherit;
		font-size: 0.7rem;
		cursor: pointer;
	}

	.category-error {
		color: var(--coral);
		font-size: 0.72rem;
	}

	.total-row {
		grid-column: 1 / -1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 1rem;
		padding-top: 0.8rem;
		border-top: 2px solid var(--ink);
		color: var(--muted);
		font-size: 0.8rem;
	}

	.total-row h2 {
		margin: 0;
		font-size: 0.85rem;
	}

	.total-row strong {
		color: var(--ink);
		font-size: 1rem;
	}

	label {
		display: block;
		margin: 0;
		color: var(--ink);
		font-size: 0.85rem;
		font-weight: 700;
	}

	p {
		margin: 0;
		color: var(--muted);
		font-size: 0.76rem;
		line-height: 1.4;
	}

	.money-input,
	.rate-input {
		display: flex;
		align-items: center;
		width: min(100%, 135px);
		border: 1px solid var(--line);
		border-radius: 4px;
		background: var(--surface);
		color: var(--muted);
	}

	.money-input span,
	.rate-input span {
		padding: 0 0.45rem;
		font-size: 0.8rem;
	}

	input {
		width: 100%;
		min-width: 0;
		border: 0;
		outline: 0;
		padding: 0.5rem 0.4rem;
		background: transparent;
		font: inherit;
		font-weight: 700;
		color: var(--ink);
	}

	select {
		width: 100%;
		border: 1px solid var(--line);
		border-radius: 4px;
		padding: 0.6rem 0.5rem;
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

	@media (max-width: 1000px) {
		.settings-grid {
			grid-template-columns: 1fr;
		}

		.other-settings {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 600px) {
		.expense-list,
		.other-settings {
			grid-template-columns: 1fr;
		}
	}
</style>
