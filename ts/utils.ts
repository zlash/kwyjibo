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

export type ExpressErrorRequestHandler = (err: any, req: Express.Request, res: Express.Response, next: Function) => void;
export let errorHandlers: ExpressErrorRequestHandler[] = [];
export let defaultErrorLogger = (toLog: any) => { console.error(toLog); };
export let defaultWarnLogger = (toLog: any) => { console.warn(toLog); };
export let defaultInfoLogger = (toLog: any) => { console.log(toLog); };

export interface Renderable {
    $render_view: string;
    [key: string]: any;
}

export function addErrorHandler(eh: ExpressErrorRequestHandler): void {
    errorHandlers.push(eh);
}

export function setDefaultErrorLogger(logger: (toLog: any) => void): void {
    defaultErrorLogger = logger;
}

export function setDefaultWarnLogger(logger: (toLog: any) => void): void {
    defaultWarnLogger = logger;
}
export function setDefaultInfoLogger(logger: (toLog: any) => void): void {
    defaultInfoLogger = logger;
}
