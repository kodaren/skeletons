<script>
	import { authStore } from "../../api-authorization/auth-store";
	import { redirect } from "@roxi/routify";
	const { user } = authStore;

	/**
	 *  We don't want the login page to visible to logged in user, so we redirect them
	 * Computed property doesn't work as it will flood events
	 **/
	if ($user) $redirect("/");
</script>

{#if !$user}
	<slot />
{/if}
