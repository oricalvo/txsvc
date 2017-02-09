import {AppStore} from "./AppStore";
import {resolvePath, set, promisify} from "./helpers";
import {TransactionState} from "./TransactionState";
import {ServiceStore, ServiceStoreMetadata} from "./ServiceStore";
import "zone.js";

export class TransactionScope {
    private appStore: AppStore;
    private oldState: any;
    private newState: any;

    constructor(appStore: AppStore) {
        this.appStore = appStore;
        this.oldState = this.newState = appStore.getState();
    }

    public update(path: string, changes: any) {
        this.newState = set(this.newState, path, changes);
    }

    public getNewState() {
        return this.newState;
    }

    public getOldState() {
        return this.oldState;
    }

    private commit() {
        this.appStore.commit(this.oldState, this.newState);
    }

    static current(): TransactionScope {
        let tran: TransactionScope = Zone.current.get("tran");
        return tran;
    }

    static require<StateT>(store: ServiceStore<StateT>, action) {
        function runAction(func, commit) {
            return promisify(func()).then(changes => {
                tran.update(store.getMetadata().path, changes);

                if(commit) {
                    tran.commit();
                }

                return changes;
            });
        }

        let tran: TransactionScope = TransactionScope.current();
        if(tran) {
            //
            //  This is nested transaction
            //  Commit changes to transaction state only (not app state)
            //
            return runAction(action, false);
        }

        //
        //  This is a root transaction
        //  When completed need to commit to the appStore
        //
        tran = new TransactionScope(store.getAppStore());

        const spec: ZoneSpec = {
            name: "tran",
            properties: {
                "tran": tran,
            },
        };

        const zone = Zone.current.fork(spec);
        return zone.run(function () {
            return runAction(action, true);
        });
    }
}
