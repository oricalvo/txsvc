import {NgModule}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent}  from './components/app.component';
import {ClockComponent} from "./components/clock.component";
import {ContactListComponent} from "./components/contactList.component";
import {ContactDetailsComponent} from "./components/contactDetails.component";
import {RootStore, AppState} from "./stores/root.store";
import {ContactsStore} from "./stores/contacts.store";
import {NewContactComponent} from "./components/newContact.component";
import {FormsModule} from "@angular/forms";
import {AuthStore} from "./stores/auth.store";
import {AppStore} from "txsvc/AppStore";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule
    ],
    declarations: [
        AppComponent,
        ClockComponent,
        ContactListComponent,
        ContactDetailsComponent,
        NewContactComponent,
    ],
    bootstrap: [AppComponent],
    providers: [
        RootStore,
        ContactsStore,
        AuthStore,
    ]
})
export class AppModule {
    constructor(rootStore: RootStore, contactsStore: ContactsStore, authStore: AuthStore) {
        const appStore: AppStore<AppState> = new AppStore<AppState>();

        appStore.init([
            rootStore.store,
            contactsStore.store,
            authStore.store,
        ]);
    }
}
