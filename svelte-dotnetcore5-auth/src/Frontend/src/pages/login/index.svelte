<script lang="ts">
	import { codeFlowClient } from "../../common/globals";

	async function doSignin() {
		await codeFlowClient.authorizeRequest();
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
