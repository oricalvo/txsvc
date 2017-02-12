import {ServiceStore} from "txsvc/ServiceStore";
import {ContactsStore} from "./contacts.store";
import {AppStore} from "txsvc/AppStore";
import {appModule} from "../app.module";

export interface AppState {
}

export class RootStore {
    public store: ServiceStore<AppState> = new ServiceStore<AppState>({
        path: "/",
        initialState: {}
    });

    constructor(contactsStore: ContactsStore) {
        const appStore = new AppStore<AppState>();

        appStore.init([
            contactsStore.store,
        ]);
    }
}

appModule.service("rootStore", RootStore);
