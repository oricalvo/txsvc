const ROOT = "/";

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
    if(typeof changes != "object") {
        return changes;
    }

    const newObj = clone(obj);

    for(let field in changes) {
        newObj[field] = merge(obj[field], changes[field]);
    }

    return newObj;
}

export function clone(obj) {
    if(obj.$$new) {
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
