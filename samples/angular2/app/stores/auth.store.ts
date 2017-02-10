import {ServiceStore} from "txsvc/ServiceStore";
import {appStore} from "./appStore";
import {ContactsStore, ContactsState} from "./contacts.store";
import {Injectable} from "@angular/core";
import {Transaction} from "txsvc/decorators";

export interface UserDetails {
    id: number;
    name: string;
}

export interface AuthState {
    user: UserDetails;
    lastLoginDate: Date;
}

@Injectable()
export class AuthStore {
    public store: ServiceStore<AuthState> = new ServiceStore<AuthState>(appStore, {
        initialState: {
            user: null,
            lastLoginDate: null,
        },
        path: "auth"
    });

    constructor() {
    }

    @Transaction()
    login(name, password) {
        return {
            user: {
                id:1,
                name: "Ori",
            }
        };
    }

    logout(name, password) {
        return {
            user: null,
        };
    }
}
