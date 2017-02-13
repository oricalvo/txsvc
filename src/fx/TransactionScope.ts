import {AppStore} from "./AppStore";
import {ServiceStore} from "./ServiceStore";
import "zone.js";
import {TransactionalObject} from "./TransactionalObject";
import {promisify} from "./helpers";

export class TransactionScope {
    private appStore: AppStore<any>;
    private tranState: TransactionalObject<any>;
    private committed: boolean;
    private outerZone: Zone;

    private static nextTranId = 1;

    constructor(appStore: AppStore<any>, outerZone: Zone) {
        this.appStore = appStore;
        this.tranState = new TransactionalObject(appStore.getState());
        this.committed = false;
        this.outerZone = outerZone;
    }

    public update(path: string, changes: any) {
        this.ensureNotCommitted();

        this.tranState.setProperty(path, changes);
    }

    public getNewState() {
        return this.tranState.getNewState();
    }

    public getOldState() {
        return this.tranState.getState();
    }

    public commit() {
        this.ensureNotCommitted();

        const oldState = this.tranState.getState();
        this.tranState.commit();
        const newState = this.tranState.getState();

        this.committed = true;

        this.outerZone.run(()=> {
            //
            //  Committing to appStore causes emitting of change event
            //  Subscribers must be notified outside of the transaction zone, else, any
            //  additional update will be considered as part of the already committed transaction
            //  and therefore will throw error
            //
            this.appStore.commit(oldState, newState);
        });
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
            tran.ensureNotCommitted();

            //
            //  This is a nested transaction
            //  No need to commit changes to app state
            //
            return runAction(action, false);
        }

        //
        //  This is a root transaction
        //  When completed need to commit to the appStore
        //
        tran = new TransactionScope(store.getAppStore(), Zone.current);

        const spec: ZoneSpec = {
            name: "tran",
            properties: {
                "tran": tran,
                id: TransactionScope.nextTranId++,
            },
        };

        const zone = Zone.current.fork(spec);
        return zone.run(function () {
            var tran1 = TransactionScope.current();
            return runAction(action, true).then(()=> {
                var tran2 = TransactionScope.current();
            });
        });
    }

    private ensureNotCommitted() {
        if(this.committed) {
            throw new Error("Transaction was already committed");
        }
    }
}
