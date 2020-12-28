<script>
  import { Router } from "@roxi/routify";
  import { routes } from "../.routify/routes";
  import { authStore } from "./api-authorization/auth-store";

  // we need to queue our init till after Routify has been initialized
  setTimeout(() => window.routify.inBrowser && authStore.init());
</script>

<style global>
  @import "../assets/global.css";
</style>

<Router {routes} />
