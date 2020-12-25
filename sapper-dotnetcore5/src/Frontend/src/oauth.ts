import { writable } from 'svelte/store'
import { ApplicationPaths, INavigationState } from './api-authorization/api-authorization.constants'
import { AuthenticationResultStatus, AuthorizeService } from './api-authorization/authorize.service'

export const authStore = createAuthStore()

export const redirectToPageEvent = writable<string>(null)

function createAuthStore() {
    const loading = writable(true)
    const authenticated = writable(false)
    const user = writable(null)
    const message = writable(undefined)
    const authorizeService = new AuthorizeService()

    async function init() {
        // update store

        user.set(await authorizeService.getUser())
        loading.set(false)
        authenticated.set(true)

    }

    user.subscribe(u => {
        console.log("user value changed", u)
    })

    async function signin() {
        const returnUrl = window.location.href
        message.set(undefined)
        console.log("returnUrl", returnUrl)
        //display popup
        const result = await authorizeService.signIn({ returnUrl })
        switch (result.status) {
            case AuthenticationResultStatus.Redirect:
                break
            case AuthenticationResultStatus.Success:
                user.set(await authorizeService.getUser())
                authenticated.set(true)
                redirectToPageEvent.set(returnUrl);
                break
            case AuthenticationResultStatus.Fail:
                redirectToPageEvent.set(`${ApplicationPaths.LoginFailedPathComponents}`);
                break
            default:
                throw new Error(`Invalid status result ${(result as any).status}.`)
        }


    }

    async function signout() {
        // update store
        authenticated.set(false)
        user.set(undefined)
        authorizeService.completeSignOut("/")

    }

    async function processLoginCallback(): Promise<void> {
        console.log("processLoginCallback")
        const url = window.location.href
        const result = await authorizeService.completeSignIn(url)
        switch (result.status) {
            case AuthenticationResultStatus.Redirect:
                // There should not be any redirects as completeSignIn never redirects.
                throw new Error('Should not redirect.')
            case AuthenticationResultStatus.Success:
                user.set(await authorizeService.getUser())
                authenticated.set(true)
                const returnUrl = getReturnUrl(result.state)
                redirectToPageEvent.set(returnUrl);
                break
            case AuthenticationResultStatus.Fail:
                message.set(result.message)
                break
        }
    }

    async function getAccessToken(): Promise<string>
    {
        return authorizeService.getAccessToken();
    }

    function getReturnUrl(state?: INavigationState): string {
        return (state && state.returnUrl) ||
            ApplicationPaths.DefaultLoginRedirectPath;
    }

    return { loading, authenticated, user, init, signin, signout, processLoginCallback, message, getAccessToken }
}
