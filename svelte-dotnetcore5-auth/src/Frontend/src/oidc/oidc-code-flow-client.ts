import { SigninState } from './signin-state'
import { webStorage } from './helpers/web-storage'
import { SigninResponse } from './signin-response'

export class OidcCodeFlowClient {

    private _message: IDispatchMessage<string>
    private _redirectToPageEvent: IDispatchMessage<string>
    private _userSubject: IDispatchMessage<IUser | null>

    private idServerUris: IIdServerUris

    private accessToken: IdToken;

    private settings: IOidcClientSettings;
    private options: IOidcClientSettings = {
        authority: window.location.origin,
        loadUserInfo: true
    }
    private signinResponse: SigninResponse

    public user: IUser

    public get message() {
        console.log("message here")
        return this._message.converter()
    }

    public get userSubject() {
        console.log("userSubject here")
        return this._userSubject.converter()
    }
    public get redirectToPageEvent() {
        console.log("redirectToPageEvent here")
        return this._redirectToPageEvent.converter()
    }

    public get isAuthenticated(): boolean {
      
        return !!this.user
    }


    public init(options: IOidcClientSettings,  
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
        this._message = message
        this._redirectToPageEvent = redirectToPageEvent
        this._userSubject = userSubject
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
            this._userSubject.dispatch(this.user)
            return user;
        }
        throw new Error("Could not get user info:\n" + resp.statusText)

    }

    public async getClientSettings(): Promise<IOidcClientSettings> {

        if (this.settings) {
            return Promise.resolve(this.settings)
        }

        const response = await fetch(`${this.options.authority}/_configuration/${this.options.client_id}`)
        if (!response.ok) {
            throw new Error(`Could not load settings for '${this.options.client_id}'`)
        }

        return await response.json()

    }

    public async authorizeRequest(returnUrl?: string): Promise<void> {

        returnUrl = returnUrl || window.location.pathname

        const settings = await this.getClientSettings()

        const signInState = new SigninState({
            nonce: true, authority: settings.authority, client_id: settings.client_id,
            return_uri: returnUrl,
            redirect_uri: this.idServerUris.LoginCallback, 
            response_mode: "query", scope: settings.scope,
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

        const user = await this.getUser()
        this._message.dispatch(user ? "Userinfo has been loaded": "Failed to load user info")

        const state = await this.getSigninState()
        this.navigateToReturnUrl(state.return_uri)

        return Promise.resolve(this.signinResponse)
    }

    public async handleAction() {
        const action = window.location.pathname.split("/")[2];
		console.log("Action", action);
        switch (action) {
            case "login-callback":
                this._message.dispatch("Processing login callback");
                await this.processSigninResponse();
                break;
            case "login-failed":
                this._message.dispatch("Failed to login");
                break;
            default:
                throw new Error(`Invalid action '${action}'`);
        }
    }

    public navigateToReturnUrl(returnUrl: string) {
        // It's important that we do a replace here so that we remove the callback uri with the
        // fragment containing the tokens from the browser history.
        const path = returnUrl.replace(window.location.origin, "");
        this._redirectToPageEvent.dispatch(path)
    }

    
    private async addTokenValues(): Promise<void> {
        const token = await this.getTokenFromEndpoint()
        this.accessToken = token;
        await webStorage.set("refresh_token", token.refresh_token)
        this._message.dispatch(`access_token: ${token.access_token}`)        
        this.signinResponse.id_token = token.id_token
        this.signinResponse.access_token = token.access_token
        this.signinResponse.expires_in = token.expires_in
    }

    private async getRefreshToken(): Promise<IdToken>
    {
        const refreshToken = await webStorage.get("refresh_token");
        if (!refreshToken) 
        {
            return null;
        }

        const formData = `client_id=${this.options.client_id}`
            + `&grant_type=refresh_token`
            + `&refresh_token=${refreshToken}`;

        const response = await fetch(this.idServerUris.AccessToken, {
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            body: formData
        }).catch(reason => console.error("Could not get access token",  reason));

        if (response && response.ok) {
            return await response.json();
        }

        return null;
    }

    private async getToken(): Promise<IdToken> {

        if (!this.accessToken || this.accessToken.expired)
        {
            const token = await this.getRefreshToken();
            if (token)
            {
                this.accessToken = token;
            }
            else
            {
                this.accessToken = null;
                //this.authorizeRequest("/");
            }
        }

        if (!this.accessToken)
        {
            this.authorizeRequest("/");
        }
        return this.accessToken;

    }

    public async getAccessToken(): Promise<string> {

        let token = await this.getToken()
        return token && token.access_token

    }

    public async getTokenFromEndpoint(): Promise<IdToken> {
        const state = await this.getSigninState()
        if (!state)
        {
            throw new Error('Invalid signin state')
        }

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

export interface IOidcClientSettings {
    authority?: string;
    client_id?: string;
    response_type?: string;
    scope?: string;
    readonly redirect_uri?: string;
    post_logout_redirect_uri?: string;
    loadUserInfo?: boolean;
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

export interface IDispatchMessage<T> {
    dispatch(message: T): any
    converter(): any
}

export class IdToken {
    id_token: string
    access_token: string
    expires_at: number
    scope: string
    refresh_token?: string

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
