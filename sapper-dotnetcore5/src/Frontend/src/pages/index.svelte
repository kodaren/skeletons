<script>
	import { metatags } from '@roxi/routify'
	import Icon from 'svelte-awesome/components/Icon.svelte'
	import * as icons from 'svelte-awesome/icons'
	metatags.title = 'My Routify app'
	metatags.description = 'Description coming soon...'
</script>

<div class="center-all">
	<div class="card">
		<h1>Routify auth example</h1>
		<h5>Notes:</h5>

		<!-- <Icon data={icons.beer} scale="4"/> -->
		<ul>
			<li>Oauth / Identity Server</li>
			<li>Embedded login form on protected pages</li>
			<li>No pointless auth in SSR</li>
		</ul>
				
		<!-- <code>npx @roxi/routify init --branch auth</code> -->
	</div>
</div>
