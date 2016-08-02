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

export function setDefaultErrorHandler(handler: (toLog: any) => void): void {
    defaultError = handler;
}

export function setDefaultWarnHandler(handler: (toLog: any) => void): void {
    defaultWarn = handler;
}
export function setDefaultLogHandler(handler: (toLog: any) => void): void {
    defaultLog = handler;
}
