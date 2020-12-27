<script lang="ts">
	import { goto } from "@roxi/routify";
	import { onMount } from "svelte";

	import {authStore } from '../../auth-store'

	const {message, loginService, logoutService, redirectToPageEvent} = authStore

	onMount(async () => {
		redirectToPageEvent.subscribe((returnUrl) => {
			if (returnUrl) $goto(returnUrl);
		});

		const action = window.location.pathname.split("/")[2];
        console.log("Action", action);

		if (action.indexOf("/login") > 0)
		{
			await loginService.handleAction(action);
		}
		else if (action.indexOf("/logout") > 0) {
			await logoutService.handleAction(action);
		}


	});
</script>

{#if message}
	<h2>Login fallback {window.location.href}</h2>

	<h3>{message}</h3>
	
{/if}
