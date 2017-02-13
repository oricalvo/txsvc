import {ServiceStore} from "txsvc/ServiceStore";
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
    public store = ServiceStore.create<AuthState>("auth", {
        user: null,
        lastLoginDate: null
    });

    constructor() {
    }

    @Transaction()
    login(name, password) {
        this.store.update({
            user: {
                id:1,
                name: "Ori",
            }
        });
    }

    @Transaction()
    logout(name, password) {
        this.store.update({
            user: null,
        });
    }
}
