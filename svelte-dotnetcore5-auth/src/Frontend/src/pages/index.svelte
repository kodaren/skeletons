<script lang="ts">
	import { metatags } from "@roxi/routify";
	import Icon from "svelte-awesome";
	import { home } from "svelte-awesome/icons";
	//import { faThumbsUp } from "@fortawesome/free-regular-svg-icons";

	import { codeFlowClient, IUser } from "../oidc/oidc-code-flow-client";
	import { onMount } from "svelte";
import type { Writable } from "svelte/store";
import type { DispatchMessage } from "../common/dispatch-message";

	let user;

	onMount(async () => {
		const profile = await codeFlowClient.getUser();
		if (!profile) {
			await codeFlowClient.authorizeRequest(window.location.origin + "/");
		}

		const userSubject = (codeFlowClient.userSubject as DispatchMessage<IUser>).store
		userSubject.subscribe((u) => (user = u && u.name));
	});

	metatags.title = "My Routify app";
	metatags.description = "Description coming soon...";
</script>

<h3>Name: {user}</h3>

<div class="center-all">
	<div class="card">
		<h1>Routify auth example</h1>
		<h5>Notes:</h5>

		<Icon data={home} scale="4" />
		<ul>
			npm
			<li>Oauth / Identity Server</li>
			<li>Embedded login form on protected pages</li>
			<li>No pointless auth in SSR</li>
		</ul>
	</div>
</div>
