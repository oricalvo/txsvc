export const ROOT = "/";
export const $$MODIFIED = "$$txsvc:modified";

export class TransactionalObject<StateT> {
    state: StateT;
    newState: StateT;
    modified: object[];

    static ROOT: string = ROOT;

    constructor(initialState: StateT) {
        this.state = this.newState = initialState;
        this.modified = [];
    }

    commit() {
        for(var obj of this.modified) {
            delete obj[$$MODIFIED];
        }
        this.modified.splice(0, this.modified.length);

        this.state = this.newState;
    }

    getState() {
        return this.state;
    }

    getNewState() {
        return this.newState;
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

    setProperty(path, changes) {
        const pathEntries = this.getPath(this.newState, path);
        const lastEntry = pathEntries[pathEntries.length-1];
        const parent = (lastEntry ? lastEntry.parent[lastEntry.field] : this.newState);
        let newValue = this.merge(parent, changes);

        for(let i=pathEntries.length-1; i>=0; i--) {
            const entry = pathEntries[i];
            const parent = entry.parent;
            const field = entry.field;

            newValue = this.setField(parent, field, newValue);
        }

        this.newState = newValue;
    }

    private setField(parent, field, value) {
        const newParent = this.clone(parent);
        newParent[field] = value;
        return newParent;
    }

    private getPath(obj, path) {
        const entries: {parent: any, field: string}[] = [];

        if(path == ROOT) {
            return entries;
        }

        let parent = obj;
        const fields = path.split(".");
        for(let field of fields) {
            if(parent===null || parent===undefined) {
                break;
            }

            if(typeof parent != "object") {
                throw new Error("Invalid path: " + path);
            }

            entries.push({parent, field});

            parent = parent[field];
        }

        return entries;
    }

    private clone(obj) {
        if (obj && obj[$$MODIFIED]) {
            //
            //  This object is already a clone
            //  No need to clone again
            //
            return obj;
        }

        var res = Object.assign({}, obj);
        res[$$MODIFIED] = true;
        this.modified.push(res);
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
                }
            }
        }

        return newObj;
    }
}
