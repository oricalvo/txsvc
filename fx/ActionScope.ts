import {AppStore} from "./AppStore";
import {set, resolvePath} from "./helpers";

export class ActionState {
    private _state: any;

    constructor(state: any) {
        this._state = state;
    }

    set(path: string, changes: any) {
        this._state = set(this._state, path, changes);
    }

    get state() {
        return this._state;
    }
}

export class ActionScope<StateT> {
    private _store: AppStore;
    private _path: string;
    private _oldState: StateT;
    private _state: ActionState;
    private _committed: boolean;
    private _parent: ActionScope<StateT>

    constructor(store: AppStore,
                path: string,
                parent: ActionScope<StateT>) {
        this._store = store;
        this._path = path;
        this._oldState = resolvePath(store.state, path);
        this._state = (parent ? parent._state : new ActionState(store.state));
        this._committed = false;
        this._parent = parent;
    }

    get state(): StateT {
        return this._state.state;
    }

    commit(changes) {
        if(this._committed) {
            throw new Error("Transaction was already committed");
        }

        this._committed = true;

        this._state.set(this._path, changes);
        const newState = resolvePath(this._state.state, this._path);

        if(!this._parent) {
            this._store.commit(this._path, this._oldState, newState);
        }

        return newState;
    }

    static current<StateT>(): ActionScope<StateT> {
        let tran: ActionScope<StateT> = Zone.current.get("tran");
        return tran;
    }

    static require<StateT>(appStore: AppStore, path: string, func) {
        const parent: ActionScope<StateT> = <any>ActionScope.current();
        const tran: ActionScope<StateT> = new ActionScope(appStore, path, parent);

        const spec: ZoneSpec = {
            name: "tran",
            properties: {
                "tran": tran,
            },
        };

        const zone = Zone.current.fork(spec);

        return zone.run(function() {
            return func();
        });
    }
}
