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
                await this.login(this.getReturnUrl());
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

    public async login(returnUrl: string): Promise<void> {
        console.log("in login")
        const state: INavigationState = { returnUrl };
        const result = await this.authorizeService.signIn(state);
        this.message.set(undefined);

        switch (result.status) {
            case AuthenticationResultStatus.Redirect:
                break;
            case AuthenticationResultStatus.Success:
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
        const result = await this.authorizeService.completeSignIn(url);
        switch (result.status) {
            case AuthenticationResultStatus.Redirect:
                // There should not be any redirects as completeSignIn never redirects.
                throw new Error("Should not redirect.");
            case AuthenticationResultStatus.Success:
                this.navigateToReturnUrl(this.getReturnUrl(result.state));
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
