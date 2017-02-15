import {NgModule}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent}  from './components/app.component';
import {ClockComponent} from "./components/clock.component";
import {ContactListComponent} from "./components/contactList.component";
import {ContactDetailsComponent} from "./components/contactDetails.component";
import {AppActivities} from "./services/appActivities.service";
import {ContactsStore} from "./stores/contacts.store";
import {NewContactComponent} from "./components/newContact.component";
import {FormsModule} from "@angular/forms";
import {AuthStore} from "./stores/auth.store";
import {fromStores} from "txsvc-ng2/fromStores";
import {AppStore} from "txsvc/AppStore";

const appStore = new AppStore<any>();

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
        AppActivities,
        {provide: AppStore, useValue: appStore},
        fromStores(appStore, [
            ContactsStore,
            AuthStore,
        ])
    ]
})
export class AppModule {
}
