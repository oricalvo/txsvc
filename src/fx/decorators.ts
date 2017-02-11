import {TransactionScope} from "./TransactionScope";
import {ServiceStore} from "./ServiceStore";

export function Transaction() {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;

        descriptor.value = function(...args) {
            const service = this;
            const serviceStore: ServiceStore<any> = service.store;

            if(!serviceStore) {
                throw new Error("No store was found for service instance");
            }

            return TransactionScope.runInsideTransaction(serviceStore, function() {
                return method.apply(service, args);
            });

        }

        return descriptor;
    }
}
