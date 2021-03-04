<script lang="ts">
	import { ready } from '@roxi/routify'
	import { onMount } from 'svelte';
import { codeFlowClient } from '../../common/globals';
import type { IUser } from '../../oidc/oidc-code-flow-client';
	import Login from '../login/index.svelte'


	let user: string;
	
	onMount(async () => {
		const profile = await codeFlowClient.getUser();
		if (!profile) {
			await codeFlowClient.authorizeRequest();
		}

		codeFlowClient.userSubject.subscribe((u: IUser) => (user = u && u.name));
	});

	 /**
	 * since SSR normally won't render till all components have been loaded
	 * and our <slot /> will never load, we will have to let SSR do its job
	 * right away by calling $ready()
	 **/
	 $ready()
	
</script>

<div class="admin-module" class:not-authed={!user}>
	{#if user}
		<slot />
	{:else}
		<Login />
	{/if}
</div>
