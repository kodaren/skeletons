<script lang="ts">
import { onMount } from "svelte";

	import { codeFlowClient, message } from "../../common/globals";

	let msg: string;
	onMount(() => {
		message.store.subscribe((m: string) => (msg = m));
	})

	async function doSignin() {
		await codeFlowClient.authorizeRequest();
	}
</script>

{#if msg}
	<div>{msg}</div>
{/if}


<p>&nbsp;</p>
<div class="center-all">
	<div class="card">
		<h3>You need to be logged in to access this page</h3>
		<button class="button" on:click={doSignin}>sign in</button>
	</div>
</div>
<p>&nbsp;</p>
