import { SigninState } from './signin-state'
import { webStorage } from './helpers/web-storage'
import { SigninResponse } from './signin-response'
import { SignoutResponse } from './signout-response';
import { UrlUtility } from './helpers/url-utility';

export interface IOidcCodeFlowClientSettings {
    options: IOidcClientSettings;
    message: IDispatchMessage<string>;
    redirectToPageEvent: IDispatchMessage<string>;
    userSubject: IDispatchMessage<IUser | null>;
    basePath?: string;
}

export class OidcCodeFlowClient {

    constructor(clientSettings: IOidcCodeFlowClientSettings) {
        this.init(clientSettings);
        console.debug("init", clientSettings);
    }

    
    public user: IUser

    public get isAuthenticated(): boolean {
        return !!this.user
    }


    private init(clientSettings: IOidcCodeFlowClientSettings): void {

        const { options, message, redirectToPageEvent, userSubject } = clientSettings;
        let basePath = clientSettings.basePath;
        if (!basePath) {
            basePath = window.location.origin;
        }

        if (!options.client_id) {
            throw new Error("client_id must be specified")
        }
        if (!options.authority) {
            throw new Error("authority must be specified")
        }

        this.options = { ...options }
        this.message = message
        this.redirectToPageEvent = redirectToPageEvent
        this.userSubject = userSubject
        this.idServerUris = {
            AccessToken: `${options.authority}/connect/token`,
            AuthorizeRequest: `${options.authority}/connect/authorize`,
            LoginCallback: `${basePath}/authentication/login-callback`,
            LogoutCallback: `${basePath}/authentication/logout-callback`,
            UserInfo: `${options.authority}/connect/userinfo`,
            EndSession: `${options.authority}/connect/endsession`
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
            this.userSubject.dispatch(this.user)
            return user;
        }
        throw new Error("Could not get user info:\n" + resp.statusText)

    }

    public async signOut(returnUrl?: string): Promise<void> {

        returnUrl = returnUrl || "/";
        console.debug("returnUrl", returnUrl);
        await webStorage.set("signout_returnurl", returnUrl);

        const idToken = await webStorage.get("id_token");
        const signoutRequest = `?id_token_hint=${idToken}`
            + `&post_logout_redirect_uri=${encodeURIComponent(this.idServerUris.LogoutCallback)}`

        console.debug("signout", signoutRequest);
        const url = `${this.idServerUris.EndSession}${signoutRequest}`
        console.debug("signout url", url);

        window.open(url, "loginwin")
    
    }

    public async authorizeRequest(returnUrl?: string): Promise<void> {

        returnUrl = returnUrl || window.location.pathname

        const settings = await this.getClientSettings();
        if (!settings) {
            return;
        }
        this.settings = settings;
        
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

    public async processSigninResponse(): Promise<SigninResponse> {
        const useQuery = true
        const delimiter = useQuery ? "?" : "#"
        this.signinResponse = new SigninResponse(window.location.href, delimiter)
        await this.addTokenValues()

        const user = await this.getUser()
        if (!user)
        {
            this.message.dispatch("Failed to load user info")
        }

        const state = await this.getSigninState()
        this.navigateToReturnUrl(state.return_uri)

        return Promise.resolve(this.signinResponse)
    }

    public async processSignoutResponse(): Promise<SignoutResponse> {
        const useQuery = true
        const delimiter = useQuery ? "?" : "#"
        const resp = new SignoutResponse(window.location.href, delimiter)
        console.debug("processSignoutResponse", window.location.href)

        const returnUrl = await webStorage.get("signout_returnurl");

        await webStorage.clear()
        this.accessToken = null;
        this.user = null;
        this.navigateToReturnUrl(returnUrl || "/");

        return Promise.resolve(resp)
    }

    public async handleAction() {
        const action = window.location.pathname.split("/")[2];
        console.log("Action", action);
        switch (action) {
            case "login-callback":
                await this.processSigninResponse();
                break;
            case "login-failed":
                this.message.dispatch("Failed to login");
                break;
            case "logout-callback":
                this.processSignoutResponse();
                break;
            default:
                throw new Error(`Invalid action '${action}'`);
        }
    }

    public async getAccessToken(): Promise<string> {

        let token = await this.getToken()
        return token && token.access_token

    }


    private async getClientSettings(): Promise<IOidcClientSettings> {

        if (this.settings) {
            return Promise.resolve(this.settings)
        }

        const response = await fetch(`${this.options.authority}/_configuration/${this.options.client_id}`)
            .catch(reason => this.message.dispatch("Failed to get OIDC client settings. Is the server available?"))

        if (response && response.ok)
        {
            return await response.json()
        }
        return null;

    }

    private async getSigninState(): Promise<SigninState> {
        const state = await webStorage.get(this.signinResponse && this.signinResponse.state)
        if (!state) {
            return null;
        }
        return SigninState.fromStorageString(state)

    }

    private navigateToReturnUrl(returnUrl: string) {
        const path = returnUrl.replace(window.location.origin, "");
        this.redirectToPageEvent.dispatch(path)
    }

    private async addTokenValues(): Promise<void> {
        const token = await this.getTokenFromEndpoint()
        this.accessToken = token;
        await webStorage.set("id_token", token.id_token);
        await webStorage.set("refresh_token", token.refresh_token)
        this.signinResponse.id_token = token.id_token
        this.signinResponse.access_token = token.access_token
        this.signinResponse.expires_in = token.expires_in
    }

    private async getRefreshToken(): Promise<IdToken> {
        const refreshToken = await webStorage.get("refresh_token");
        if (!refreshToken) {
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
        }).catch(reason => console.error("Could not get access token", reason));

        if (response && response.ok) {
            return await response.json();
        }

        return null;
    }

    private async getToken(): Promise<IdToken> {

        if (!this.accessToken || this.accessToken.expired) {
            const token = await this.getRefreshToken();
            if (token) {
                this.accessToken = token;
            }
            else {
                this.accessToken = null;
            }
        }

        return this.accessToken;

    }

    private async getTokenFromEndpoint(): Promise<IdToken> {
        const state = await this.getSigninState()
        if (!state) {
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

    private message: IDispatchMessage<string>
    private redirectToPageEvent: IDispatchMessage<string>
    private userSubject: IDispatchMessage<IUser | null>

    private idServerUris: IIdServerUris

    private accessToken: IdToken;

    private settings: IOidcClientSettings;
    private options: IOidcClientSettings = {
        authority: window.location.origin,
        loadUserInfo: true
    }
    private signinResponse: SigninResponse

}

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
    LogoutCallback: string
    UserInfo: string
    EndSession: string
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
    set expires_in(value: any) {
        let expires_in = parseInt(value);
        if (typeof expires_in === 'number' && expires_in > 0) {
            let now = Math.round(Date.now() / 1000);
            this.expires_at = now + expires_in;
        }
    }

    get expired(): boolean {
        let expires_in = this.expires_in;
        if (expires_in !== undefined) {
            return expires_in <= 0;
        }
        return false;
    }

    get scopes() {
        return (this.scope || "").split(" ");
    }

}
