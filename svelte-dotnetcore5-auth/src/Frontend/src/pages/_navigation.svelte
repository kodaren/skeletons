<script lang="ts">
	import { onMount } from "svelte";
	import Icon from "svelte-awesome";
	import { beer, home } from "svelte-awesome/icons";

	import { codeFlowClient, userSubject } from "../common/globals";
	import type { IUser } from "../oidc/oidc-code-flow-client";

	let user: IUser;
	onMount(() => {
		userSubject.store.subscribe((u: IUser) => user = u)
	});

	const links = [
		["/index", "home", home],
		["/about", "about"],
		["/admin", "admin"],
	];

	async function doSignIn() {
		await codeFlowClient.authorizeRequest();
	}

	async function doSignOut() {
		await codeFlowClient.signOut();
	}

</script>

<nav>
	<div />
	<div>
		{#each links as [path, name, icon]}
			<a href={path}>
				{#if icon}
					<Icon data={icon} scale="2" />
				{/if}
				{name}
			</a>
		{/each}
	</div>

	<div>
		{#if user}
			<span>{user.name}&nbsp;</span>
			<a href="#logout" on:click={doSignOut}>Sign out</a>
		{:else}<a href="#login" on:click={doSignIn}>Sign in</a>{/if}
	</div>
</nav>
