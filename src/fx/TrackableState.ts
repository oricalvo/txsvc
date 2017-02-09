export const ROOT = "/";
export const $$NEW = "__txsvc:new";
export const $$CHANGES = "__txsvc:changes";

export class TrackableState {
    oldState: any;
    newState: any;
    changes: Set<object>;

    constructor(state) {
        this.oldState = this.newState = state;
        this.changes = new Set<object>();
    }

    setProperty(obj, path, changes) {
        let objAtPath = this.getProperty(obj, path);

        objAtPath = this.merge(objAtPath, changes);

        const clone = this.clonePath(obj, path, objAtPath);
        return clone;
    }

    getProperty(root, path) {
        if (path == ROOT) {
            return root;
        }

        const parts = path.split(".");
        for (let part of parts) {
            root = root[part];
        }

        return root;
    }

    private clonePath(root, path, state) {
        const parts = (path != ROOT ? path.split(".") : []);
        return this.internalClonePath(root, parts, 0, state);
    }

    private assign(obj, changes) {
        if (obj[$$NEW]) {
            Object.assign(obj, changes);
            return obj;
        }

        let hasChanges = false;
        for (let field in changes) {
            if (obj[field] != changes[field]) {
                hasChanges = true;
                break;
            }
        }

        if (!hasChanges) {
            return obj;
        }

        const res = Object.assign({}, obj, changes);
        res[$$NEW] = true;
        return res;
    }

    private internalClonePath(root, parts, index, state) {
        if (parts.length == index) {
            return state;
        }

        const field = parts[index];
        let res = this.assign(root, {
            [$$NEW]: true,
            [field]: this.internalClonePath(root[field], parts, index + 1, state)
        });

        return res;
    }


    private clone(obj) {
        if (obj && obj[$$NEW]) {
            //
            //  This object is already a clone
            //  No need to clone again
            //
            return obj;
        }

        var res = Object.assign({}, obj, {[$$NEW]: true});
        return res;
    }

    private merge(obj, changes) {
        if (obj == changes) {
            return changes;
        }

        if (typeof changes != "object") {
            //
            //  Cannot merge a value into itself
            //
            return changes;
        }

        if (Array.isArray(obj)) {
            //
            //  Cannot merge arrays
            //
            return changes;
        }

        const newObj = this.clone(obj);

        for (let field in changes) {
            if (changes.hasOwnProperty(field)) {
                const newValue = changes[field];
                const oldValue = newObj[field];
                if(oldValue!=newValue) {
                    newObj[field] = newValue;
                    //newObj[field] = merge(obj && obj[field], changes[field]);

                    newObj[$$CHANGES] = newObj[$$CHANGES] || {};
                    newObj[$$CHANGES][field] = {oldValue: oldValue, newValue: newValue};
                }

            }
        }

        return newObj;
    }
}
