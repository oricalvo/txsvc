import {MetroState, MetroService} from "./metro.service";
import {LocaleState, LocaleService} from "./locale.service";
import {Injectable} from "@angular/core";
import {ServiceStore} from "../../fx/ServiceStore";
import {Action} from "../../fx/Action";
import {appStore} from "./appStore";

export interface AppState {
    readonly metro: MetroState;
    readonly locale: LocaleState;
}

@Injectable()
export class RootService {
    private store: ServiceStore<AppState>;

    constructor(private metroService: MetroService,
                private localeService: LocaleService) {
        this.store = new ServiceStore<AppState>(appStore, {
            path: "/",
            initialState: {
                metro: metroService.initialState,
                locale: localeService.initialState,
            }
        });
    }

    subscribe(listener: (state: AppState)=>void) {
        this.store.subscribe(listener);
    }

    @Action()
    async changeMetro(metroId: number): Promise<AppState> {
        const metroState = await this.metroService.change(metroId);
        const localeState = await this.localeService.change(metroState.metro.defaultLocale);

        return this.store.commit({
            metro: metroState,
            locale: localeState,
            id: 123,
        });
    }
}
