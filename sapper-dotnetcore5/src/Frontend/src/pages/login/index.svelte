<script lang="ts">
	import { authStore } from '../../oauth'

	async function doSignin() {
		await authStore.signin()
	}
</script>

<div class="center-all">
	<div class="card">
		<h3>We're super lazy about our login form</h3>
		<p>So we leave it to auth0</p>
		<button class="button" on:click={doSignin}>sign in</button>
	</div>
</div>
