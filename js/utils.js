/*********************************************************************************

MIT License

Copyright (c) 2016 - Miguel Ángel Pérez Martínez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*********************************************************************************/
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
exports.errorHandlers = [];
exports.defaultErrorLogger = (toLog) => { console.error(toLog); };
exports.defaultWarnLogger = (toLog) => { console.warn(toLog); };
exports.defaultInfoLogger = (toLog) => { console.log(toLog); };
class JSONSpec {
}
exports.JSONSpec = JSONSpec;
class Renderable extends JSONSpec {
}
exports.Renderable = Renderable;
function addErrorHandler(eh) {
    exports.errorHandlers.push(eh);
}
exports.addErrorHandler = addErrorHandler;
function setDefaultErrorLogger(logger) {
    exports.defaultErrorLogger = logger;
}
exports.setDefaultErrorLogger = setDefaultErrorLogger;
function setDefaultWarnLogger(logger) {
    exports.defaultWarnLogger = logger;
}
exports.setDefaultWarnLogger = setDefaultWarnLogger;
function setDefaultInfoLogger(logger) {
    exports.defaultInfoLogger = logger;
}
exports.setDefaultInfoLogger = setDefaultInfoLogger;
//# sourceMappingURL=utils.js.map