<script lang="ts">
    import { goto } from "@roxi/routify";

    import { authStore, redirectToPageEvent } from "../../oauth";

    let message: string;

    console.log("Login callback");

    authStore.message.subscribe((m) => (message = m));

    redirectToPageEvent.subscribe((returnUrl) => {
        if (returnUrl) $goto(returnUrl);
    });
    authStore
        .processLoginCallback();
</script>

<p>Login callback</p>
{#if message}
    <p>{message}</p>
{/if}
