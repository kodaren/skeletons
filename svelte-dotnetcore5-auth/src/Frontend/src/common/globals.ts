import { OidcCodeFlowClient, IOidcCodeFlowClientSettings } from "../oidc/oidc-code-flow-client";
import { AppSettings } from "./app-settings";
import { DispatchMessage } from "./dispatch-message";

export class Globals {
    public client: OidcCodeFlowClient;

    constructor()
    {
        const settings: IOidcCodeFlowClientSettings =
        {
            options: {
                client_id: AppSettings.ClientId,
                authority: AppSettings.Authority,
            },
            message: new DispatchMessage(),
            redirectToPageEvent: new DispatchMessage(),
            userSubject: new DispatchMessage(null)
        };
      
        this.client = new OidcCodeFlowClient(settings)
    }

}

const codeFlowClient = new Globals().client;
export { codeFlowClient }

