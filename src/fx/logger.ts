let enabled = true;

const nullLogger = {
    log: function(){},
    error: function(){},
    warn: function(){},
};

export function enableLogging(enable) {
    enabled = enable;
}

export function createLogger(prefix) {
    if(!enabled) {
        return nullLogger;
    }

    return {
        log: console.log.bind(console, prefix + ">"),
        error: console.error.bind(console, prefix + ">"),
        warn: console.warn.bind(console, prefix + ">"),
    }
}