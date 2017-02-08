import {replace, setNoClone, ROOT, clean} from "./helpers";
import {ServiceStore, ServiceStoreMetadata} from "./ServiceStore";
import {createLogger} from "./logger";

const logger = createLogger("AppStore");

export class AppStore {
    private listeners: any[];
    private state: any;
    private stores: ServiceStore<any>[];

    constructor() {
        this.state = {};
        this.listeners = [];
        this.stores = [];
    }

    init(stores: ServiceStore<any>[]) {
        for(let store of stores) {
            this.registerStore(store);
        }

        logger.log("Initial appStore");
        logger.log(this.state);
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

    commit(oldState, newState) {
        if(newState == this.state) {
            return;
        }

        if(oldState != this.state) {
            throw new Error("Concurrency error");
        }

        clean(newState);
        this.state = newState;

        logger.log("State changed", oldState, " ==> ", newState);

        for(let l of this.listeners) {
            l(this.state);
        }

        return this.state;
    }

    registerStore<StateT>(store: ServiceStore<StateT>) {
        const metadata = store.getMetadata();
        const conflict: ServiceStore<any> = this.findConflictingPath(metadata.path);
        if(conflict) {
            throw new Error("Service with path: " + metadata.path + " conflicts with existing service with path: " + conflict.getMetadata().path);
        }

        this.stores.push(store);

        if(store.getMetadata().path == ROOT) {
            return;
        }

        setNoClone(this.state, metadata.path, metadata.initialState);
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
