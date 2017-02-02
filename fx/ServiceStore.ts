import {AppStore} from "./AppStore";
import {TransactionScope} from "./TransactionScope";
import {resolvePath} from "./helpers";

export interface ServiceStoreMetadata<StateT> {
    path: string,
    initialState: StateT;
}

export class ServiceStore<StateT> {
    private appStore: AppStore;
    private state: StateT;
    private listeners: any[];
    private metadata: ServiceStoreMetadata<StateT>;

    constructor(appStore: AppStore, metadata: ServiceStoreMetadata<StateT>) {
        appStore.registerStore(this, metadata);

        this.appStore = appStore;
        this.metadata = metadata;
        this.listeners = [];
        this.state = resolvePath(appStore.getState(), metadata.path);

        appStore.subscribe(appState => {
            const oldState = this.state;
            this.state = resolvePath(appState, this.metadata.path);
            if(oldState != this.state) {
                this.emit();
            }
        });
    }

    subscribe(listener: (state: StateT)=>void) {
        this.listeners.push(listener);

        listener(this.state);
    }

    getAppStore(): AppStore {
        return this.appStore;
    }

    getMetadata(): ServiceStoreMetadata<StateT> {
        return this.metadata;
    }

    getState(): StateT {
        const tranScope = TransactionScope.current();
        return <StateT>tranScope.getState();
    }

    private emit() {
        for(let l of this.listeners) {
            l(this.state);
        }
    }
}
