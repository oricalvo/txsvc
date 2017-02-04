import {AppStore} from "./AppStore";
import {resolvePath} from "./helpers";
import {TransactionState} from "./TransactionState";
import {ServiceStore, ServiceStoreMetadata} from "./ServiceStore";
import "zone.js/dist/zone.js";

export class TransactionScope<StateT> {
    private store: ServiceStore<StateT>;
    private metadata: ServiceStoreMetadata<StateT>
    private oldState: StateT;
    private state: TransactionState;
    private parent: TransactionScope<StateT>

    constructor(store: ServiceStore<StateT>,
                path: string,
                parent: TransactionScope<StateT>) {
        var appState = store.getAppStore().getState();

        this.metadata = store.getMetadata();
        this.store = store;
        this.oldState = resolvePath(appState, this.metadata.path);
        this.state = (parent ? parent.state : new TransactionState(appState));
        this.parent = parent;
    }

    getState(): StateT {
        const state = resolvePath(this.state.getAppState(), this.metadata.path);
        return state;
    }

    setState(changes: StateT) {
        this.state.set(this.metadata.path, changes);
    }

    commit() {
        const newState = this.getState();
        this.store.getAppStore().commit(this.metadata.path, this.oldState, newState);

        return newState;
    }

    static current<StateT>(): TransactionScope<StateT> {
        let tran: TransactionScope<StateT> = Zone.current.get("tran");
        return tran;
    }

    static require<StateT>(store: ServiceStore<StateT>, func) {
        const parent: TransactionScope<StateT> = <any>TransactionScope.current();
        const tran: TransactionScope<StateT> = new TransactionScope(store, store.getMetadata().path, parent);

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
                tran.setState(changes);

                if(!parent) {
                    tran.commit();
                }

                return changes;
            });
        });
    }
}
