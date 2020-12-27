<script lang="ts">
	import { goto } from "@roxi/routify";
	import { onMount } from "svelte";

	import {authStore } from '../../auth-store'

	const {message, loginService, logoutService, redirectToPageEvent} = authStore
	let msg: string
	message.subscribe(m => msg = m)

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

<!-- <h2>Login fallback {window.location.href}</h2> -->

{#if msg}
	<h3>{msg}</h3>
{/if}
