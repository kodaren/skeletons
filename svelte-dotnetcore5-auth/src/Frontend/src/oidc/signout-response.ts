import { UrlUtility } from "./helpers/url-utility";


export class SignoutResponse {
    error: string;
    error_description: string;
    error_uri: string;
    state: any;

    constructor(url?: string, delimiter = "?") {

        const values: any = UrlUtility.parseUrlFragment(url, delimiter);
        this.error = values.error;
        this.error_description = values.error_description;
        this.error_uri = values.error_uri;

        this.state = values.state;
    }
}
