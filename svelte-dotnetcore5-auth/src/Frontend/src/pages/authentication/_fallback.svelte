<script lang="ts">
	import { goto, ready } from "@roxi/routify";
	import { onMount } from "svelte";
	import { codeFlowClient } from "../../oidc/oidc-code-flow-client";
import type { SigninResponse } from "../../oidc/signin-response";

	let action = "none"
	let resp: SigninResponse

	$ready()

	onMount(async () => {
		action = window.location.pathname.split("/")[2];
		console.log("Action", action);
		switch(action) {
			case "login-callback":
				resp = await codeFlowClient.processSigninResponse()
				break;
		}
	});
</script>

{#if action}
	<h3>{action}</h3>
{/if}

{#if resp}
	<h3>{resp.access_token}</h3>
{/if}

