import {replace, setNoClone, ROOT, clean} from "./helpers";
import {ServiceStore, ServiceStoreMetadata} from "./ServiceStore";
import {createLogger} from "./logger";

const logger = createLogger("AppStore");

export interface StoreListener<StateT> {
    (newState: StateT, oldState: StateT): void;
}

//
//  Holds application state and allow subscribing to changes
//  Each ServiceStore register itself to it
//  Commit request is delegated from the ServiceStore to this appStore
//
export class AppStore {
    private listeners: StoreListener<any>[];
    private appState: any;
    private stores: ServiceStore<any>[];

    constructor() {
        this.appState = {};
        this.listeners = [];
        this.stores = [];
    }

    init(stores: ServiceStore<any>[]) {
        for(let store of stores) {
            this.registerStore(store);
        }

        logger.log("Initial appStore", this.appState);
    }

    getState() {
        return this.appState;
    }

    subscribe(listener: (newState, oldState)=>void) {
        this.listeners.push(listener);
    }

    unsubscribe(listener: (newState, oldState)=>void) {
        const index = this.listeners.findIndex(l => l == listener);
        if(index != -1) {
            this.listeners.splice(index, 1);
        }
    }

    commit(oldState, newState) {
        if(newState == this.appState) {
            return;
        }

        if(oldState != this.appState) {
            throw new Error("Concurrency error");
        }

        logger.log("Changing state", oldState, " ==> ", newState);

        clean(newState);
        this.appState = newState;

        this.emit(oldState, newState);

        return this.appState;
    }

    private emit(oldState, newState) {
        for(let l of this.listeners) {
            try {
                l(this.appState, oldState);
            }
            catch(err) {
                logger.error("Ignoring error during AppStore change event", err);
            }
        }
    }

    private registerStore<StateT>(store: ServiceStore<StateT>) {
        const metadata = store.getMetadata();
        const conflict: ServiceStore<any> = this.findConflictingPath(metadata.path);
        if(conflict) {
            throw new Error("Service with path: " + metadata.path + " conflicts with existing service with path: " + conflict.getMetadata().path);
        }

        this.stores.push(store);

        if(store.getMetadata().path == ROOT) {
            return;
        }

        setNoClone(this.appState, metadata.path, metadata.initialState);
    }

    private findConflictingPath(path: string): ServiceStore<any> {
        if(path == ROOT) {
            return this.stores.find(s=>s.getMetadata().path == ROOT);
        }

        for(let store of this.stores) {
            if(path.indexOf(store.getMetadata().path)==0) {
                return store;
            }
        }

        return null;
    }
}
