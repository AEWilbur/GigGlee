<script lang="ts">
	// Import the global stylesheet and favicon for every page
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/css/global.css';

	// SvelteKit helpers for route URLs and current page state
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	// This is the layout wrapper around all page content
	let { children } = $props();

	// Sidebar navigation item list for the main app pages
	const navItems: ReadonlyArray<{
		href: '/' | '/add-gig' | '/goals' | '/forecast' | '/settings';
		label: string;
	}> = [
		{ href: '/', label: 'Dashboard' },
		{ href: '/add-gig', label: 'Add Gig' },
		{ href: '/goals', label: 'Goals' },
		{ href: '/forecast', label: 'Forecast' },
		{ href: '/settings', label: 'Settings' }
	];
</script>

<svelte:head>
	<!-- Browser tab icon -->
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app-shell">
	<a class="skip-link" href="#main-content">Skip to content</a>
	<header class="site-header">
		<div class="brand">GigGlee</div>
		<nav class="top-nav" aria-label="Main navigation">
			{#each navItems as item (item.href)}
				<a
					href={resolve(item.href)}
					class:active={page.url.pathname === item.href}
					aria-current={page.url.pathname === item.href ? 'page' : undefined}
				>
					{item.label}
				</a>
			{/each}
		</nav>
	</header>

	<!-- Main page content area -->
	<main id="main-content" class="page-content" tabindex="-1">
		{@render children()}
	</main>
</div>

<style>
	.site-header {
		font-family: 'Itim', sans-serif;
	}
</style>
