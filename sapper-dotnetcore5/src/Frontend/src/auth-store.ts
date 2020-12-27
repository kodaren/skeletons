import { writable } from 'svelte/store'
import { AuthorizeService } from './api-authorization/authorize.service'
import { LoginService } from './api-authorization/login.service'
import { LogoutService } from './api-authorization/logout.service'

export const authStore = createAuthStore()

function createAuthStore() {
    const loading = writable(true)
    const authenticated = writable(false)
    const user = writable(undefined)
    const message = writable(undefined)
    const redirectToPageEvent = writable<string>(null)

    let authorizeService = new AuthorizeService()
    let loginService = new LoginService(authorizeService, message, redirectToPageEvent)
    let logoutService = new LogoutService(authorizeService, message , authenticated, user, redirectToPageEvent)

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

    async function getAccessToken(): Promise<string> {
        return authorizeService.getAccessToken()
    }

    return { loading, authenticated, user, message, redirectToPageEvent, init, getAccessToken, authorizeService, loginService, logoutService }

}

