import {ServiceStore} from "txsvc/ServiceStore";
import {ContactsStore, ContactsState} from "./contacts.store";
import {Injectable} from "@angular/core";
import {AuthStore, AuthState} from "./auth.store";

export interface AppState {
    contacts: ContactsState;
    auth: AuthState;
}

@Injectable()
export class RootStore {
    public store = ServiceStore.create("/", {
        contacts: null,
        auth: null,
    });

    constructor() {
    }
}
