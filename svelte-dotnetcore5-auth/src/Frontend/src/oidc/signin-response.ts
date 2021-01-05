// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.

import { UrlUtility } from './helpers/url-utility';

const OidcScope = "openid";

export class SigninResponse {
    error: any;
    error_description: any;
    error_uri: any;
    code: any;
    state: any;
    id_token: any;
    session_state: any;
    access_token: any;
    token_type: any;
    scope: any;
    profile: any;
    expires_at: any;
    constructor(url?: string, delimiter = "?") {

        const values: any = UrlUtility.parseUrlFragment(url, delimiter);

        this.error = values.error;
        this.error_description = values.error_description;
        this.error_uri = values.error_uri;

        this.code = values.code;
        this.state = values.state;
        this.id_token = values.id_token;
        this.session_state = values.session_state;
        this.access_token = values.access_token;
        this.token_type = values.token_type;
        this.scope = values.scope;
        this.profile = undefined; // will be set from ResponseValidator

        this.expires_in = values.expires_in;
    }

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

    get isOpenIdConnect() {
        return this.scopes.indexOf(OidcScope) >= 0 || !!this.id_token;
    }
}
