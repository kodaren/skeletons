import { writable, Writable } from "svelte/store";
import type { IDispatchMessage } from "../oidc/oidc-code-flow-client";

export interface IDispatchStore<T> extends IDispatchMessage<T> {
    store: Writable<T>
}

export class DispatchMessage<T> implements IDispatchStore<T>  {
    public store = writable<T>(undefined)

    constructor(message?: T)
    {
        if (message)
        {
            this.dispatch(message)
        }
    }

    public dispatch(message: T): any {
        this.store.set(message)
        return this.store
    }

    public converter(): any {
        return this.store
    }


}

