export function createLogger(prefix) {
    return {
        log: console.log.bind(console, prefix + ">"),
        error: console.error.bind(console, prefix + ">"),
        warn: console.warn.bind(console, prefix + ">"),
    }
}