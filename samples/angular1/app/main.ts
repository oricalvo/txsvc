import * as angular from "angular";
import {AppComponent} from "./components/app.component";
import {appModule} from "./app.module";
import {RootStore} from "./stores/root.store";
import {ContactsStore} from "./stores/contacts.store";

const components = [
    AppComponent
];

const stores = [
    RootStore,
    ContactsStore
];

appModule.run(() => {
    //
    //  Enforce RootStore instantiation
    //
});

angular.bootstrap(document.getElementById("html"), [appModule.name]);
