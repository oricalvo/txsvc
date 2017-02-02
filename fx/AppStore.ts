import {replace, setNoClone} from "./helpers";
import {ServiceStore, ServiceStoreMetadata} from "./ServiceStore";

export class AppStore {
    private listeners: any[];
    private state: any;
    private stores: ServiceStore<any>[];

    constructor() {
        this.state = {};
        this.listeners = [];
        this.stores = [];
    }

    getState() {
        return this.state;
    }

    subscribe(listener: (state)=>void) {
        this.listeners.push(listener);
    }

    unsubscribe(listener: (state)=>void) {
        const index = this.listeners.findIndex(l => l == listener);
        if(index != -1) {
            this.listeners.splice(index, 1);
        }
    }

    commit(path, oldValue, value) {
        const newState = replace(this.state, path, oldValue, value);
        if(newState == this.state) {
            return;
        }

        this.state = newState;

        for(let l of this.listeners) {
            l(this.state);
        }

        return this.state;
    }

    registerStore<StateT>(service: ServiceStore<StateT>, metadata: ServiceStoreMetadata<StateT>) {
        const conflict: ServiceStore<any> = this.findConflictingPath(metadata.path);
        if(conflict) {
            throw new Error("Service with path: " + metadata.path + " conflicts with existing service with path: " + conflict.getMetadata().path);
        }

        this.stores.push(service);

        setNoClone(this.state, metadata.path, metadata.initialState);
    }

    private findConflictingPath(path: string): ServiceStore<any> {
        for(let store of this.stores) {
            if(path.indexOf(store.getMetadata().path)==0) {
                return store;
            }
        }

        return null;
    }
}
