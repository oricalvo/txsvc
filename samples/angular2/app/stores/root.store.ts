import {ServiceStore} from "txsvc/ServiceStore";
import {appStore} from "./appStore";
import {ContactsStore, ContactsState} from "./contacts.store";
import {Injectable} from "@angular/core";
import {AuthStore, AuthState} from "./auth.store";

export interface AppState {
    contacts: ContactsState;
    auth: AuthState;
}

@Injectable()
export class RootStore {
    public store: ServiceStore<AppState> = new ServiceStore<AppState>(appStore, {
        initialState: {
            contacts: null,
            auth: null,
        },
        path: "/"
    });

    constructor(contactsStore: ContactsStore, authStore: AuthStore) {
        appStore.init([
            contactsStore.store,
            authStore.store,
        ]);
    }
}
