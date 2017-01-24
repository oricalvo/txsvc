import {replace, setNoClone} from "./helpers";
import {ServiceStore, ServiceStoreMetadata} from "./ServiceStore";

export class AppStore {
    private _listeners: any[];
    private _state: any;
    private _services: ServiceStore<any>[];

    constructor() {
        this._state = {};
        this._listeners = [];
        this._services = [];
    }

    get state() {
        return this._state;
    }

    subscribe(listener: (state)=>void) {
        this._listeners.push(listener);
    }

    commit(path, oldValue, value) {
        const newState = replace(this._state, path, oldValue, value);
        if(newState == this._state) {
            return;
        }

        this._state = newState;

        for(let l of this._listeners) {
            l(this._state);
        }

        return this._state;
    }

    registerServiceStore<StateT>(service: ServiceStore<StateT>, metadata: ServiceStoreMetadata<StateT>) {
        const conflict: ServiceStore<any> = this.findConflict(metadata.path);
        if(conflict) {
            throw new Error("Service with path: " + metadata.path + " conflicts with existing service with path: " + conflict.path);
        }

        this._services.push(service);

        setNoClone(this._state, metadata.path, metadata.initialState);
    }

    findConflict(path: string): ServiceStore<any> {
        for(let service of this._services) {
            if(path.indexOf(service.path)==0) {
                return service;
            }
        }

        return null;
    }
}
