import {AppStore} from "./AppStore";
import {ActionScope} from "./ActionScope";
import {resolvePath} from "./helpers";

export interface ServiceStoreMetadata<StateT> {
    path: string,
    initialState: StateT;
}

export class ServiceStore<StateT> {
    private _appStore: AppStore;
    private _state: StateT;
    private _listeners: any[];
    private _metadata: ServiceStoreMetadata<StateT>;

    constructor(appStore: AppStore, metadata: ServiceStoreMetadata<StateT>) {
        appStore.registerServiceStore(this, metadata);

        this._appStore = appStore;
        this._metadata = metadata;
        this._listeners = [];
        this._state = resolvePath(appStore.state, metadata.path);

        appStore.subscribe(appState => {
            const oldState = this._state;
            this._state = resolvePath(appState, this.path);
            if(oldState != this._state) {
                this.emit();
            }
        });
    }

    subscribe(listener: (state: StateT)=>void) {
        this._listeners.push(listener);

        listener(this._state);
    }

    commit(changes: any): Promise<StateT> {
        return Promise.resolve(<StateT>ActionScope.current().commit(changes));
    }

    get appStore(): AppStore {
        return this._appStore;
    }

    get state(): StateT {
        const tranScope = ActionScope.current();
        return <StateT>tranScope.state;
    }

    get path(): string {
        return this._metadata.path;
    }

    get initialState(): StateT {
        return this._metadata.initialState;
    }

    private emit() {
        for(let l of this._listeners) {
            l(this._state);
        }
    }
}
