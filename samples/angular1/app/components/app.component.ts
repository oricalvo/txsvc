import {appModule} from "../app.module";
import {ContactsStore, Contact, ContactsState} from "../stores/contacts.store";

export class AppComponent {
    contacts: Contact[];

    constructor(private contactsStore: ContactsStore) {
    }

    $onInit() {
        this.contactsStore.store.subscribe((newState: ContactsState)=> {
            this.contacts = newState.all;
        });
    }

    onDeleteContact($event) {
        this.contactsStore.deleteById($event.contact.id);
    }
}

appModule.component("myApp", {
    controller: AppComponent,
    template: require("./app.component.html")
});
