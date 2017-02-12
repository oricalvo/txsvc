import {appModule} from "../app.module";
import {ContactsStore, Contact, ContactsState} from "../stores/contacts.store";

export class ContactListComponent {
    contacts: Contact[];
}

appModule.component("myContactList", {
    controller: ContactListComponent,
    template: require("./contactList.component.html"),
    bindings: {
        "contacts": "<",
    }
});
