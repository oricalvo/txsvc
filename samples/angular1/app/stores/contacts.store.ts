import {ServiceStore} from "txsvc/ServiceStore";
import {appModule} from "../app.module";

export interface Contact {
    id: number;
    name: string;
}

export interface ContactsState {
    all: Contact[];
}

export class ContactsStore {
    public store = ServiceStore.create<ContactsState>("contacts", {
        all: [
            {id:1, name: "Ori"},
            {id:2, name: "Roni"},
        ]
    });
}

appModule.service("contactsStore", ContactsStore);
