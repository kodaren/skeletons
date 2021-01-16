import { SigninState } from './signin-state'
import { webStorage } from './helpers/web-storage'
import { SigninResponse } from './signin-response'

export interface IDispatchMessage<T> {
    dispatch(message: T): any
    converter(): any
}

export interface IUser {
    name?: string
}

export interface IIdServerUris {
    AccessToken: string
    AuthorizeRequest: string
    LoginCallback: string
    UserInfo: string
}

export class IdToken {
    id_token: string
    access_token: string
    expires_at: number
    scope: string

    get expires_in() {
        if (this.expires_at) {
            let now = Math.round(Date.now() / 1000)
            return this.expires_at - now
        }
        return undefined;
    }
    set expires_in(value: any){
        let expires_in = parseInt(value);
        if (typeof expires_in === 'number' && expires_in > 0) {
            let now = Math.round(Date.now() / 1000);
            this.expires_at = now + expires_in;
        }
    }

    get expired() {
        let expires_in = this.expires_in;
        if (expires_in !== undefined) {
            return expires_in <= 0;
        }
        return undefined;
    }

    get scopes() {
        return (this.scope || "").split(" ");
    }

}


export class OidcCodeFlowClient {

    public message: IDispatchMessage<string>
    public redirectToPageEvent: IDispatchMessage<string>
    public userSubject: IDispatchMessage<IUser | null>

    private idServerUris: IIdServerUris

    private settings: OidcClientSettings;
    private options: OidcClientSettings = {
        authority: window.location.origin,
        loadUserInfo: true
    }
    private signinResponse: SigninResponse

    public user: IUser

    public get isAuthenticated(): boolean {
      
        return !!this.user
    }


    public init(options: OidcClientSettings,  
        message: IDispatchMessage<string>, 
        redirectToPageEvent: IDispatchMessage<string>, 
        userSubject: IDispatchMessage<IUser | null>,
        basePath: string = window.location.origin
        ): void {
        if (!options.client_id) {
            throw new Error("client_id must be specified")
        }
        if (!options.authority) {
            throw new Error("authority must be specified")
        }

        this.options = { ...options }
        console.log("options", options)
        this.message = message
        this.redirectToPageEvent = redirectToPageEvent
        this.userSubject = userSubject
        this.idServerUris = {
            AccessToken: `${options.authority}/connect/token`,
            AuthorizeRequest: `${options.authority}/connect/authorize`,
            LoginCallback: `${basePath}/authentication/login-callback`,
            UserInfo: `${options.authority}/connect/userinfo`

        }
    }

    public async getUser(): Promise<IUser> {

        const accessToken = await this.getAccessToken()
        if (!accessToken) {
            return null;
        }

        const headers = new Headers();
        headers.append("Content-Type", "application/json")
        headers.append("Authorization", "Bearer " + accessToken)
        const resp = await fetch(this.idServerUris.UserInfo, {
            method: 'GET',
            headers: headers
        })
        if (resp.ok) {
            const user = await resp.json()
            this.user = user as IUser
            this.userSubject.dispatch(user as IUser)
            console.log("getUser", user)
            return user;
        }
        throw new Error("Could not get user info:\n" + resp.statusText)

    }


    public async getClientSettings(): Promise<OidcClientSettings> {

        if (this.settings) {
            return Promise.resolve(this.settings)
        }

        const response = await fetch(`${this.options.authority}/_configuration/${this.options.client_id}`)
        if (!response.ok) {
            throw new Error(`Could not load settings for '${this.options.client_id}'`)
        }

        return await response.json()

    }

    public async authorizeRequest(returnUrl: string): Promise<void> {
        const settings = await this.getClientSettings()

        const signInState = new SigninState({
            nonce: true, authority: settings.authority, client_id: settings.client_id,
            return_uri: returnUrl,
            redirect_uri: this.idServerUris.LoginCallback, response_mode: "query", scope: settings.scope,
            code_verifier: true, skipUserInfo: false
        })

        await webStorage.clear()
        await webStorage.set(signInState.id, signInState.toStorageString())

        const code_challenge = await signInState.getCodeChallenge()

        const query = `?client_id=${settings.client_id}`
            + `&redirect_uri=${encodeURIComponent(settings.redirect_uri)}`
            + `&response_type=code`
            + `&scope=${encodeURIComponent(settings.scope)}`
            + `&state=${signInState.id}`
            + `&code_challenge=${code_challenge}`
            + `&code_challenge_method=S256`
            + `&response_mode=${signInState.response_mode}`

        const url = `${this.idServerUris.AuthorizeRequest}${query}`
        console.log("authorizeRequest", url)

        //window.location.href = url
        //window.location.replace(url)
        window.open(url, "loginwin")

    }
    public async getSigninState(): Promise<SigninState> {
        const state = await webStorage.get(this.signinResponse && this.signinResponse.state)
        if (!state) {
            return null;
        }
        return SigninState.fromStorageString(state)

    }
    
    public async processSigninResponse(): Promise<SigninResponse> {
        const useQuery = true
        const delimiter = useQuery ? "?" : "#"
        this.signinResponse = new SigninResponse(window.location.href, delimiter)
        await this.addTokenValues()
        console.log("processSigninResponse token", this.signinResponse)

        const user = await this.getUser()
        console.log("processSigninResponse user", user)
        this.message.dispatch(user ? "Userinfo has been loaded": "Failed to load user info")

        const state = await this.getSigninState()
        this.redirectToPageEvent.dispatch(state.return_uri)

        return Promise.resolve(this.signinResponse)
    }


    private async addTokenValues(): Promise<void> {
        const token = await this.getTokenFromEndpoint()
        await webStorage.set("token", JSON.stringify(token))
        
        this.signinResponse.id_token = token.id_token
        this.signinResponse.access_token = token.access_token
        this.signinResponse.expires_in = token.expires_in
    }

    private async getToken(): Promise<IdToken> {
        let token: IdToken
        let tokenStr = await webStorage.get("token")
        if (tokenStr) {
            token = JSON.parse(tokenStr)
        }
        
        if (token && token.expired) // Check refresh token whem x % is left
        {
            console.log("TODO: Getting refresh token")
            // Try and get refresh token
        }

        return token

    }

    public async getAccessToken(): Promise<string> {

        let token = await this.getToken()
        return token && token.access_token

    }

    public async getTokenFromEndpoint(): Promise<IdToken> {
        const state = await this.getSigninState()
        if (!state)
        {
            return null
        }
        //console.log("code verifier", state.code_verifier.length)
        console.log("getAccessToken", state)
        const formData = `client_id=${this.options.client_id}`
            + `&grant_type=authorization_code`
            + `&redirect_uri=${encodeURIComponent(state.redirect_uri)}`
            + `&code=${this.signinResponse.code}`
            + `&code_verifier=${encodeURIComponent(state.code_verifier)}`

        const response = await fetch(this.idServerUris.AccessToken, {
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Could not get access token')
        }

        return await response.json()

    }

}

export const codeFlowClient = new OidcCodeFlowClient();

export interface OidcClientSettings {
    /** The URL of the OIDC/OAuth2 provider */
    authority?: string;
    client_id?: string;
    /** The type of response desired from the OIDC/OAuth2 provider (default: 'id_token') */
    response_type?: string;
    /** The scope being requested from the OIDC/OAuth2 provider (default: 'openid') */
    scope?: string;
    /** The redirect URI of your client application to receive a response from the OIDC/OAuth2 provider */
    readonly redirect_uri?: string;
    /** The OIDC/OAuth2 post-logout redirect URI */
    post_logout_redirect_uri?: string;
    /** The OIDC/OAuth2 post-logout redirect URI when using popup */
    /** Flag to control if additional identity data is loaded from the user info endpoint in order to populate the user's profile (default: true) */
    /** Flag to control if additional identity data is loaded from the user info endpoint in order to populate the user's profile (default: true) */
    loadUserInfo?: boolean;

}

