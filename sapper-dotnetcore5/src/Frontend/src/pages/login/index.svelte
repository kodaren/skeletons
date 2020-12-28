<script lang="ts">

	import { authStore } from "../../api-authorization/auth-store";

	const { loginService } = authStore;

	console.log("loc", window.location.href);

	async function doSignin() {
		await loginService.login();
	}
</script>

<p>&nbsp;</p>
<div class="center-all">
	<div class="card">
		<h3>You need to be logged in to access this page</h3>
		<button class="button" on:click={doSignin}>sign in</button>
	</div>
</div>
<p>&nbsp;</p>
