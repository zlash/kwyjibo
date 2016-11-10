/// <reference types="express" />
/// <reference types="node" />
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
import * as Express from "express";
export interface IDisposable {
    dispose(): void;
}
/**
 * Contains context for the current call .
 */
export declare class Context {
    request: Express.Request;
    response: Express.Response;
    nextMiddleware: Function;
    private disposableInstances;
    constructor();
    create<T extends IDisposable>(tFactory: {
        new (...args: any[]): T;
    }, ...args: any[]): T;
    dispose(): void;
}
export declare class HttpError {
    code: number;
    message: string;
    constructor(code: number, messageOrError: string | Error);
}
export declare class BadRequest extends HttpError {
    constructor(messageOrError: string | Error);
}
export declare class Unauthorized extends HttpError {
    constructor(messageOrError: string | Error);
}
export declare class NotFound extends HttpError {
    constructor(messageOrError: string | Error);
}
export declare class InternalServerError extends HttpError {
    constructor(messageOrError: string | Error);
}
export declare let globalKCState: KwyjiboControllersState;
/*********************************************************
 * Class Decorators
 *********************************************************/
/**
 * Registers a new controller.
 * @param { string | Controller } [mountpoint] - An string indicating a path, or a Controller to mount over. If not present, the name of the class will be used as path.
 * @param { string } [path] - Used if mountpoint is a Controller. If not present, the name of the class will be used as path.
 */
export declare function Controller<T>(mountpoint?: string | KwyjiboControllerConstructor<T>, path?: string): (f: Function) => void;
/**
 * Adds express middleware to run before mounting the controller
 * @param { Express.RequestHandler[] } middleware - Array of middleware to add.
 */
export declare function Middleware(...middleware: Express.RequestHandler[]): (f: Function) => void;
/**
 * @param { boolean } condition - Only mounts this controller if condition is true.
 */
export declare function MountCondition(condition: boolean): (f: Function) => void;
/**
 *  Only mounts this controller if NODE_ENV is set to "development"
 */
export declare function Dev(): (f: Function) => void;
/**
 *  Attach a documentation string to the controller
 *  @param {string} docStr - The documentation string.
 */
export declare function DocController(docStr: string): (f: Function) => void;
/**
 * Generate test runner paths inside this controller
 */
export declare function TestRunner(): (f: Function) => void;
/*********************************************************
 * Method Decorators
 *********************************************************/
export declare function Method(method: string, path?: string): (a: any, s: string, pd: PropertyDescriptor) => void;
export declare function Get(path?: string): (a: any, s: string, pd: PropertyDescriptor) => void;
export declare function Post(path?: string): (a: any, s: string, pd: PropertyDescriptor) => void;
export declare function Put(path?: string): (a: any, s: string, pd: PropertyDescriptor) => void;
export declare function Patch(path?: string): (a: any, s: string, pd: PropertyDescriptor) => void;
export declare function Delete(path?: string): (a: any, s: string, pd: PropertyDescriptor) => void;
/**
 * Adds express middleware to run before the method
 * @param { Express.RequestHandler[] } middleware - Array of middleware to add.
 */
export declare function ActionMiddleware(...middleware: Express.RequestHandler[]): (a: any, s: string, pd: PropertyDescriptor) => void;
/**
 * Flags the method as "Express Compatible" and thus will be called with parameters (req,res,next)
 */
export declare function ExpressCompatible(): (a: any, s: string, pd: PropertyDescriptor) => void;
/**
 *  Attach a documentation string to the method
 *  @param {string} docStr - The documentation string.
 */
export declare function DocAction(docStr: string): (a: any, s: string, pd: PropertyDescriptor) => void;
/**
 *  Attach a OpenApi Response to the method
 *  @param {number|string} httpCode - The http code used for the response
 *  @param {string} description - Response description
 *  @param {string} type - The Open Api defined type.
 */
export declare function OpenApiResponse(httpCode: number | string, description: string, type: string): (a: any, s: string, pd: PropertyDescriptor) => void;
/*********************************************************
 * Method Parameters Decorators
 *********************************************************/
export declare type RequestValueContainer = "body" | "query" | "path" | "header" | "cookie";
export declare function MapParameterToRequestValue(rvc: RequestValueContainer, valueKey: string, openApiType?: string): (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;
export declare function FromBody(openApiType?: string, valueKey?: string): (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;
export declare function FromQuery(valueKey: string, openApiType?: string): (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;
export declare function FromPath(valueKey: string, openApiType?: string): (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;
export declare function FromHeader(valueKey: string, openApiType?: string): (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;
export declare function FromCookie(valueKey: string, openApiType?: string): (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;
/*********************************************************
 * Utils
 *********************************************************/
export declare function DumpInternals(): void;
/*********************************************************
 * Internals
 *********************************************************/
export declare type KwyjiboMethodMountpoint = {
    path: string;
    httpMethod: string;
};
export declare type KwyjiboExtraParametersMapping = {
    rvc: RequestValueContainer;
    valueKey: string;
    openApiType: string;
};
export declare class KwyjiboMethodOpenApiResponses {
    [httpCode: string]: {
        description: string;
        type: string;
    };
}
export declare class KwyjiboMethod {
    methodMountpoints: KwyjiboMethodMountpoint[];
    middleware: Express.RequestHandler[];
    extraParametersMappings: KwyjiboExtraParametersMapping[];
    expressCompatible: boolean;
    docString: string;
    openApiResponses: KwyjiboMethodOpenApiResponses;
    explicitlyDeclared: boolean;
}
export declare type KwyjiboMethodMap = {
    [key: string]: KwyjiboMethod;
};
export declare type KwyjiboControllerConstructor<T> = {
    new (...args: any[]): T;
};
export declare class KwyjiboController {
    path: string;
    ctr: Function;
    middleware: Express.RequestHandler[];
    methods: KwyjiboMethodMap;
    docString: string;
    router: Express.Router;
    generateTestRunnerPaths: boolean;
    childController: boolean;
    node: KwyjiboControllerTreeNode;
    /**
     * Set to true by the Controller decorator to assert that
     * it was explicitly declared.
     */
    explicitlyDeclared: boolean;
    /**
     * If mountCondition is false, the controller not be mounted.
     */
    mountCondition: boolean;
    getOrInsertMethod(key: string): KwyjiboMethod;
}
export declare class KwyjiboControllerTreeNode {
    controller: KwyjiboController;
    childs: KwyjiboControllerTreeNode[];
    fullPath: string;
    constructor(controller: KwyjiboController);
}
export declare type KwyjiboControllerMap = {
    [key: string]: KwyjiboController;
};
export declare type KwyjiboMountpoint = {
    dstCtr: Function;
    ctr: Function;
};
export declare class KwyjiboControllersState {
    controllers: KwyjiboControllerMap;
    mountpoints: KwyjiboMountpoint[];
    controllersTree: KwyjiboControllerTreeNode[];
    getController(ctr: Function): KwyjiboController;
    getOrInsertController(ctr: Function): KwyjiboController;
    registerMountPoint(dstCtr: any, ctr: Function): void;
}
export declare let initialized: boolean;
export declare function initialize(app: Express.Application, ...requiredDirectories: string[]): void;
export declare function initializeAtRoute(rootPath: string, app: Express.Application, ...requiredDirectories: string[]): void;
export declare function getActionRoute<T>(controller: KwyjiboControllerConstructor<T>, methodName: string, httpMethod?: string): string;
