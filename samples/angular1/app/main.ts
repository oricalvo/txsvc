import * as angular from "angular";
import {AppComponent} from "./components/app.component";
import {appModule} from "./app.module";
import {RootStore, AppState} from "./stores/root.store";
import {ContactsStore} from "./stores/contacts.store";
import {AppStore} from "txsvc/AppStore";
import {ContactListComponent} from "./components/contactList.component";

const components = [
    AppComponent,
    ContactListComponent
];

const stores = [
    RootStore,
    ContactsStore
];

appModule.run((rootStore: RootStore, contactsStore: ContactsStore) => {
    const appStore = new AppStore<AppState>();

    appStore.init([
        rootStore.store,
        contactsStore.store,
    ]);
});

angular.bootstrap(document.getElementById("html"), [appModule.name]);
