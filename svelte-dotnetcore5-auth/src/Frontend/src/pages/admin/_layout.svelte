<script lang="ts">
	import { ready } from '@roxi/routify'
	import { codeFlowClient, IUser } from '../../oidc/oidc-code-flow-client';
	import Login from '../login/index.svelte'
	const { userSubject } = codeFlowClient

	let user = userSubject.converter()
	
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
	{:else if $user}
		<slot />
	{:else}
		<Login />
	{/if}
</div>
