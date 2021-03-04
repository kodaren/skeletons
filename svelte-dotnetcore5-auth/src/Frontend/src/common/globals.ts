import { OidcCodeFlowClient, IOidcCodeFlowClientSettings, IUser } from "../oidc/oidc-code-flow-client";
import { AppSettings } from "./app-settings";
import { DispatchMessage } from "./dispatch-message";

export class Globals {
    public client: OidcCodeFlowClient;
    public message = new DispatchMessage<string>()
    public redirectToPageEvent = new DispatchMessage<string>()
    public userSubject  = new DispatchMessage<IUser | null>(); 
    constructor()
    {
        const settings: IOidcCodeFlowClientSettings =
        {
            options: {
                client_id: AppSettings.ClientId,
                authority: AppSettings.Authority,
            },
            message: this.message,
            redirectToPageEvent: this.redirectToPageEvent,
            userSubject: this.userSubject
        };
      
        this.client = new OidcCodeFlowClient(settings)
    }

}

const globals = new Globals()
const { client, message, redirectToPageEvent, userSubject } = globals

export { client as codeFlowClient, message, redirectToPageEvent, userSubject  }

