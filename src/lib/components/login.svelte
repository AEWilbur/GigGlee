<script lang="ts">
	import { goto } from '$app/navigation';
	import { account } from '$lib/state/account.svelte';
	import logo from '$lib/assets/gigglee-logo.svg';

	let username = $state('');
	let password = $state('');
	let email = $state('');
	let mode = $state<'sign-in' | 'create-account'>('sign-in');
	const creatingAccount = $derived(mode === 'create-account');

	async function handleSubmit(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		account.username = username.trim();
		await goto('/');
	}
</script>

<section
	class="login-page"
	aria-label={creatingAccount ? 'Create a GigGlee account' : 'Sign in to GigGlee'}
>
	<form class="login-form" onsubmit={handleSubmit}>
		<div class="form-heading">
			<img class="brand-mark" src={logo} alt="GigGlee" />
			<h1>{creatingAccount ? 'Create account' : 'Sign in'}</h1>
		</div>

		<div class="auth-tabs" aria-label="Account access">
			<button
				type="button"
				class:active={!creatingAccount}
				aria-pressed={!creatingAccount}
				onclick={() => (mode = 'sign-in')}>Sign in</button
			>
			<button
				type="button"
				class:active={creatingAccount}
				aria-pressed={creatingAccount}
				onclick={() => (mode = 'create-account')}>Create account</button
			>
		</div>

		<label for="login-name">Your name</label>
		<input
			id="login-name"
			name="username"
			type="text"
			autocomplete="name"
			bind:value={username}
			required
		/>

		<label for="login-email">Email</label>
		<input
			id="login-email"
			name="email"
			type="email"
			autocomplete="email"
			bind:value={email}
			required
		/>

		<label for="login-password">Password</label>
		<input
			id="login-password"
			name="password"
			type="password"
			autocomplete={creatingAccount ? 'new-password' : 'current-password'}
			bind:value={password}
			required
		/>

		<button type="submit">{creatingAccount ? 'Create account' : 'Sign in'}</button>
	</form>
</section>

<style>
	.login-page {
		display: grid;
		flex: 1;
		place-items: center;
		min-width: 0;
		min-height: 100vh;
		padding: 2rem;
		background: var(--paper);
	}

	.login-form {
		display: grid;
		gap: 0.7rem;
		width: min(100%, 26rem);
		padding: 1.75rem;
		border: 1px solid var(--line);
		border-top: 3px solid var(--coral);
		border-radius: 4px;
		background: var(--surface);
	}

	.form-heading {
		margin-bottom: 0.5rem;
	}

	.brand-mark {
		display: block;
		width: min(100%, 220px);
		height: auto;
		margin: 0 0 1rem;
	}

	.form-heading h1 {
		margin: 0;
		color: var(--ink);
		font-size: 1.9rem;
	}

	.auth-tabs {
		display: grid;
		grid-template-columns: 1fr 1fr;
		margin-bottom: 0.35rem;
		border-bottom: 1px solid var(--line);
	}

	.login-form .auth-tabs button {
		min-height: 2.6rem;
		border: 0;
		border-bottom: 3px solid transparent;
		border-radius: 0;
		margin: 0;
		padding: 0.55rem;
		background: transparent;
		color: var(--muted);
		font-weight: 700;
		cursor: pointer;
	}

	.login-form .auth-tabs button.active {
		border-bottom-color: var(--coral);
		color: var(--ink);
	}

	.login-form label {
		margin-top: 0.2rem;
		color: var(--ink);
		font-size: 0.82rem;
		font-weight: 700;
	}

	.login-form input {
		width: 100%;
		min-height: 2.8rem;
		padding: 0.65rem 0.75rem;
		border: 1px solid var(--line);
		border-radius: 2px;
		background: var(--surface);
		color: var(--ink);
	}

	.login-form button {
		min-height: 2.75rem;
		margin-top: 0.5rem;
		border: 0;
		border-radius: 2px;
		background: var(--action);
		color: var(--surface);
		font-weight: 700;
		cursor: pointer;
		transition: background-color 160ms ease;
	}

	.login-form button:hover {
		background: var(--sage-strong);
	}

	.login-form .auth-tabs button:hover {
		background: var(--blue-wash);
	}

	@media (max-width: 800px) {
		.login-page {
			min-height: calc(100vh - 8rem);
			padding: 1.25rem;
		}

		.login-form {
			padding: 1.4rem;
		}
	}
</style>
