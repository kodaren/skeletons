import { User, UserManager } from 'oidc-client'
import { derived, Readable, readable, writable } from 'svelte/store'
import { ApplicationPaths, ApplicationName, Authority } from './api-authorization.constants'

export type IAuthenticationResult =
  SuccessAuthenticationResult |
  FailureAuthenticationResult |
  RedirectAuthenticationResult

export interface SuccessAuthenticationResult {
  status: AuthenticationResultStatus.Success
  state: any
}

export interface FailureAuthenticationResult {
  status: AuthenticationResultStatus.Fail
  message: string
}

export interface RedirectAuthenticationResult {
  status: AuthenticationResultStatus.Redirect
}

export enum AuthenticationResultStatus {
  Success,
  Redirect,
  Fail
}

export interface IUser {
  name?: string
}

export class AuthorizeService {
  // By default pop ups are disabled because they don't work properly on Edge.
  // If you want to enable pop up authentication simply set this flag to false.

  private popUpDisabled = true
  private userManager: UserManager
  private userSubject = writable<IUser | null>(null)

  private getUserFromStorage = readable<IUser>(null, set => {
    const somefunc = async () => {
      await this.ensureUserManagerInitialized()
      await this.userManager.getUser().then(u => {
        if (u && u.profile) {
          set(u.profile)
        }
      })
    }
    somefunc()
  })

  public hasUserManager = () => !!this.userManager
  
  public async isAuthenticated(): Promise<boolean> {
    const u = await this.getUser()
    return !!u
  }

  public getUser(): Promise<IUser> {
    return new Promise((resolve) => {
      this.getUserStore().subscribe(u => resolve(u));
    })
  }

  public getUserStore(): Readable<IUser> {
    return derived([this.userSubject, this.getUserFromStorage], ([$a, $b]) => {
      return $a ? $a : $b
    })
  }

  public async getUserFromStorage2(): Promise<IUser | null>
  {
    await this.ensureUserManagerInitialized()
    return await this.userManager.getUser().then(u => u && u.profile);

  }
  
  public async getAccessToken(): Promise<string> {
    await this.ensureUserManagerInitialized()
    return await this.userManager.getUser().then(u => u && u.access_token)
  }

  // We try to authenticate the user in three different ways:
  // 1) We try to see if we can authenticate the user silently. This happens
  //    when the user is already logged in on the IdP and is done using a hidden iframe
  //    on the client.
  // 2) We try to authenticate the user using a PopUp Window. This might fail if there is a
  //    Pop-Up blocker or the user has disabled PopUps.
  // 3) If the two methods above fail, we redirect the browser to the IdP to perform a traditional
  //    redirect flow.
  public async signIn(state: any): Promise<IAuthenticationResult> {
    await this.ensureUserManagerInitialized()
    let user: User = null
    try {
      user = await this.userManager.signinSilent(this.createArguments())
      console.log("user profile", user.profile)
      this.userSubject.set(user.profile)
      return this.success(state)
    } catch (silentError) {
      // User might not be authenticated, fallback to popup authentication
      if (await this.isAuthenticated())
      {
        console.log('Silent authentication error: ', silentError)
      }
      
      try {
        if (this.popUpDisabled) {
          throw new Error('Popup disabled. Change \'authorize.service.ts:AuthorizeService.popupDisabled\' to false to enable it.')
        }
        user = await this.userManager.signinPopup(this.createArguments())
        this.userSubject.set(user.profile)
        return this.success(state)
      } catch (popupError) {
        if (popupError.message === 'Popup window closed') {
          // The user explicitly cancelled the login action by closing an opened popup.
          return this.error('The user closed the window.')
        } else if (!this.popUpDisabled) {
          console.log('Popup authentication error: ', popupError)
        }

        // PopUps might be blocked by the user, fallback to redirect
        try {
          //console.log("fallback to redirect", state)
          await this.userManager.signinRedirect(this.createArguments(state))
          return this.redirect()
        } catch (redirectError) {
          console.log('Redirect authentication error: ', redirectError)
          return this.error(redirectError)
        }
      }
    }
  }

  public async completeSignIn(url: string): Promise<IAuthenticationResult> {
    try {
      await this.ensureUserManagerInitialized()
      const user = await this.userManager.signinCallback(url)
      this.userSubject.set(user && user.profile)
      return this.success(user && user.state)
    } catch (error) {
      console.log('There was an error signing in: ', error)
      return this.error('There was an error signing in.')
    }
  }

  public async signOut(state: any): Promise<IAuthenticationResult> {
    try {
      if (this.popUpDisabled) {
        throw new Error('Popup disabled. Change \'authorize.service.ts:AuthorizeService.popupDisabled\' to false to enable it.')
      }

      await this.ensureUserManagerInitialized()
      await this.userManager.signoutPopup(this.createArguments())
      this.userSubject.set(null)
      return this.success(state)
    } catch (popupSignOutError) {
      console.log('Popup signout error: ', popupSignOutError)
      try {
        await this.userManager.signoutRedirect(this.createArguments(state))
        return this.redirect()
      } catch (redirectSignOutError) {
        console.log('Redirect signout error: ', redirectSignOutError)
        return this.error(redirectSignOutError)
      }
    }
  }

  public async completeSignOut(url: string): Promise<IAuthenticationResult> {
    await this.ensureUserManagerInitialized()
    try {
      const response = await this.userManager.signoutCallback(url)
      this.userSubject.set(null)
      return this.success(response && response.state)
    } catch (error) {
      console.log(`There was an error trying to log out '${error}'.`)
      return this.error(error)
    }
  }

  private createArguments(state?: any): any {
    return { useReplaceToNavigate: true, data: state }
  }

  private error(message: string): IAuthenticationResult {
    return { status: AuthenticationResultStatus.Fail, message }
  }

  private success(state: any): IAuthenticationResult {
    return { status: AuthenticationResultStatus.Success, state }
  }

  private redirect(): IAuthenticationResult {
    return { status: AuthenticationResultStatus.Redirect }
  }

  private async ensureUserManagerInitialized(): Promise<void> {
    if (this.userManager !== undefined) {
      return
    }

    const response = await fetch(`${Authority}${ApplicationPaths.ApiAuthorizationClientConfigurationUrl}`)
    if (!response.ok) {
      throw new Error(`Could not load settings for '${ApplicationName}'`)
    }

    const settings: any = await response.json()
    console.table("Loaded OIDC settings", settings)

    this.userManager = new UserManager(settings)
    this.userManager.events.addUserSignedOut(async () => {
      await this.userManager.removeUser()
      this.userSubject.set(null)
    })
  }


}
