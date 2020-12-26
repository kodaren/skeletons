import { Readable, writable } from 'svelte/store'
import { ApplicationPaths, INavigationState } from './api-authorization/api-authorization.constants'
import { AuthenticationResultStatus, AuthorizeService, IUser } from './api-authorization/authorize.service'

export const authStore = createAuthStore()

export const redirectToPageEvent = writable<string>(null)

function createAuthStore() {
    const loading = writable(true)
    const authenticated = writable(false)
    const message = writable(undefined)
    const authorizeService = new AuthorizeService()

    const user = writable(undefined)

    function init() {
        // update store
        authorizeService.getUserStore()
            .subscribe(u => {
                if (u) {
                    user.set(u)
                    authenticated.set(true)
                }
            })
        loading.set(false)
    }

    async function signin() {
        const returnUrl = window.location.href
        message.set(undefined)
        //display popup
        const result = await authorizeService.signIn({ returnUrl })
        switch (result.status) {
            case AuthenticationResultStatus.Redirect:
                break
            case AuthenticationResultStatus.Success:
                console.log("signin success")
                redirectToPageEvent.set(returnUrl)
                break
            case AuthenticationResultStatus.Fail:
                redirectToPageEvent.set(`${ApplicationPaths.LoginFailedPathComponents}`)
                break
            default:
                throw new Error(`Invalid status result ${(result as any).status}.`)
        }


    }


    async function processLoginCallback(): Promise<void> {
        const url = window.location.href
        const result = await authorizeService.completeSignIn(url)
        switch (result.status) {
            case AuthenticationResultStatus.Redirect:
                // There should not be any redirects as completeSignIn never redirects.
                throw new Error('Should not redirect.')
            case AuthenticationResultStatus.Success:
                const returnUrl = getLoggedInReturnUrl(result.state)
                redirectToPageEvent.set(returnUrl)
                break
            case AuthenticationResultStatus.Fail:
                message.set(result.message)
                break
        }
    }

    async function signout(): Promise<void> {
        const returnUrl = "/"
        const state: INavigationState = { returnUrl }
        const isauthenticated = await authorizeService.isAuthenticated()

        authenticated.set(false)
        user.set(undefined)

        
        if (isauthenticated) {
            console.log("signout authenticated user")
            const result = await authorizeService.signOut(state)
            switch (result.status) {
                case AuthenticationResultStatus.Redirect:
                    break
                case AuthenticationResultStatus.Success:
                    redirectToPageEvent.set(returnUrl)
                    break
                case AuthenticationResultStatus.Fail:
                    message.set(result.message)
                    break
                default:
                    throw new Error('Invalid authentication result status.')
            }
        } else {
            message.set('You successfully logged out!')
        }
    }

    async function processLogoutCallback(): Promise<void> {
        const url = window.location.href
        const result = await authorizeService.completeSignOut(url)
        switch (result.status) {
            case AuthenticationResultStatus.Redirect:
                // There should not be any redirects as the only time completeAuthentication finishes
                // is when we are doing a redirect sign in flow.
                throw new Error('Should not redirect.')
            case AuthenticationResultStatus.Success:
                const returnUrl = getLoggedOutReturnUrl(result.state)
                redirectToPageEvent.set(returnUrl)
                break
            case AuthenticationResultStatus.Fail:
                message.set(result.message)
                break
            default:
                throw new Error('Invalid authentication result status.')
        }
    }

    async function getAccessToken(): Promise<string> {
        return authorizeService.getAccessToken()
    }

    function getLoggedInReturnUrl(state?: INavigationState): string {
        return (state && state.returnUrl) ||
            ApplicationPaths.DefaultLoginRedirectPath
    }

    function getLoggedOutReturnUrl(state?: INavigationState): string {
        return (state && state.returnUrl) ||
            ApplicationPaths.LoggedOut
    }

    return { loading, authenticated, user, message, init, signin, signout, processLoginCallback, processLogoutCallback, getAccessToken }
}

