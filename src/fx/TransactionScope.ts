import {AppStore} from "./AppStore";
import {ServiceStore} from "./ServiceStore";
import "zone.js";
import {TransactionalObject} from "./TransactionalObject";
import {promisify} from "./helpers";

export class TransactionScope {
    private appStore: AppStore<any>;
    private tranState: TransactionalObject<any>;
    private committed: boolean;

    constructor(appStore: AppStore<any>) {
        this.appStore = appStore;
        this.tranState = new TransactionalObject(appStore.getState());
        this.committed = false;
    }

    public update(path: string, changes: any) {
        this.tranState.setProperty(path, changes);
    }

    public getNewState() {
        return this.tranState.getNewState();
    }

    public getOldState() {
        return this.tranState.getState();
    }

    public commit() {
        if(this.committed) {
            throw new Error("Transaction was already committed");
        }

        const oldState = this.tranState.getState();
        this.tranState.commit();
        const newState = this.tranState.getState();

        this.appStore.commit(oldState, newState);
        this.committed = true;
    }

    static current(): TransactionScope {
        let tran: TransactionScope = Zone.current.get("tran");
        return tran;
    }

    static runInsideTransaction<StateT>(store: ServiceStore<StateT>, action) {
        function runAction(func, commit) {
            return promisify(func()).then(retVal => {
                if(commit) {
                    tran.commit();
                }

                return retVal;
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
