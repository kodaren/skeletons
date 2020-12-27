<script>
	import { ready } from '@roxi/routify'
	import { authStore } from '../../auth-store'
	import Login from '../login/index.svelte'
	const { user, loading } = authStore

	/**
	 * since SSR normally won't render till all components have been loaded
	 * and our <slot /> will never load, we will have to let SSR do its job
	 * right away by calling $ready()
	 **/
	$ready()
</script>

<div class="admin-module" class:not-authed={!$user}>
	{#if !window.routify.inBrowser}
		Hello bot. This page is only available to humans.
	{:else if $loading}
		<div class="center-all">
			<h1>Loading...</h1>
		</div>
	{:else if $user}
		<slot />
	{:else}
		<Login />
	{/if}
</div>
