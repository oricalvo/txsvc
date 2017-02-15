import {TransactionScope} from "./TransactionScope";
import {ServiceStore} from "./ServiceStore";
import {AppStore} from "./AppStore";

export function transaction(appStore: AppStore<any>, func) {
    return TransactionScope.runInsideTransaction(appStore, function() {
        return func();
    });
}

export function Transaction() {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;

        descriptor.value = function(...args) {
            const service = this;
            let appStore: AppStore<any>;

            if(service.store) {
                if(!(service.store instanceof ServiceStore)) {
                    throw new Error("Unexpected store value. Should be of type ServiceStore");
                }

                appStore = service.store.getAppStore();
            }
            else if(service.appStore) {
                if(!(service.appStore instanceof AppStore)) {
                    throw new Error("Unexpected appStore value. Should be of type AppStore");
                }

                appStore = service.appStore;
            }
            else {
                throw new Error("No store/appStore field was found for service instance");
            }

            return TransactionScope.runInsideTransaction(appStore, function() {
                return method.apply(service, args);
            });

        }

        return descriptor;
    }
}
