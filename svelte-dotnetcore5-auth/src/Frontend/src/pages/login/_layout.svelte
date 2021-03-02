<script lang="ts">
	import { redirect } from "@roxi/routify";
	import { codeFlowClient } from "../../oidc/oidc-code-flow-client";

	/**
	 *  We don't want the login page to visible to logged in user, so we redirect them
	 * Computed property doesn't work as it will flood events
	 **/
	if (codeFlowClient.user) $redirect("/");
</script>

{#if !codeFlowClient.user}
	<slot />
{/if}
