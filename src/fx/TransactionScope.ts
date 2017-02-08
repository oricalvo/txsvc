import {AppStore} from "./AppStore";
import {resolvePath} from "./helpers";
import {TransactionState} from "./TransactionState";
import {ServiceStore, ServiceStoreMetadata} from "./ServiceStore";
import "zone.js";

export class TransactionScope<StateT> {
    private appStore: AppStore;
    private state: TransactionState;
    private parent: TransactionScope<StateT>

    constructor(appStore: AppStore,
                parent: TransactionScope<StateT>) {
        this.appStore = appStore;
        var appState = appStore.getState();
        this.state = (parent ? parent.state : new TransactionState(appState));
        this.parent = parent;
    }

    getState(): TransactionState {
        return this.state;
    }

    // getState(): StateT {
    //     const state = resolvePath(this.state.getAppState(), this.metadata.path);
    //     return state;
    // }
    //
    // setState(path: string, changes: Partial<StateT>): void {
    //     this.state.set(path, changes);
    // }

    commit() {
        const tranState = this.getState();
        return this.appStore.commit(tranState.getOld(), tranState.get());
    }

    static current<StateT>(): TransactionScope<StateT> {
        let tran: TransactionScope<StateT> = Zone.current.get("tran");
        return tran;
    }

    static require<StateT>(store: ServiceStore<StateT>, func) {
        const parent: TransactionScope<StateT> = <any>TransactionScope.current();
        const tran: TransactionScope<StateT> = new TransactionScope(store.getAppStore(), parent);

        const spec: ZoneSpec = {
            name: "tran",
            properties: {
                "tran": tran,
            },
        };

        const zone = Zone.current.fork(spec);

        return zone.run(function() {
            const retVal = func();
            if(!retVal.then) {
                throw new Error("A method decorated with @Transaction must return a promise object");
            }

            return retVal.then(changes => {
                tran.getState().set(store.getMetadata().path, changes);

                if(!parent) {
                    tran.commit();
                }

                return changes;
            });
        });
    }
}
