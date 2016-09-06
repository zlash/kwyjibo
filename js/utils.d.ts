/// <reference types="express-serve-static-core" />
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
export declare function UrlJoin(...parts: string[]): string;
export declare type ExpressErrorRequestHandler = (err: any, req: Express.Request, res: Express.Response, next: Function) => void;
export declare let errorHandlers: ExpressErrorRequestHandler[];
export declare let defaultErrorLogger: (toLog: any) => void;
export declare let defaultWarnLogger: (toLog: any) => void;
export declare let defaultInfoLogger: (toLog: any) => void;
export declare type JSONSpecBasicType = number | string | boolean;
export declare class JSONSpec {
    [key: string]: JSONSpecBasicType | JSONSpecBasicType[] | JSONSpec | JSONSpec[];
}
export declare class Renderable extends JSONSpec {
    $render_view: string;
}
export declare function addErrorHandler(eh: ExpressErrorRequestHandler): void;
export declare function setDefaultErrorLogger(logger: (toLog: any) => void): void;
export declare function setDefaultWarnLogger(logger: (toLog: any) => void): void;
export declare function setDefaultInfoLogger(logger: (toLog: any) => void): void;
