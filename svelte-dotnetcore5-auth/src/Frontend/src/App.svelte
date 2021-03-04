<script>
  import { Router } from "@roxi/routify";
  import { routes } from "../.routify/routes";

  // we need to queue our init till after Routify has been initialized
  setTimeout(() => window.routify.inBrowser);
</script>

<style global>
  @import "../assets/global.css";
</style>

<Router {routes} />
