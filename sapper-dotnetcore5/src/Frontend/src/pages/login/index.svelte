<script lang="ts">
	import { authStore} from '../../auth-store'
	import { url } from "@roxi/routify";

	const {loginService} = authStore

	async function doSignin() {
		await loginService.login('/')
	}
</script>

<h3>{$url()}</h3>
<div class="center-all">
	<div class="card">
		<h3>We're super lazy about our login form</h3>
		<p>So we leave it to auth0</p>
		<button class="button" on:click={doSignin}>sign in</button>
	</div>
</div>
