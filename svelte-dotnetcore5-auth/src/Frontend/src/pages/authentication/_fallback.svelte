<script lang="ts">
	import { goto,  ready } from "@roxi/routify";
	import { onMount } from "svelte";

	import {authStore } from '../../api-authorization/auth-store'

	const {message, loginService, logoutService, redirectToPageEvent} = authStore
	let msg: string
	message.subscribe(m => msg = m)

	$ready();

	onMount(async () => {
		redirectToPageEvent.subscribe((returnUrl) => {
			if (returnUrl) $goto(returnUrl);
		});

		const action = window.location.pathname.split("/")[2];
        console.log("Action", action);

		if (action.indexOf("login") >= 0)
		{
			await loginService.handleAction(action);
		}
		else if (action.indexOf("logout") >= 0) {
			await logoutService.handleAction(action);
		}


	});
</script>

{#if msg}
	<h3>{msg}</h3>
{/if}
