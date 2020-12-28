import type { Writable } from "svelte/store";
import { ApplicationPaths, INavigationState, LogoutActions } from "./api-authorization.constants";
import { AuthenticationResultStatus, AuthorizeService } from "./authorize.service";

export class LogoutService {

    private authorizeService: AuthorizeService
    private message: Writable<string>
    private redirectToPageEvent: Writable<string>
    private authenticated: Writable<boolean>
    private user: Writable<any>
    
    constructor(authorizeService: AuthorizeService, 
        message: Writable<string>, 
        authenticated: Writable<boolean>, 
        user: Writable<any>,
        redirectToPageEvent: Writable<string>) {
        this.authorizeService = authorizeService
        this.message = message
        this.authenticated = authenticated
        this.user = user
        this.redirectToPageEvent = redirectToPageEvent
    }

    public async handleAction(action: string)
    {
        switch (action) {
            case LogoutActions.Logout:
              if (!!window.history.state.local) {
                await this.logout(this.getReturnUrl());
              } else {
                // This prevents regular links to <app>/authentication/logout from triggering a logout
                this.message.set('The logout was not initiated from within the page.');
              }
              break;
            case LogoutActions.LogoutCallback:
              await this.processLogoutCallback();
              break;
            case LogoutActions.LoggedOut:
              this.message.set('You successfully logged out!');
              break;
            default:
              throw new Error(`Invalid action '${action}'`);
          }
    }

    public async logout(returnUrl: string): Promise<void> {
        const state: INavigationState = { returnUrl };
        const isauthenticated = await this.authorizeService.isAuthenticated()
       
        this.authenticated.set(false)
        this.user.set(undefined)

        if (isauthenticated) {
            console.log("signout authenticated user")
            const result = await this.authorizeService.signOut(state)
            switch (result.status) {
                case AuthenticationResultStatus.Redirect:
                    break
                case AuthenticationResultStatus.Success:
                    this.redirectToPageEvent.set(returnUrl)
                    break
                case AuthenticationResultStatus.Fail:
                    this.message.set(result.message)
                    break
                default:
                    throw new Error('Invalid authentication result status.')
            }
        } else {
            this.message.set('You successfully logged out!')
        }
    }

    async processLogoutCallback(): Promise<void> {
        const url = window.location.href
        const result = await this.authorizeService.completeSignOut(url)
        switch (result.status) {
            case AuthenticationResultStatus.Redirect:
                // There should not be any redirects as the only time completeAuthentication finishes
                // is when we are doing a redirect sign in flow.
                throw new Error('Should not redirect.')
            case AuthenticationResultStatus.Success:
                const returnUrl = this.getReturnUrl(result.state)
                this.redirectToPageEvent.set(returnUrl)
                break
            case AuthenticationResultStatus.Fail:
                this.message.set(result.message)
                break
            default:
                throw new Error('Invalid authentication result status.')
        }
    }

    private getReturnUrl(state?: INavigationState): string {
        return (
            (state && state.returnUrl) ||
            ApplicationPaths.LoggedOut
        );
    }
}