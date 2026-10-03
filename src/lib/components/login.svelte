<script lang="ts">
	import { account } from '$lib/state/account.svelte';

	let username = $state('');
	let password = $state('');
	let email = $state('');

	function handleSubmit(event: SubmitEvent): void {
		event.preventDefault();
		account.username = username.trim();
	}
</script>

<section class="login-page" aria-label="Sign in to GigGlee">
	<form class="login-form" onsubmit={handleSubmit}>
		<div class="form-heading">
			<div class="brand-mark">GigGlee</div>
			<h1>Sign in</h1>
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
			autocomplete="current-password"
			bind:value={password}
			required
		/>

		<button type="submit">Sign in</button>
		<p class="demo-note">Demo sign-in. Password is not checked or saved.</p>
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
		margin-bottom: 1rem;
		color: var(--sage-strong);
		font-family: 'Itim', Arial, sans-serif;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.form-heading h1 {
		margin: 0;
		color: var(--ink);
		font-size: 1.9rem;
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

	.demo-note {
		margin: 0.2rem 0 0;
		color: var(--muted);
		font-size: 0.73rem;
		line-height: 1.5;
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
