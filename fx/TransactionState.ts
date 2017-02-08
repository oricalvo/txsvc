import {AppStore} from "./AppStore";
import {set, resolvePath} from "./helpers";

export class TransactionState {
    private oldState: any;
    private newState: any;

    constructor(appState: any) {
        this.oldState = this.newState = appState;
    }

    get() {
        return this.newState;
    }

    getOld() {
        return this.oldState;
    }

    set(path: string, changes: any) {
        this.newState = set(this.newState, path, changes);
    }

    // getAppState() {
    //     return this.appState;
    // }
}
