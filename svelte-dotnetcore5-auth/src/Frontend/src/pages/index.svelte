<script lang="ts">
	import { metatags } from "@roxi/routify";
	import Icon from "svelte-awesome";
	import { home } from "svelte-awesome/icons";
	//import { faThumbsUp } from "@fortawesome/free-regular-svg-icons";

	import { onMount } from "svelte";
	import { codeFlowClient } from "../common/globals";
	import type { IUser } from "../oidc/oidc-code-flow-client";

	let user: string;

	onMount(async () => {
	});

	metatags.title = "My Routify app";
	metatags.description = "Description coming soon...";
</script>

<div class="center-all">
	<div class="card">
		<h1>Routify auth example</h1>
		<h5>Notes:</h5>

		<Icon data={home} scale="4" />
		<ul>
			<li>Oauth / Identity Server</li>
			<li>Embedded login form on protected pages</li>
			<li>No pointless auth in SSR</li>
		</ul>
	</div>
</div>
