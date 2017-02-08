export const ROOT = "/";

export function set(obj, path, changes) {
    let objAtPath = resolvePath(obj, path);

    objAtPath = merge(objAtPath, changes);

    const clone = clonePath(obj, path, objAtPath);
    return clone;
}

export function setNoClone(obj, path, val) {
    if(path == ROOT) {
        if(typeof val !== "object") {
            throw new Error("An object is required");
        }

        Object.assign(obj, val);
        return;
    }

    const parts = path.split(".");
    for(let i=0; i<parts.length-1; i++) {
        obj = obj[parts[i]];
    }

    obj[parts[parts.length-1]] = val;
}

export function replace(obj, path, oldValue, value) {
    let valueAtPath = resolvePath(obj, path);
    if(valueAtPath !== oldValue) {
        throw new Error("Concurrency error");
    }

    return clonePath(obj, path, value);
}

export function clonePath(root, path, state) {
    const parts = (path!=ROOT ? path.split(".") : []);
    return internalClonePath(root, parts, 0, state);
}

function internalClonePath(root, parts, index, state) {
    if(parts.length == index) {
        return state;
    }

    const field = parts[index];
    let res = assign(root, {
        [field]: internalClonePath(root[field], parts, index+1, state)
    });

    return res;
}

export function resolvePath(root, path) {
    if(path == ROOT) {
        return root;
    }

    const parts = path.split(".");
    for(let part of parts) {
        root = root[part];
    }

    return root;
}

export function isChildPath(parent, child) {
    const res = (child.indexOf(parent) == 0);
    return res;
}

export function merge(obj, changes) {
    if(obj == changes) {
        return changes;
    }

    if(typeof changes != "object") {
        return changes;
    }

    if(Array.isArray(obj)) {
        return changes;
    }

    const newObj = clone(obj);

    for (let field in changes) {
        if(changes.hasOwnProperty(field)) {
            newObj[field] = changes[field];
        }
        else {
            newObj[field] = obj[field];
        }

        //newObj[field] = merge(obj && obj[field], changes[field]);
    }

    return newObj;
}

export function clone(obj) {
    if(obj && obj.$$new) {
        return obj;
    }

    return Object.assign({}, obj, {$$new: true});
}

function assign(obj, changes) {
    if (obj.$$new) {
        Object.assign(obj, changes);
        return obj;
    }

    let hasChanges = false;
    for(let field in changes) {
        if(obj[field]!=changes[field]) {
            hasChanges = true;
            break;
        }
    }

    if(!hasChanges) {
        return obj;
    }

    const res = Object.assign({}, obj, changes);
    res.$$new = true;
    return res;
}

export function clean(state) {
    delete state["$$new"];

    for(let field in state) {
        let obj = state[field];
        if(typeof obj == "object" && obj !== null) {
            clean(obj);
        }
    }
}

export function P1
<
    T,
    K1 extends keyof T
    >(obj: T, key1: K1) {
    if(!obj) {
        return undefined;
    }

    return obj[key1];  // Inferred type is T[K]
}

export function E1
<
    T,
    K1 extends keyof T
    >(obj1: T, obj2: T, key1: K1) {
    if(obj1==obj2) {
        return true;
    }

    return P1(obj1, key1) == P1(obj2, key1);
}

export function P2
<
    T,
    K1 extends keyof T,
    K2 extends keyof T[K1]
    >
(obj: T, key1: K1, key2: K2) {
    return P1(P1(obj, key1), key2);
}

export function E2
<
    T,
    K1 extends keyof T,
    K2 extends keyof T[K1]
    >(obj1: T, obj2: T, key1: K1, key2: K2) {
    if(obj1==obj2) {
        return true;
    }

    return P2(obj1, key1, key2) == P2(obj2, key1, key2);
}

export function P3
<
    T,
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2]
    >
(obj: T, key1: K1, key2: K2, key3: K3) {
    return P1(P1(P1(obj, key1), key2), key3);
}
