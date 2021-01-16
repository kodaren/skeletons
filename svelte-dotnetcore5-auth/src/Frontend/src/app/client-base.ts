import { codeFlowClient } from "../oidc/oidc-code-flow-client"

export class ClientBase {
    /**
     * request should use bearer authentication
     */
    public authenticateRequest: boolean

    constructor() {
        this.authenticateRequest = true
    }

    protected transformOptions(options: any) {

        if (this.authenticateRequest) {
            return codeFlowClient.getAccessToken()
                .then(token => {
                    options.headers["Authorization"] = "bearer " + token
                    return new Promise(resolve => resolve(options))
                })
                .catch(err => console.error("Could not get accesstoken: " + err))
        }
        return Promise.resolve(options);

    }
}
