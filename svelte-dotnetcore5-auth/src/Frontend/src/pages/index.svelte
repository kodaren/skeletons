<script lang="ts">
	import { metatags } from "@roxi/routify";
	import { onMount } from "svelte";

	onMount(async () => {
	});

	metatags.title = "My Routify app";
	metatags.description = "Description coming soon...";
</script>

<div class="center-all">
	<div class="card">
		<h1>Routify auth example</h1>
		<h5>Notes:</h5>

		<ul>
			<li>Oauth / Identity Server</li>
			<li>Embedded login form on protected pages</li>
			<li>No pointless auth in SSR</li>
		</ul>
	</div>
</div>
