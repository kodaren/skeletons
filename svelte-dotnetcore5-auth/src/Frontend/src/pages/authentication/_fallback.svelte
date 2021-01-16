<script lang="ts">
	import { goto, ready } from "@roxi/routify";
	import { onMount } from "svelte";
	import { codeFlowClient, IUser } from "../../oidc/oidc-code-flow-client";
	import type { SigninResponse } from "../../oidc/signin-response";

	let action = "none"
	let message: string
	let resp: SigninResponse
	let user: IUser

	$ready()

	onMount(async () => {
		
		codeFlowClient.redirectToPageEvent.converter().subscribe((returnUrl: string) => { 
			if (returnUrl) $goto(returnUrl);
		});
		codeFlowClient.userSubject.converter().subscribe((u: IUser) => user = u)

		codeFlowClient.message.converter().subscribe((m: string) => message = m)

		action = window.location.pathname.split("/")[2];
		console.log("Action", action);
		switch(action) {
			case "login-callback":
				resp = await codeFlowClient.processSigninResponse()
				break;
		}
	});
</script>

<h2>User: {user && user.name}</h2>

{#if action}
	<h3>Action: {action}</h3>
{/if}

{#if message}
	<h3>Message: {message}</h3>
{/if}

{#if resp}
	<h3>Token: {resp.access_token}</h3>
{/if}

