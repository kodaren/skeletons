import { State } from "./state"
import { pkceUtil} from './helpers/pkce-util'

export class SigninState extends State {
    private _nonce: any
    private _code_verifier: any
    private _authority: string
    private _redirect_uri: string
    private _client_id: string
    private _response_mode: string
    private _scope: string
    private _extraTokenParams: any
    private _skipUserInfo: boolean
    private _code_challenge: string
    private _return_uri: string

    constructor(state: {nonce?: any, authority: string, client_id: string, redirect_uri: string, 
        return_uri: string,
        code_verifier?: any, response_mode: string, scope: string, 
        extraTokenParams?: any, skipUserInfo?: boolean}) {
        super(arguments[0])

        if (state.nonce === true) {
            this._nonce = pkceUtil.getNonce()
        }
        else if (state.nonce) {
            this._nonce = state.nonce
        }

        if (state.code_verifier === true) {
            // random() produces 32 length
            this._code_verifier = pkceUtil.generateCodeVerifier()
        }
        else if (state.code_verifier) {
            this._code_verifier = state.code_verifier
        }
        
        this._redirect_uri = state.redirect_uri
        this._return_uri = state.return_uri
        this._authority = state.authority
        this._client_id = state.client_id
        this._response_mode = state.response_mode
        this._scope = state.scope
        this._extraTokenParams = state.extraTokenParams
        this._skipUserInfo = state.skipUserInfo

    }

    get nonce() {
        return this._nonce
    }
    get authority() {
        return this._authority
    }
    get client_id() {
        return this._client_id
    }
    get redirect_uri() {
        return this._redirect_uri
    }
    get return_uri() {
        return this._return_uri
    }
    get code_verifier() {
        return this._code_verifier
    }
    public async getCodeChallenge(): Promise<string> {
        if (this.code_verifier) {
            this._code_challenge = await pkceUtil.generateCodeChallengeFromVerifier(this.code_verifier)
        }
        return this._code_challenge
    }

    get response_mode() {
        return this._response_mode
    }
    get scope() {
        return this._scope
    }
    get extraTokenParams() {
        return this._extraTokenParams
    }
    get skipUserInfo() {
        return this._skipUserInfo
    }
    
    toStorageString() {
        return JSON.stringify({
            id: this.id,
            data: this.data,
            created: this.created,
            request_type: this.request_type,
            nonce: this.nonce,
            code_verifier: this.code_verifier,
            redirect_uri: this.redirect_uri,
            return_uri: this.return_uri,
            authority: this.authority,
            client_id: this.client_id,
            response_mode: this.response_mode,
            scope: this.scope,
            extraTokenParams : this.extraTokenParams,
            skipUserInfo: this.skipUserInfo
        })
    }

    static fromStorageString(storageString: string) {
        if (!storageString) {
            return null
        }
        const data = JSON.parse(storageString)
        return new SigninState(data)
    }
}
