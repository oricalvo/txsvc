import {Injectable} from "@angular/core";
import {ServiceStore} from "../../fx/servicestore";
import {Action} from "../../fx/Action";
import {appStore} from "./appStore";

export interface Metro {
    id: number;
    name: string;
    defaultLocale: string;
}

export interface MetroState {
    readonly metroId: number;
    readonly metro: Metro;
}

@Injectable()
export class MetroService {
    private store: ServiceStore<MetroState>;

    constructor() {
        this.store = new ServiceStore<MetroState>(appStore, {
            path: "metro",
            initialState: {
                metroId: 1,
                metro: {
                    id: 1,
                    name: "NewYork",
                    defaultLocale: "en",
                }
            }
        });
    }

    @Action()
    async change(metroId: number): Promise<MetroState> {
        const metro = await this.getMetro(metroId);

        return this.store.commit({
            metroId,
            metro
        });
    }

    get initialState() {
        return this.store.initialState;
    }

    private getMetro(metroId: number): Promise<Metro> {
        return Promise.resolve({
            id: metroId,
            name: "Israel",
            defaultLocale: "he",
        });
    }
}
