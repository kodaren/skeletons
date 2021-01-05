import { pkceUtil } from "./helpers/pkce-util";

export class State {
    private _id: string
    private _data: string
    private _created: number
    private _request_type: string

    constructor(state: {id?: string, data?: string, created?: number, request_type?: string}) {

        this._id = state.id || pkceUtil.getRandom();
        this._data = state.data;

        if (typeof state.created === 'number' && state.created > 0) {
            this._created = state.created;
        }
        else {
            this._created = Math.round(Date.now() / 1000);
        }
        this._request_type =  state.request_type;
    }

    get id() {
        return this._id;
    }
    get data() {
        return this._data;
    }
    get created() {
        return this._created;
    }
    get request_type() {
        return this._request_type;
    }

    toStorageString() {
        return JSON.stringify({
            id: this.id,
            data: this.data,
            created: this.created,
            request_type: this.request_type
        });
    }

    static fromStorageString(storageString: string) {
        return new State(JSON.parse(storageString));
    }

}
