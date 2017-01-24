import {ServiceStore} from "../../fx/ServiceStore";
import {Injectable} from "@angular/core";
import {Action} from "../../fx/Action";
import {appStore} from "./appStore";

export interface LocaleState {
    readonly localeId: string;
}

@Injectable()
export class LocaleService {
    private store = new ServiceStore<LocaleState>(appStore, {
        path: "locale",
        initialState: {
            localeId: "en",
        }
    });

    constructor() {
    }

    @Action()
    change(localeId: string): Promise<LocaleState> {
        return this.store.commit({
            localeId
        });
    }

    get initialState() {
        return this.store.initialState;
    }

    subscribe(listener: (state: LocaleState)=>void) {
        this.store.subscribe(listener);
    }
}
