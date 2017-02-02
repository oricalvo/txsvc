import {ServiceStore} from "../../fx/ServiceStore";
import {Injectable} from "@angular/core";
import {Transaction} from "../../fx/decorators";
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

    @Transaction()
    change(localeId: string): Promise<LocaleState> {
        return Promise.resolve({
            localeId
        });
    }

    get initialState() {
        return this.store.getMetadata().initialState;
    }

    subscribe(listener: (state: LocaleState)=>void) {
        this.store.subscribe(listener);
    }
}
