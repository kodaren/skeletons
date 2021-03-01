<script lang="ts">
	
	import { codeFlowClient } from "../../oidc/oidc-code-flow-client";

	async function doSignin() {
		await codeFlowClient.authorizeRequest();
		// const profile = await codeFlowClient.getUser();
		// if (!profile) {
		// 	await codeFlowClient.authorizeRequest(window.location.origin + "/");
		// }
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
