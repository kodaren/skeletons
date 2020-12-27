<script>
	import { authStore } from '../auth-store'
	const { user } = authStore
	const links = [
		['/index', 'home'],
		['/about', 'about'],
		['/admin', 'admin'],
	]

	function doSignOut()
	{
		authStore.signout()
	}
</script>

<nav>
	<div />
	<div>
		{#each links as [path, name]}
			<a href={path}>{name}</a>
		{/each}
	</div>

	<div>
		{#if $user}
			<span>{$user.name}&nbsp;</span>
			<a href="#signout" on:click={doSignOut}>signout</a>
		{:else}
			<a href="/login">login</a>
		{/if}
	</div>
</nav>
