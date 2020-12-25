<script lang="ts">
import { goto } from '@roxi/routify';

import { AuthenticationResultStatus } from '../../api-authorization/authorize.service';


import { authStore, redirectToPageEvent  } from '../../oauth'

let message: string

console.log("Login callback")

authStore.message.subscribe(m => message = m);

redirectToPageEvent.subscribe(returnUrl => {
    if (returnUrl) $goto(returnUrl)
})
authStore.processLoginCallback().then(() => console.log("processed login callback"))

</script>

<p>Login callback</p>
{#if message}
<p>{message}</p>
{/if}
