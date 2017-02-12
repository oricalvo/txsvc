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
    public store: ServiceStore<ContactsState> = new ServiceStore<ContactsState>({
        path: "contacts",
        initialState: {
            all: [
            ]
        }
    });
}

appModule.service("contactsStore", ContactsStore);
