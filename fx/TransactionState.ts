import {AppStore} from "./AppStore";
import {set, resolvePath} from "./helpers";

export class TransactionState {
    private appState: any;

    constructor(appState: any) {
        this.appState = appState;
    }

    set(path: string, changes: any) {
        this.appState = set(this.appState, path, changes);
    }

    getAppState() {
        return this.appState;
    }
}
