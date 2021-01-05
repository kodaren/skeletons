import { writable, Writable } from "svelte/store";
import type { IDispatchMessage } from "../oidc/oidc-code-flow-client";

export class DispatchMessage<T> implements IDispatchMessage<T>  {
    public store = writable<T>(undefined)
    public dispatch(message: T): any {
        this.store.set(message)
        return this.store
    }

}
