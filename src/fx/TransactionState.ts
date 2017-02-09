import {set, resolvePath} from "./helpers";

//
//  Holds the most updated application state and the original application state
//  A ServiceStore uses this class to update application state
//
export class TransactionState {
    private originalState: any;
    private currentState: any;

    constructor(appState: any) {
        this.originalState = this.currentState = appState;
    }

    get(path: string) {
        return resolvePath(this.currentState, path);
    }

    set(path: string, changes: any) {
        this.currentState = set(this.currentState, path, changes);
    }

    getCurrent() {
        return this.currentState;
    }

    getOriginal() {
        return this.originalState;
    }


    // getAppState() {
    //     return this.appState;
    // }
}
