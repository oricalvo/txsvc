import {ServiceStore} from "txsvc/ServiceStore";
import {AppStore} from "txsvc/AppStore";
import {ContactsStore, ContactsState} from "../stores/contacts.store";
import {Injectable} from "@angular/core";
import {AuthStore, AuthState} from "../stores/auth.store";
import {Transaction, transaction} from "txsvc/decorators";

export interface AppState {
    contacts: ContactsState;
    auth: AuthState;
}

@Injectable()
export class AppActivities {
    constructor(private appStore: AppStore<AppState>, private authStore: AuthStore, private contactsStore: ContactsStore) {
    }

    //@Transaction()
    logout() {
        transaction(this.appStore, ()=> {
            this.authStore.logout();
            this.contactsStore.clear();
        });
    }
}
