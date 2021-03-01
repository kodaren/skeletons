<script>
	import { url } from "@roxi/routify";
</script>

<div class="container">
<div class="notfound404">
	<div>
		<h1>404</h1>
	</div>
	<div>Did you take a wrong turn?</div>

	<div>
		<a href={$url("../")}>
			<button type="button">Go to start page</button>
		</a>
	</div>
</div>
</div>
<style>
	.container {
		display: flex;
		margin:0;
		padding:0;
		background-color: rgb(235, 141, 203);
		width: 100%;		
		height: 100%;
		justify-content:space-evenly
	}
	div.notfound404 {
		margin-top: 100px;
		font-size: 5rem;
		font-family: Roboto;
		font-weight: 400;
	}

	div {
		flex-wrap: nowrap;
		justify-content: space-evenly;
	}

	h1 {
		line-height: 0;
	}
	button {
		font-size: 2rem;
		padding: 20px;
		border-radius: 20px;
	}
</style>
