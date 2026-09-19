import { SvelteDate } from 'svelte/reactivity';

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

export type GigAllocation = {
	goalId: number;
	amount: number;
};

export type GigPlan = {
	gigExpense: number;
	netIncome: number;
	taxReserve: number;
	billPayment: number;
	slowMonthReserve: number;
	goalReserve: number;
	safeToSpend: number;
};

export type ExpenseCategory = {
	name: string;
	amount: number;
};

export type Goal = {
	id: number;
	name: string;
	target: number;
	saved: number;
	completed: boolean;
	completedAt?: string;
};

export class Account {
	private balance: number = $state(0);

	monthlyexpenses: number = $state(0);
	taxrate: number = $state(0);

	goalAllocationPercent: number = $state(60);
	reserveMonths: number = $state(6);

	expenseCategories: ExpenseCategory[] = $state([
		{ name: 'Housing', amount: 0 },
		{ name: 'Utilities', amount: 0 },
		{ name: 'Food', amount: 0 },
		{ name: 'Transportation', amount: 0 },
		{ name: 'Phone & Internet', amount: 0 },
		{ name: 'Other', amount: 0 },
		{ name: 'Equipment', amount: 0 }
	]);

	gigs: Gig[] = $state([]);

	goals: Goal[] = $state([]);

	constructor(initialBalance: number) {
		this.balance = initialBalance;
	}

	public getBalance(): number {
		return this.balance;
	}

	public addGig(gig: Omit<Gig, 'id'>): void {
		const plan = this.getPlanPreview(gig.amount, gig.gigExpense ?? 0, gig.date);
		const newGig: Gig = {
			...gig,
			id: Date.now(),
			allocations: plan.allocations,
			plan: plan.summary
		};

		this.gigs = [newGig, ...this.gigs];
		this.balance += gig.amount;

		this.applyAllocations(newGig.allocations ?? [], 1);
	}

	public getPlanPreview(
		grossIncome: number,
		gigExpense: number,
		gigDate = new SvelteDate().toISOString()
	): { allocations: GigAllocation[]; summary: GigPlan } {
		const netIncome = Math.max(grossIncome - Math.max(gigExpense, 0), 0);
		const billsAlreadyPaid = this.gigs.reduce(
			(total, gig) =>
				total + (this.isSameMonth(gig.date, gigDate) ? (gig.plan?.billPayment ?? 0) : 0),
			0
		);
		const taxReserve = netIncome * this.taxrate;
		const afterTax = Math.max(netIncome - taxReserve, 0);
		const billPayment = Math.min(afterTax, Math.max(this.monthlyexpenses - billsAlreadyPaid, 0));
		let remaining = afterTax - billPayment;
		const reserveTarget = this.monthlyexpenses * this.reserveMonths;
		const reserveAlreadySaved = this.gigs.reduce(
			(total, gig) => total + (gig.plan?.slowMonthReserve ?? 0),
			0
		);
		const slowMonthReserve = Math.min(remaining, Math.max(reserveTarget - reserveAlreadySaved, 0));
		remaining -= slowMonthReserve;
		const allocations: GigAllocation[] = [];
		const goalPercent = this.goalAllocationPercent / 100;

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
				taxReserve,
				billPayment,
				slowMonthReserve,
				goalReserve: allocations.reduce((total, allocation) => total + allocation.amount, 0),
				safeToSpend: Math.max(remaining, 0)
			}
		};
	}

	private isSameMonth(firstDate: string, secondDate: string): boolean {
		const first = new SvelteDate(firstDate);
		const second = new SvelteDate(secondDate);

		return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth();
	}

	public updateGig(id: number, changes: Omit<Gig, 'id'>): void {
		const existingGig = this.gigs.find((gig) => gig.id === id);

		if (!existingGig) return;

		this.applyAllocations(existingGig.allocations ?? [], -1);
		const allocations = this.limitAllocations(changes.allocations ?? []);
		this.gigs = this.gigs.map((gig) => (gig.id === id ? { ...changes, id, allocations } : gig));
		this.balance += changes.amount - existingGig.amount;
		this.applyAllocations(allocations, 1);
	}

	public deleteGig(id: number): void {
		const gigToDelete = this.gigs.find((gig) => gig.id === id);

		if (!gigToDelete) return;

		this.gigs = this.gigs.filter((gig) => gig.id !== id);
		this.balance -= gigToDelete.amount;
		this.applyAllocations(gigToDelete.allocations ?? [], -1);
	}

	private applyAllocations(allocations: GigAllocation[], direction: 1 | -1): void {
		for (const allocation of allocations) {
			this.adjustGoalSaved(allocation.goalId, allocation.amount * direction);
		}
	}

	private limitAllocations(allocations: GigAllocation[]): GigAllocation[] {
		return allocations
			.map((allocation) => {
				const goal = this.goals.find((item) => item.id === allocation.goalId);
				if (!goal) return null;

				return {
					goalId: allocation.goalId,
					amount: Math.min(Math.max(allocation.amount, 0), Math.max(goal.target - goal.saved, 0))
				};
			})
			.filter(
				(allocation): allocation is GigAllocation => allocation !== null && allocation.amount > 0
			);
	}

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

	public getSlowMonthReserve(): number {
		return this.gigs.reduce((total, gig) => total + (gig.plan?.slowMonthReserve ?? 0), 0);
	}

	public getBillsPaid(): number {
		const referenceDate = this.gigs[0]?.date;
		if (!referenceDate) return 0;

		return this.gigs.reduce(
			(total, gig) =>
				total + (this.isSameMonth(gig.date, referenceDate) ? (gig.plan?.billPayment ?? 0) : 0),
			0
		);
	}

	public getSlowMonthReserveTarget(): number {
		return this.monthlyexpenses * this.reserveMonths;
	}

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

	public updateGoal(id: number, changes: Pick<Goal, 'name' | 'target'>): void {
		this.goals = this.goals.map((goal) => (goal.id === id ? { ...goal, ...changes } : goal));
	}

	public deleteGoal(id: number): void {
		this.goals = this.goals.filter((goal) => goal.id !== id);
	}

	public saveToGoal(id: number, amount: number): void {
		this.goals = this.goals.map((goal) => {
			if (goal.id !== id) return goal;

			const saved = Math.min(goal.saved + Math.max(amount, 0), goal.target);
			return {
				...goal,
				saved,
				completed: saved >= goal.target,
				completedAt:
					saved >= goal.target ? (goal.completedAt ?? new SvelteDate().toISOString()) : undefined
			};
		});
	}

	public getTotalIncome(): number {
		return this.gigs.reduce((sum, gig) => sum + gig.amount, 0);
	}

	public getMonthlyProgress(): {
		month: string;
		income: number;
		bills: number;
		monthlyBills: number;
		billsPaid: number;
		taxes: number;
		goalSavings: number;
		slowMonthReserve: number;
		expenses: number;
		saved: number;
	} {
		const latestGig = this.gigs[0];
		const referenceDate = latestGig ? new SvelteDate(latestGig.date) : new SvelteDate();
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
		const expenses = this.monthlyexpenses + income * this.taxrate;

		return {
			month: referenceDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
			income,
			bills: this.getSlowMonthReserveTarget(),
			monthlyBills: this.monthlyexpenses,
			billsPaid: this.getBillsPaid(),
			taxes: income * this.taxrate,
			goalSavings,
			slowMonthReserve: this.getSlowMonthReserve(),
			expenses,
			saved: Math.max(income - expenses, 0)
		};
	}

	public getTaxEstimate(): number {
		return this.getTotalIncome() * this.taxrate;
	}

	public getSafeToSpend(): number {
		return this.gigs.reduce((total, gig) => total + (gig.plan?.safeToSpend ?? 0), 0);
	}

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

	public getCompletedGoals(): Goal[] {
		return this.goals.filter((goal) => goal.saved >= goal.target);
	}

	public getForecast(additionalGigs = 0): {
		projectedIncome: number;
		bills: number;
		taxes: number;
		nextMonth: number;
		threeMonths: number;
		sixMonths: number;
		averageGig: number;
		averageGigExpense: number;
		extraIncome: number;
		extraExpenses: number;
	} {
		const averageGig = this.gigs.length ? this.getTotalIncome() / this.gigs.length : 0;
		const averageGigExpense = this.gigs.length
			? this.gigs.reduce((total, gig) => total + (gig.gigExpense ?? 0), 0) / this.gigs.length
			: 0;
		const extraIncome = averageGig * Math.max(additionalGigs, 0);
		const extraExpenses = averageGigExpense * Math.max(additionalGigs, 0);
		const projectedIncome = this.getTotalIncome() + extraIncome;
		const projectedNet = projectedIncome - extraExpenses;
		const bills = this.monthlyexpenses;
		const taxes = projectedNet * this.taxrate;
		const available = Math.max(projectedNet - taxes - bills, 0);

		return {
			projectedIncome,
			bills,
			taxes,
			nextMonth: available,
			threeMonths: available * 3,
			sixMonths: available * 6,
			averageGig,
			averageGigExpense,
			extraIncome,
			extraExpenses
		};
	}
}

export const account = new Account(1247);
