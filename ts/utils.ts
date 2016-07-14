export function UrlJoin(...parts: string[]): string {
    let ret = parts.join("/");

    // remove consecutive slashes
    ret = ret.replace(/([^\/]*)\/+/g, "$1/");

    // make sure protocol is followed by two slashes
    ret = ret.replace(/(:\/|:\/\/)/g, "://");

    // remove trailing slash before parameters or hash
    ret = ret.replace(/\/(\?|&|#[^!])/g, "$1");

    // replace ? in parameters with &
    ret = ret.replace(/(\?.+)\?/g, "$1&");

    return ret;
}

export let defaultError = (toLog: any) => { console.error(toLog.toString()); };
export let defaultWarn = (toLog: any) => { console.warn(toLog.toString()); };
export let defaultLog = (toLog: any) => { console.log(toLog.toString()); };


