<script lang="ts">
	import { goto, ready } from "@roxi/routify";
	import { onMount } from "svelte";
	import { codeFlowClient, message, redirectToPageEvent, userSubject } from "../../common/globals";
	import type { IUser } from "../../oidc/oidc-code-flow-client";

	let action = "none";
	let msg: string;
	let user: IUser;

	$ready();

	onMount(async () => {
		redirectToPageEvent.store.subscribe((returnUrl: string) => {
			if (returnUrl) $goto(returnUrl);
		});
		userSubject.store.subscribe((u: IUser) => (user = u));

		message.store.subscribe((m: string) => (msg = m));

		await codeFlowClient.handleAction();
	});
</script>

{#if msg}
	{#if user}
		<h2>User: {user && user.name}</h2>
	{/if}

	{#if action}
		<h3>Action: {action}</h3>
	{/if}
	<h3>Message: {msg}</h3>
{/if}
