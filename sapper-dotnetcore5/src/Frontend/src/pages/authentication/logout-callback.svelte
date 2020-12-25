<script lang="ts">
    import { goto } from "@roxi/routify";

    import { authStore, redirectToPageEvent } from "../../oauth";

    let message: string;

    authStore.message.subscribe((m) => (message = m));

    redirectToPageEvent.subscribe((returnUrl) => {
        if (returnUrl) {
            $goto(returnUrl);
        }
    });

    authStore.processLogoutCallback().then(() => console.log("processed logout callback"))

</script>

<p>Logout callback</p>
{#if message}
    <p>{message}</p>
{/if}
