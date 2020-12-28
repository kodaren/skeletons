import type { Writable } from "svelte/store";
import { ApplicationPaths, INavigationState, LoginActions } from "./api-authorization.constants";
import { AuthenticationResultStatus, AuthorizeService } from "./authorize.service";

export class LoginService {
    private authorizeService: AuthorizeService
    private message: Writable<string>
    private redirectToPageEvent: Writable<string>
    constructor(authorizeService: AuthorizeService, message: Writable<string>, redirectToPageEvent: Writable<string>) {
        this.authorizeService = authorizeService
        this.message = message
        this.redirectToPageEvent = redirectToPageEvent
    }

    public async handleAction(action: string) {
        switch (action) {
            case LoginActions.Login:
                const returnUrl = this.getReturnUrl()
                console.log("handleAction", returnUrl)
                await this.login(returnUrl);
                break;
            case LoginActions.LoginCallback:
                await this.processLoginCallback();
                break;
            case LoginActions.LoginFailed:
                this.message.set("Failed to login");
                break;
            case LoginActions.Profile:
                this.redirectToProfile();
                break;
            case LoginActions.Register:
                this.redirectToRegister();
                break;
            default:
                throw new Error(`Invalid action '${action}'`);
        }
    }
    redirectToRegister() {
        throw new Error("Method not implemented.");
    }
    redirectToProfile() {
        throw new Error("Method not implemented.");
    }

    public async login(returnUrl?: string): Promise<void> {
        returnUrl = returnUrl || window.location.pathname
        console.log("in login")
        const state: INavigationState = { returnUrl };
        console.log("login state", state)
        const result = await this.authorizeService.signIn(state);
        this.message.set(undefined);

        switch (result.status) {
            case AuthenticationResultStatus.Redirect:
                break;
            case AuthenticationResultStatus.Success:
                console.log("login success", returnUrl)
                this.navigateToReturnUrl(returnUrl);
                break;
            case AuthenticationResultStatus.Fail:
                this.message.set(result.message);
                this.navigateToReturnUrl(ApplicationPaths.LoginFailed);
                break;
            default:
                throw new Error(
                    `Invalid status result ${(result as any).status}.`
                );
        }
    }

    public async processLoginCallback(): Promise<void> {
        const url = window.location.href;
        console.log("processLoginCallback", url)
        const result = await this.authorizeService.completeSignIn(url);
        switch (result.status) {
            case AuthenticationResultStatus.Redirect:
                // There should not be any redirects as completeSignIn never redirects.
                throw new Error("Should not redirect.");
            case AuthenticationResultStatus.Success:
                const returnUrl = this.getReturnUrl(result.state);
                console.log("processLoginCallback success", returnUrl)
                this.navigateToReturnUrl(returnUrl);
                break;
            case AuthenticationResultStatus.Fail:
                this.message.set(result.message);
                break;
        }
    }

    private navigateToReturnUrl(returnUrl: string) {
        // It's important that we do a replace here so that we remove the callback uri with the
        // fragment containing the tokens from the browser history.
        const path = returnUrl.replace(window.location.origin, "");
        this.redirectToPageEvent.set(path);
    }

    private getReturnUrl(state?: INavigationState): string {
        return (
            (state && state.returnUrl) ||
            ApplicationPaths.DefaultLoginRedirectPath
        );
    }


}
