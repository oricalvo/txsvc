import {ActionScope} from "./ActionScope";
import {ServiceStore} from "./ServiceStore";

export function Action() {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;

        descriptor.value = function() {
            const service = this;
            const serviceStore: ServiceStore<any> = service.store;

            if(!serviceStore) {
                throw new Error("No store for service instance");
            }

            const args = [];
            for(var i=0; i<arguments.length; i++) {
                args.push(arguments[i]);
            }

            return ActionScope.require(serviceStore.appStore, serviceStore.path, function() {
                return method.apply(service, args);
            });

        }

        return descriptor;
    }
}
