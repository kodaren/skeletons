<script lang="ts">
	import { goto, ready } from "@roxi/routify";
	import { onMount } from "svelte";
import { codeFlowClient } from "../../common/globals";
import type { IUser } from "../../oidc/oidc-code-flow-client";

	let action = "none"
	let message: string
	let user: IUser

	$ready()

	onMount(async () => {
		
		codeFlowClient.redirectToPageEvent.subscribe((returnUrl: string) => { 
			if (returnUrl) $goto(returnUrl);
		});
		codeFlowClient.userSubject.subscribe((u: IUser) => user = u)

		codeFlowClient.message.subscribe((m: string) => message = m)

		await codeFlowClient.handleAction()

});
</script>

<h2>User: {user && user.name}</h2>

{#if action}
	<h3>Action: {action}</h3>
{/if}

{#if message}
	<h3>Message: {message}</h3>
{/if}
