import {AppStore} from "txsvc/AppStore";
import {APP_INITIALIZER, Injector} from "@angular/core";

export function fromStores(storeTypes) {
    // const APP_INITIALIZER = require("@angular/core").APP_INITIALIZER;
    // const Injector = require("@angular/core").Injector;

    function initAppStore(injector) {
        const appStore = new AppStore<any>();

        appStore.init(storeTypes.map(type => {
            const service = injector.get(type);
            if (!service.store) {
                console.error("Service has no store field and cannot be registered into appStore", service);
                throw new Error("Service has no store field and cannot be registered into appStore");
            }

            return service.store;
        }));
    }

    const appInitializer = {
        provide: APP_INITIALIZER,
        useFactory: injector => () => initAppStore(injector),
        deps: [Injector],
        multi: true
    };

    return storeTypes.concat(appInitializer);
}
