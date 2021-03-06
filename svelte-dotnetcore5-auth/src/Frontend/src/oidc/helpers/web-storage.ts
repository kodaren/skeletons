export class WebStorage {
    private _store: Storage
    private _prefix: string
    constructor({ prefix = "oidc-auth.", store = localStorage } = {}) {
        this._store = store;
        this._prefix = prefix;
    }

    set(key: string, value: string): Promise<void> {
        this._store.setItem(this._prefix + key, value);
        return Promise.resolve();
    }

    get(key: string): Promise<any> {
        let item = this._store.getItem(this._prefix + key);
        return Promise.resolve(item);
    }

    remove(key: string): Promise<any> {
        let item = this._store.getItem(this._prefix + key);
        this._store.removeItem(key);
        return Promise.resolve(item);
    }

    getAllKeys(): Promise<any> {

        var keys = this._getAllKeys()
        return Promise.resolve(keys);
    }

    private _getAllKeys(): any {

        var keys = [];

        for (let index = 0; index < this._store.length; index++) {
            let key = this._store.key(index);

            if (key.indexOf(this._prefix) === 0) {
                keys.push(key.substr(this._prefix.length));
            }
        }
        return keys
    }


    clear(): Promise<void> {
        const keys = this._getAllKeys()
        console.debug(keys)
        for(const key of keys) {
            this._store.removeItem(this._prefix + key)
        }
        return Promise.resolve()
    }

}

export const webStorage = new WebStorage()
