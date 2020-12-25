<script>
	import { authStore } from '../oauth'
	const { user, signout } = authStore
	const links = [
		['/index', 'home'],
		['/about', 'about'],
		['/admin', 'admin'],
	]
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
			<h2>{$user.name}</h2>
			<!-- <img src={$user.picture} alt="profile - {$user.nickname}" /> -->
			<a href="#signout" on:click={signout}>signout</a>
		{:else}
			<a href="/login">login</a>
		{/if}
	</div>
</nav>
