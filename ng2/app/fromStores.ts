import {AppStore} from "txsvc/AppStore";
import {APP_INITIALIZER, Injector} from "@angular/core";

export function fromStores(appStore: AppStore<any>, storeTypes) {
    function initAppStore(injector) {
        //const appStore = new AppStore<any>noe();

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
