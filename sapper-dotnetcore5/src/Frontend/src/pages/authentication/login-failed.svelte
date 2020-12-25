<script lang="ts">

import { authStore  } from '../../oauth'

let message: string

authStore.message.subscribe(m => message = m);
console.log("Login failed")

</script>

<p>Login failed</p>
{#if message}
<p>{message}</p>
{/if}
