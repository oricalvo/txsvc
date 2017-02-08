import {AppStore} from "./AppStore";
import {TransactionScope} from "./TransactionScope";
import {resolvePath} from "./helpers";
import {P1, P2} from "./helpers";

export interface ServiceStoreMetadata<StateT> {
    path: string,
    initialState: StateT;
}

interface StoreListener<StateT> {
    (newState: StateT, oldState: StateT): void;
}

export class ServiceStore<StateT> {
    private appStore: AppStore;
    private state: StateT;
    private listeners: StoreListener<StateT>[];
    private metadata: ServiceStoreMetadata<StateT>;

    constructor(appStore: AppStore, metadata: ServiceStoreMetadata<StateT>) {
        this.appStore = appStore;
        this.metadata = metadata;
        this.listeners = [];
        this.state = resolvePath(appStore.getState(), metadata.path);

        appStore.subscribe(appState => {
            const oldState = this.state;
            this.state = resolvePath(appState, this.metadata.path);
            if(oldState != this.state) {
                this.emit(this.state, oldState);
            }
        });
    }

    subscribe(listener: (newState: StateT, oldState: StateT)=>void) {
        this.listeners.push(listener);

        listener(this.state, this.state);
    }

    subscribe1<K1 extends keyof StateT>(key1: K1, listener: (newState: StateT[K1], oldState: StateT[K1])=>void) {
        this.listeners.push((s1, s2)=> {
            const c1 = P1(s1, key1);
            const c2 = P1(s2, key1);
            if(c1 != c2) {
                listener(c1, c2);
            }
        });
    }

    subscribe2<K1 extends keyof StateT, K2 extends keyof StateT[K1]>(key1: K1, key2: K2, listener: (newState: StateT[K1][K2], oldState: StateT[K1][K2])=>void) {
        this.listeners.push((s1, s2)=> {
            const c1 = P2(s1, key1, key2);
            const c2 = P2(s2, key1, key2);
            if(c1 != c2) {
                listener(c1, c2);
            }
        });
    }

    getAppStore(): AppStore {
        return this.appStore;
    }

    getMetadata(): ServiceStoreMetadata<StateT> {
        return this.metadata;
    }

    getState(): StateT {
        const tranScope = TransactionScope.current();
        if(tranScope) {
            return <StateT>resolvePath(tranScope.getState().get(), this.metadata.path);
        }
        else {
            return this.state;
        }
    }

    // commit(changes: Partial<StateT>): StateT {
    //     const tranScope = TransactionScope.current<StateT>();
    //     if(!tranScope) {
    //         throw new Error("No current TransactionScope");
    //     }
    //
    //     tranScope.setState(changes);
    //
    //     return tranScope.getState();
    // }

    private emit(newState, oldState) {
        for(let l of this.listeners) {
            l(newState, oldState);
        }
    }
}
