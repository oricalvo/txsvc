import {Injectable} from "@angular/core";
import {ServiceStore} from "../../fx/ServiceStore";
import {Transaction} from "../../fx/decorators";
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

    @Transaction()
    async change(metroId: number): Promise<MetroState> {
        const metro = await this.getMetro(metroId);

        return {
            metroId,
            metro
        };
    }

    get initialState() {
        return this.store.getMetadata().initialState;
    }

    private getMetro(metroId: number): Promise<Metro> {
        return Promise.resolve({
            id: metroId,
            name: "Israel",
            defaultLocale: "he",
        });
    }
}
