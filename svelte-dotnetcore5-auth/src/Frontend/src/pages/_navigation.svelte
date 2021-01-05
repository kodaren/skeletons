<script>
	import { authStore } from "../api-authorization/auth-store";
	import Icon from 'svelte-awesome';
  	import { beer, home } from 'svelte-awesome/icons';

	const { user, logoutService, loginService } = authStore;
	const links = [
		["/index", "home", home],
		["/about", "about"],
		["/admin", "admin"],
	];

	function doSignIn() {
		loginService.login();
	}

	function doSignOut() {
		logoutService.logout("/");
	}
</script>

<nav>
	<div />
	<div>
		{#each links as [path, name, icon]}
		<a href={path}>
		{#if icon}
			<Icon data={icon} scale="2"/>
		{/if}
			{name}
		</a>
		{/each}
	</div>

	<div>
		{#if $user}
			<span>{$user.name}&nbsp;</span>
			<a href="#logout" on:click={doSignOut}>Sign out</a>
		{:else}<a href="#login" on:click={doSignIn}>Sign in</a>{/if}
	</div>
</nav>
