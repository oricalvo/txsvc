import {TransactionScope} from "./TransactionScope";
import {ServiceStore} from "./ServiceStore";
import {AppStore} from "./AppStore";
import {createLogger} from "./logger";
import {IService} from "./Service";

const logger = createLogger("decorators");

export function transaction(store: AppStore<any> | ServiceStore<any>, func) {
    const appStore = getAppStoreFromStore(store);

    return TransactionScope.runInsideTransaction(appStore, function() {
        return func();
    });
}

export interface ActivityOptions {
    name?: string;
    beginTransaction?: boolean;
}

function getStoreFromService(service: IService<any>) {
    let store = service.store;
    if(!store) {
        logger.error("No store field was found for store instance", service);
        throw new Error("No store field was found for store instance");
    }

    return getAppStoreFromStore(store);
}


function getAppStoreFromStore<T extends object>(store: AppStore<T> | ServiceStore<T>): AppStore<T> {
    if(store instanceof AppStore) {
        return store;
    }

    if(store instanceof ServiceStore) {
        return store.getAppStore();
    }

    throw new Error("Unexpected store value. Should be of type AppStore | ServiceStore");
}

export function Activity(options?: ActivityOptions) {
    options = options || {};

    if(options.beginTransaction===undefined) {
        options.beginTransaction = true;
    }

    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;

        descriptor.value = function(...args) {
            if(!options.beginTransaction) {
                return method.apply(this, args);
            }

            const service: IService<any> = this;
            const appStore = getStoreFromService(service);

            return TransactionScope.runInsideTransaction(appStore, function() {
                return method.apply(service, args);
            });

        }

        return descriptor;
    }
}
