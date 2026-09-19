<script lang="ts">
	import { account } from '$lib/state/account.svelte';

	const formatCurrency = (value: number) =>
		`$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
	const goals = $derived(account.getGoalProgress());
	const completedGoals = $derived(account.getCompletedGoals());
	let goalName = $state('');
	let goalTarget = $state(0);
	let goalMessage = $state('');
	let editingGoalId = $state<number | null>(null);
	let editName = $state('');
	let editTarget = $state(0);

	function addGoal(): void {
		const name = goalName.trim();
		const target = Number(goalTarget);

		if (!name || target <= 0) {
			goalMessage = 'Add a name and a target greater than $0.';
			return;
		}

		account.addGoal(name, target);
		goalName = '';
		goalTarget = 0;
		goalMessage = `${name} added to your goals.`;
	}

	function startEditing(goal: (typeof goals)[number]): void {
		editingGoalId = goal.id;
		editName = goal.name;
		editTarget = goal.target;
	}

	function saveGoal(): void {
		if (editingGoalId === null) return;

		const name = editName.trim();
		const target = Number(editTarget);

		if (!name || target <= 0) return;

		account.updateGoal(editingGoalId, { name, target });
		editingGoalId = null;
	}

	function deleteGoal(id: number): void {
		account.deleteGoal(id);
	}
</script>

<section class="page-shell">
	<div class="page-header">
		<h1>My goals</h1>
	</div>

	<form
		class="add-goal-card"
		onsubmit={(event) => {
			event.preventDefault();
			addGoal();
		}}
	>
		<div>
			<h2>Add a goal</h2>
			<p>Choose something you want to save for.</p>
		</div>
		<div class="goal-form-fields">
			<label>
				<span>Goal name</span>
				<input type="text" placeholder="e.g. New laptop" bind:value={goalName} />
			</label>
			<label>
				<span>Target amount</span>
				<input type="number" min="1" placeholder="$0" bind:value={goalTarget} />
			</label>
			<button type="submit">Add Goal</button>
		</div>
		{#if goalMessage}<small class:error={goalMessage.startsWith('Add')}>{goalMessage}</small>{/if}
	</form>

	<div class="goal-grid">
		{#each goals as goal, index (goal.id)}
			<div class="goal-card {index % 3 === 0 ? 'green' : index % 3 === 1 ? 'blue' : 'yellow'}">
				<div class="goal-top">
					<span>{goal.name}</span>
					<strong>{formatCurrency(goal.target)}</strong>
				</div>
				<div class="progress">
					<span style="width: {goal.percent}%"></span>
				</div>
				<div class="goal-bottom">
					<small>{Math.round(goal.percent)}% saved</small>
					<div class="goal-actions">
						<button type="button" onclick={() => startEditing(goal)}>Edit</button>
						<button type="button" class="delete" onclick={() => deleteGoal(goal.id)}>Delete</button>
					</div>
				</div>

				{#if editingGoalId === goal.id}
					<form
						class="edit-goal-form"
						onsubmit={(event) => {
							event.preventDefault();
							saveGoal();
						}}
					>
						<input type="text" aria-label="Goal name" bind:value={editName} />
						<input type="number" min="1" aria-label="Goal target" bind:value={editTarget} />
						<button type="submit">Save</button>
					</form>
				{/if}
			</div>
		{/each}
	</div>

	{#if completedGoals.length > 0}
		<section class="history-section">
			<div class="section-heading">
				<h2>Goal history</h2>
				<span>{completedGoals.length} completed</span>
			</div>
			<div class="history-list">
				{#each completedGoals as goal (goal.id)}
					<div class="history-row">
						<div>
							<strong>{goal.name}</strong>
							<small>Completed {goal.completedAt?.slice(0, 10) ?? 'recently'}</small>
						</div>
						<div class="history-actions">
							<strong>{formatCurrency(goal.target)}</strong>
							<button type="button" onclick={() => deleteGoal(goal.id)}>Delete</button>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}
</section>

<style>
	.page-header {
		font-family: 'Itim', sans-serif;
	}

	.add-goal-card {
		display: grid;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid #ded5e8;
		border-radius: 8px;
		background: #e9e4ff;
	}

	.add-goal-card h2 {
		margin: 0 0 0.25rem;
		font-size: 1rem;
		color: #2d2340;
	}

	.add-goal-card p {
		margin: 0;
		font-size: 0.78rem;
		color: rgba(45, 35, 64, 0.68);
	}

	.goal-form-fields {
		display: grid;
		grid-template-columns: 1fr 0.75fr auto;
		align-items: end;
		gap: 0.75rem;
	}

	.goal-form-fields label {
		display: grid;
		gap: 0.35rem;
		font-size: 0.75rem;
		font-weight: 700;
		color: #453a59;
	}

	.goal-form-fields input {
		min-width: 0;
		border: 1px solid rgba(80, 67, 100, 0.16);
		border-radius: 0.7rem;
		padding: 0.7rem 0.75rem;
		background: #f8f6fb;
		font: inherit;
		color: #2d2340;
	}

	.goal-form-fields button {
		border: 0;
		border-radius: 0.7rem;
		padding: 0.72rem 1rem;
		background: #2f6fbd;
		color: white;
		font: inherit;
		font-size: 0.8rem;
		font-weight: 700;
		cursor: pointer;
	}

	.add-goal-card small {
		font-size: 0.75rem;
		color: #245b9f;
	}

	.add-goal-card small.error {
		color: #9a4b56;
	}

	.goal-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
	}

	.goal-card {
		display: grid;
		gap: 0.75rem;
		align-content: space-between;
		min-height: 190px;
		padding: 1rem;
		border: 1px solid rgba(80, 67, 100, 0.12);
		border-radius: 8px;
	}

	.green {
		background: #d8f1df;
	}
	.blue {
		background: #e3ecff;
	}
	.yellow {
		background: #fff0b8;
	}

	.goal-top {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.95rem;
		color: #2d2340;
	}

	.goal-top strong {
		font-size: 1.05rem;
	}

	.goal-bottom {
		display: grid;
		gap: 0.7rem;
	}

	.goal-actions {
		display: flex;
		gap: 0.35rem;
		flex-wrap: wrap;
	}

	.goal-actions button,
	.edit-goal-form button {
		border: 0;
		border-radius: 0.45rem;
		padding: 0.4rem 0.55rem;
		background: rgba(255, 255, 255, 0.68);
		color: #453a59;
		font: inherit;
		font-size: 0.68rem;
		font-weight: 700;
		cursor: pointer;
	}

	.goal-actions button.delete {
		color: #9a4b56;
	}

	.edit-goal-form {
		display: grid;
		grid-template-columns: 1fr 0.65fr auto;
		gap: 0.35rem;
	}

	.edit-goal-form input {
		min-width: 0;
		border: 1px solid rgba(80, 67, 100, 0.14);
		border-radius: 0.45rem;
		padding: 0.4rem;
		background: rgba(255, 255, 255, 0.78);
		font: inherit;
		font-size: 0.7rem;
		color: #2d2340;
	}

	.progress {
		height: 0.7rem;
		background: rgba(255, 255, 255, 0.5);
		border-radius: 999px;
		overflow: hidden;
	}

	.progress span {
		display: block;
		height: 100%;
		background: rgba(45, 35, 64, 0.78);
		border-radius: inherit;
	}

	small {
		font-size: 0.75rem;
		color: rgba(45, 35, 64, 0.75);
	}

	.history-section {
		display: grid;
		gap: 0.8rem;
		padding: 1rem;
		border: 1px solid rgba(80, 67, 100, 0.08);
		border-radius: 1.2rem;
		background: rgba(255, 255, 255, 0.52);
		box-shadow: 0 8px 24px rgba(98, 92, 120, 0.04);
	}

	.section-heading,
	.history-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.section-heading h2 {
		margin: 0;
		font-size: 1rem;
		color: #2d2340;
	}

	.section-heading span {
		font-size: 0.72rem;
		color: rgba(45, 35, 64, 0.62);
	}

	.history-list {
		display: grid;
		gap: 0.45rem;
	}

	.history-row {
		padding: 0.75rem;
		border-radius: 0.7rem;
		background: #f0f4ea;
		color: #2d2340;
	}

	.history-row div {
		display: grid;
		gap: 0.2rem;
	}

	.history-row small {
		font-size: 0.7rem;
		color: rgba(45, 35, 64, 0.62);
	}

	.history-actions {
		display: flex;
		align-items: center;
		gap: 0.7rem;
	}

	.history-actions button {
		border: 0;
		border-radius: 0.45rem;
		padding: 0.4rem 0.55rem;
		background: rgba(193, 92, 104, 0.1);
		color: #9a4b56;
		font: inherit;
		font-size: 0.68rem;
		font-weight: 700;
		cursor: pointer;
	}

	@media (max-width: 600px) {
		.goal-form-fields {
			grid-template-columns: 1fr;
		}
	}
</style>
