<script lang="ts">
  import { Router } from "@roxi/routify";
  import { routes } from "../.routify/routes";
  import { codeFlowClient, IUser } from "./oidc/oidc-code-flow-client";
  import { AppSettings } from "./common/app-settings";
  import { DispatchMessage } from "./common/dispatch-message";

  function initAuth() {
    codeFlowClient.init(
      {
        client_id: AppSettings.ClientId,
        authority: AppSettings.Authority,
      },
      new DispatchMessage<string>(),
      new DispatchMessage<string>(),
      new DispatchMessage<IUser>()
    );
  }
  // we need to queue our init till after Routify has been initialized
  setTimeout(() => window.routify.inBrowser && initAuth());
</script>

<style global>
  @import "../assets/global.css";
</style>

<Router {routes} />
