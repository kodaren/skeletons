<script>
import { authStore  } from '../../oauth'
</script>
<div class="center-all">
    <h1>ADMIN</h1>

    {#await authStore.getAccessToken()}
        <!-- promise is pending -->
    {:then accessToken}
        <code>{accessToken}</code>
    {/await}
</div>
