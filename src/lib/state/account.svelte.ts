import { SvelteDate } from 'svelte/reactivity';

// one paid gig
export type Gig = {
	id: number;
	name: string;
	date: string;
	amount: number;
	gigExpense?: number;
	notes?: string;
	allocations?: GigAllocation[];
	plan?: GigPlan;
};

// money put toward one goal
export type GigAllocation = {
	goalId: number;
	amount: number;
};

// gig money split
export type GigPlan = {
	gigExpense: number;
	netIncome: number;
	billPayment: number;
	taxReserve: number;
	niceToHavePayment: number;
	slowMonthReserve: number;
	goalReserve: number;
	safeToSpend: number;
};

// one budget category
export type ExpenseCategory = {
	name: string;
	amount: number;
	group: 'must-pay' | 'nice-to-have';
	custom?: boolean;
};

// one saving goal
export type Goal = {
	id: number;
	name: string;
	target: number;
	saved: number;
	completed: boolean;
	completedAt?: string;
};

// account data and money math
export class Account {
	// profile + monthly settings
	monthlyexpenses: number = $state(0);
	taxrate: number = $state(0);
	username: string = $state('');

	// goal and reserve settings
	goalAllocationPercent: number = $state(60);
	reserveMonths: number = $state(3);

	// monthly spending buckets
	expenseCategories: ExpenseCategory[] = $state([
		{ name: 'Housing', amount: 0, group: 'must-pay' },
		{ name: 'Groceries', amount: 0, group: 'must-pay' },
		{ name: 'Utilities', amount: 0, group: 'must-pay' },
		{ name: 'Transportation', amount: 0, group: 'must-pay' },
		{ name: 'Phone & Internet', amount: 0, group: 'must-pay' },
		{ name: 'Insurance', amount: 0, group: 'must-pay' },
		{ name: 'Health care', amount: 0, group: 'must-pay' },
		{ name: 'Equipment', amount: 0, group: 'must-pay' },
		{ name: 'Eating out', amount: 0, group: 'nice-to-have' },
		{ name: 'Subscriptions', amount: 0, group: 'nice-to-have' },
		{ name: 'Entertainment', amount: 0, group: 'nice-to-have' },
		{ name: 'Personal spending', amount: 0, group: 'nice-to-have' }
	]);

	// saved gigs and goals
	gigs: Gig[] = $state([]);
	goals: Goal[] = $state([]);

	// add gig and apply its money split
	public addGig(gig: Omit<Gig, 'id'>): void {
		const plan = this.getPlanPreview(gig.amount, gig.gigExpense ?? 0, gig.date);
		const newGig: Gig = {
			...gig,
			id: Date.now(),
			allocations: plan.allocations,
			plan: plan.summary
		};

		this.gigs = [newGig, ...this.gigs];

		this.applyAllocations(newGig.allocations ?? [], 1);
	}

	// preview where gig money goes
	public getPlanPreview(
		grossIncome: number,
		gigExpense: number,
		gigDate = new SvelteDate().toISOString()
	): { allocations: GigAllocation[]; summary: GigPlan } {
		const netIncome = Math.max(grossIncome - Math.max(gigExpense, 0), 0);
		// const netIncome = grossIncome - Math.max(gigExpense, 0);
		// account for this month's gigs
		const monthGigs = this.gigs.filter((gig) => this.isSameMonth(gig.date, gigDate));
		const mustPayAlreadyCovered = monthGigs.reduce(
			(total, gig) => total + (gig.plan?.billPayment ?? 0),
			0
		);
		const niceToHaveAlreadyCovered = monthGigs.reduce(
			(total, gig) => total + (gig.plan?.niceToHavePayment ?? 0),
			0
		);
		const mustPayTarget = this.getExpenseTotal('must-pay');
		const niceToHaveTarget = this.getExpenseTotal('nice-to-have');
		// tax comes from gig take-home before other allocations
		const taxReserve = netIncome * this.taxrate;
		let remaining = Math.max(netIncome - taxReserve, 0);
		const billPayment = Math.min(remaining, Math.max(mustPayTarget - mustPayAlreadyCovered, 0));
		remaining = Math.max(remaining - billPayment, 0);
		// spending and slow month reserve
		const niceToHavePayment = Math.min(
			remaining,
			Math.max(niceToHaveTarget - niceToHaveAlreadyCovered, 0)
		);
		remaining -= niceToHavePayment;
		const reserveTarget = this.monthlyexpenses * this.reserveMonths;
		const reserveAlreadySaved = this.gigs.reduce(
			(total, gig) => total + (gig.plan?.slowMonthReserve ?? 0),
			0
		);
		const slowMonthReserve = Math.min(remaining, Math.max(reserveTarget - reserveAlreadySaved, 0));
		remaining -= slowMonthReserve;
		const allocations: GigAllocation[] = [];
		const goalPercent = this.goalAllocationPercent / 100;

		// fund open goals in list order
		for (const goal of this.goals.filter((item) => item.saved < item.target)) {
			const amount = Math.min(remaining * goalPercent, Math.max(goal.target - goal.saved, 0));

			if (amount > 0) {
				allocations.push({ goalId: goal.id, amount });
				remaining -= amount;
			}
		}

		return {
			allocations,
			summary: {
				gigExpense: Math.max(gigExpense, 0),
				netIncome,
				billPayment,
				taxReserve,
				niceToHavePayment,
				slowMonthReserve,
				goalReserve: allocations.reduce((total, allocation) => total + allocation.amount, 0),
				safeToSpend: Math.max(remaining, 0)
			}
		};
	}

	// check if dates share a month
	private isSameMonth(firstDate: string, secondDate: string): boolean {
		const first = new SvelteDate(firstDate);
		const second = new SvelteDate(secondDate);

		return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth();
	}

	// edit gig and recalculate its plan
	public updateGig(id: number, changes: Omit<Gig, 'id'>): void {
		const existingGig = this.gigs.find((gig) => gig.id === id);

		if (!existingGig) return;

		this.applyAllocations(existingGig.allocations ?? [], -1);
		const remainingGigs = this.gigs.filter((gig) => gig.id !== id);
		this.gigs = remainingGigs;

		const gigExpense = changes.gigExpense ?? existingGig.gigExpense ?? 0;
		const preview = this.getPlanPreview(changes.amount, gigExpense, changes.date);
		const allocations = this.limitAllocations(changes.allocations ?? preview.allocations);
		const goalReserve = allocations.reduce((total, allocation) => total + allocation.amount, 0);
		const availableForGoals = preview.summary.goalReserve + preview.summary.safeToSpend;
		const plan: GigPlan = {
			...preview.summary,
			gigExpense,
			goalReserve,
			safeToSpend: Math.max(availableForGoals - goalReserve, 0)
		};
		const updatedGig: Gig = { ...existingGig, ...changes, id, gigExpense, allocations, plan };

		this.gigs = [updatedGig, ...remainingGigs];
		this.applyAllocations(allocations, 1);
	}

	// remove gig and undo its goal amounts
	public deleteGig(id: number): void {
		const gigToDelete = this.gigs.find((gig) => gig.id === id);

		if (!gigToDelete) return;

		this.gigs = this.gigs.filter((gig) => gig.id !== id);
		this.applyAllocations(gigToDelete.allocations ?? [], -1);
	}

	// add or undo goal amounts
	private applyAllocations(allocations: GigAllocation[], direction: 1 | -1): void {
		for (const allocation of allocations) {
			this.adjustGoalSaved(allocation.goalId, allocation.amount * direction);
		}
	}

	// keep goal amounts within target
	private limitAllocations(allocations: GigAllocation[]): GigAllocation[] {
		const limited: GigAllocation[] = [];

		for (const allocation of allocations) {
			const goal = this.goals.find((item) => item.id === allocation.goalId);
			if (!goal) continue;

			const remaining = Math.max(goal.target - goal.saved, 0);
			const amount = Math.min(Math.max(allocation.amount, 0), remaining);
			if (amount > 0) limited.push({ goalId: goal.id, amount });
		}

		return limited;
	}

	// update saved amount and completion status
	private adjustGoalSaved(id: number, amount: number): void {
		this.goals = this.goals.map((goal) => {
			if (goal.id !== id) return goal;

			const saved = Math.max(Math.min(goal.saved + amount, goal.target), 0);
			return {
				...goal,
				saved,
				completed: saved >= goal.target,
				completedAt:
					saved >= goal.target ? (goal.completedAt ?? new SvelteDate().toISOString()) : undefined
			};
		});
	}

	// reserve saved so far
	public getSlowMonthReserve(): number {
		return this.gigs.reduce((total, gig) => total + (gig.plan?.slowMonthReserve ?? 0), 0);
	}

	// reserve target from settings
	public getSlowMonthReserveTarget(): number {
		return this.monthlyexpenses * this.reserveMonths;
	}

	// create a saving goal
	public addGoal(name: string, target: number): void {
		this.goals = [
			...this.goals,
			{
				id: Date.now(),
				name,
				target,
				saved: 0,
				completed: false
			}
		];
	}

	// rename goal or change target
	public updateGoal(id: number, changes: Pick<Goal, 'name' | 'target'>): void {
		this.goals = this.goals.map((goal) => (goal.id === id ? { ...goal, ...changes } : goal));
	}

	// remove goal
	public deleteGoal(id: number): void {
		this.goals = this.goals.filter((goal) => goal.id !== id);
	}

	// gig income total
	public getTotalIncome(): number {
		return this.gigs.reduce((sum, gig) => sum + gig.amount, 0);
	}

	// total for one expense group
	public getExpenseTotal(group: ExpenseCategory['group']): number {
		return this.expenseCategories
			.filter((category) => category.group === group)
			.reduce((total, category) => total + category.amount, 0);
	}

	// current month totals
	public getMonthlyProgress(): {
		month: string;
		income: number;
		bills: number;
		monthlyBills: number;
		billsPaid: number;
		niceToHavePaid: number;
		taxes: number;
		goalSavings: number;
		slowMonthReserve: number;
		expenses: number;
		saved: number;
	} {
		const latestGig = this.gigs[0];
		const referenceDate = latestGig ? new SvelteDate(latestGig.date) : new SvelteDate();
		// only include gigs from the current month
		const monthGigs = this.gigs.filter((gig) => {
			const date = new SvelteDate(gig.date);
			return (
				date.getFullYear() === referenceDate.getFullYear() &&
				date.getMonth() === referenceDate.getMonth()
			);
		});
		const income = monthGigs.reduce(
			(sum, gig) => sum + (gig.plan?.netIncome ?? Math.max(gig.amount - (gig.gigExpense ?? 0), 0)),
			0
		);
		const goalSavings = monthGigs.reduce(
			(sum, gig) =>
				sum + (gig.allocations ?? []).reduce((total, allocation) => total + allocation.amount, 0),
			0
		);
		// money already assigned to bills, tax, and extras
		const taxes = monthGigs.reduce((sum, gig) => sum + (gig.plan?.taxReserve ?? 0), 0);
		const billsPaid = monthGigs.reduce((sum, gig) => sum + (gig.plan?.billPayment ?? 0), 0);
		const niceToHavePaid = monthGigs.reduce(
			(sum, gig) => sum + (gig.plan?.niceToHavePayment ?? 0),
			0
		);
		const expenses = billsPaid + taxes + niceToHavePaid;

		return {
			month: referenceDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
			income,
			bills: this.getSlowMonthReserveTarget(),
			monthlyBills: this.getExpenseTotal('must-pay'),
			billsPaid,
			niceToHavePaid,
			taxes,
			goalSavings,
			slowMonthReserve: this.getSlowMonthReserve(),
			expenses,
			saved: Math.max(income - expenses, 0)
		};
	}

	// total marked safe to spend
	public getSafeToSpend(): number {
		return this.gigs.reduce((total, gig) => total + (gig.plan?.safeToSpend ?? 0), 0);
	}

	// active goal progress
	public getGoalProgress(): Array<{
		id: number;
		name: string;
		target: number;
		saved: number;
		percent: number;
	}> {
		return this.goals
			.filter((goal) => goal.saved < goal.target)
			.map((goal) => ({
				id: goal.id,
				name: goal.name,
				target: goal.target,
				saved: goal.saved,
				percent: Math.min((goal.saved / goal.target) * 100, 100)
			}));
	}

	// goals at target
	public getCompletedGoals(): Goal[] {
		return this.goals.filter((goal) => goal.saved >= goal.target);
	}

	// estimate totals with extra gigs
	public getForecast(additionalGigs = 0): {
		projectedIncome: number;
		projectedNet: number;
		gigExpenses: number;
		mustPayPayment: number;
		taxes: number;
		niceToHavePayment: number;
		slowMonthReserve: number;
		goalReserve: number;
		safeToSpend: number;
		nextMonth: number;
		threeMonths: number;
		sixMonths: number;
		averageGig: number;
		averageGigExpense: number;
		extraIncome: number;
	} {
		const averageGig = this.gigs.length ? this.getTotalIncome() / this.gigs.length : 0;
		const averageGigExpense = this.gigs.length
			? this.gigs.reduce((total, gig) => total + (gig.gigExpense ?? 0), 0) / this.gigs.length
			: 0;
		const extraGigCount = Math.max(additionalGigs, 0);
		const extraIncome = averageGig * extraGigCount;
		const extraExpenses = averageGigExpense * extraGigCount;
		const gigExpenses =
			this.gigs.reduce((total, gig) => total + (gig.gigExpense ?? 0), 0) + extraExpenses;
		const projectedIncome = this.getTotalIncome() + extraIncome;
		const currentNetIncome = this.gigs.reduce(
			(total, gig) => total + Math.max(gig.amount - (gig.gigExpense ?? 0), 0),
			0
		);
		const projectedExtraNet = Math.max(averageGig - averageGigExpense, 0) * extraGigCount;
		const projectedNet = currentNetIncome + projectedExtraNet;
		let remaining = projectedNet;
		// set aside tax from take-home first
		const taxes = remaining * this.taxrate;
		remaining -= taxes;
		// then cover monthly costs
		const mustPayPayment = Math.min(remaining, this.getExpenseTotal('must-pay'));
		remaining -= mustPayPayment;
		const niceToHavePayment = Math.min(remaining, this.getExpenseTotal('nice-to-have'));
		remaining -= niceToHavePayment;
		const slowMonthReserve = Math.min(remaining, this.monthlyexpenses * this.reserveMonths);
		remaining -= slowMonthReserve;
		let goalReserve = 0;
		const goalPercent = this.goalAllocationPercent / 100;

		// then fund open goals in list order
		for (const goal of this.goals.filter((item) => item.saved < item.target)) {
			const amount = Math.min(remaining * goalPercent, Math.max(goal.target - goal.saved, 0));

			if (amount > 0) {
				goalReserve += amount;
				remaining -= amount;
			}
		}

		const safeToSpend = Math.max(remaining, 0);

		return {
			projectedIncome,
			projectedNet,
			gigExpenses,
			mustPayPayment,
			taxes,
			niceToHavePayment,
			slowMonthReserve,
			goalReserve,
			safeToSpend,
			nextMonth: safeToSpend,
			threeMonths: safeToSpend * 3,
			sixMonths: safeToSpend * 6,
			averageGig,
			averageGigExpense,
			extraIncome
		};
	}
}

// shared app account
export const account = new Account();
