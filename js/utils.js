"use strict";
function UrlJoin(...parts) {
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
exports.UrlJoin = UrlJoin;
exports.defaultError = (toLog) => { console.error(toLog.toString()); };
exports.defaultWarn = (toLog) => { console.warn(toLog.toString()); };
exports.defaultLog = (toLog) => { console.log(toLog.toString()); };
function setDefaultErrorHandler(handler) {
    exports.defaultError = handler;
}
exports.setDefaultErrorHandler = setDefaultErrorHandler;
function setDefaultWarnHandler(handler) {
    exports.defaultWarn = handler;
}
exports.setDefaultWarnHandler = setDefaultWarnHandler;
function setDefaultLogHandler(handler) {
    exports.defaultLog = handler;
}
exports.setDefaultLogHandler = setDefaultLogHandler;
//# sourceMappingURL=utils.js.map