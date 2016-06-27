import * as Express from "express";
import * as Http from "http";
import * as C from "./controller";
import * as T from "./testing"

/**
 * Contains context for the current call . 
 */
export class Context {
    request: Express.Request;
    response: Express.Response;
    nextMiddleware: Function;
}


/**
 * Entry point
 */
export function addControllersToExpressApp(app: Express.Application): void {
    C.addControllersToExpressApp(app);
}

/*********************************************************
 * Class Decorators  
 *********************************************************/

/**
 * Registers a new controller.
 * @param { string | Controller } [mountpoint] - An string indicating a path, or a Controller to mount over. If not present, the name of the class will be used as path.
 * @param { string } [path] - Used if mountpoint is a Controller. If not present, the name of the class will be used as path.     
 */
export function Controller<T>(mountpoint: string | C.ControllerConstructor<T>, path?: string): (Function) => void {
    return (ctr: Function) => {
        let c = C.globalKCState.getOrInsertController(ctr);
        c.explicitlyDeclared = true;
        if (mountpoint != undefined) {
            if (typeof (mountpoint) === "string") {
                c.path = mountpoint as string;
            } else {
                C.globalKCState.registerMountPoint(mountpoint as any, ctr);
                c.path = (typeof (path) === "string") ? path : ctr.name;
            }
        } else {
            c.path = ctr.name;
        }
        c.path = UrlJoin("/", c.path);
    };
}

/** 
 * Adds express middleware to run before mounting the controller 
 * @param { Express.RequestHandler[] } middleware - Array of middleware to add.
 */
export function MountMiddleware(...middleware: Express.RequestHandler[]): (Function) => void {
    return (ctr: Function) => {
        if (middleware != undefined) {
            let c = C.globalKCState.getOrInsertController(ctr);
            c.middleware = middleware.concat(c.middleware);
        }
    };
}

/** 
 * @param { boolean } condition - Only mounts this controller if condition is true. 
 */
export function MountCondition(condition: boolean): (Function) => void {
    return (ctr: Function) => {
        let c = C.globalKCState.getOrInsertController(ctr);
        c.mountCondition = c.mountCondition && condition;
    };
}

/** 
 *  Only mounts this controller if NODE_ENV is set to "development"
 */
export function Dev(): (Function) => void {
    return MountCondition(process.env.NODE_ENV === "development");
}

/**
 * Generate test runner paths inside this controller
 */
export function TestRunner(): (Function) => void {
    return (ctr: Function) => {
        C.globalKCState.getOrInsertController(ctr).generateTestRunnerPaths = true;
    };
}

/**
 *  Attach a documentation string to the controller
 *  @param {string} docStr - The documentation string.
 */
export function DocController(docStr: string): (Function) => void {
    return (ctr: Function) => {
        C.globalKCState.getOrInsertController(ctr).docString = docStr;
    };
}

/**
 *  Registers a fixture of tests with the global test runner.
 *  @param {string} humanReadableName - The human readable name for the fixture
 */
export function Fixture(humanReadableName?: string): (Function) => void {
    return (ctr: Function) => {
        let fixture = T.globalKTState.getOrInsertFixture(ctr);
        fixture.humanReadableName = typeof (humanReadableName) === "string" ? humanReadableName : ctr.name;
        fixture.explicitlyDeclared = true;
    };
}


/*********************************************************
 * Method Decorators  
 *********************************************************/

export function Method(method: string, path?: string): (any, string, PropertyDescriptor) => void {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        path = (path != undefined) ? path : propertyKey;
        let m = C.globalKCState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
        m.methodMountpoints.push({ "path": UrlJoin("/", path), "httpMethod": method });
        m.explicitlyDeclared = true;
    };
}

export function Get(path?: string): (any, string, PropertyDescriptor) => void {
    return Method("get", path);
}

export function Post(path?: string): (any, string, PropertyDescriptor) => void {
    return Method("post", path);
}

/** 
 * Adds express middleware to run before the method 
 * @param { Express.RequestHandler[] } middleware - Array of middleware to add.
 */
export function Middleware(...middleware: Express.RequestHandler[]): (any, string, PropertyDescriptor) => void {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (middleware != undefined) {
            let m = C.globalKCState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
            m.middleware = middleware.concat(m.middleware);
        }
    };
}

/**
 * Flags the method as "Express Compatible" and thus will be called with parameters (req,res,next)
 */
export function ExpressCompatible(): (any, string, PropertyDescriptor) => void {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let m = C.globalKCState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
        m.expressCompatible = true;
    };
}


/**
 *  Attach a documentation string to the method
 *  @param {string} docStr - The documentation string.
 */
export function DocAction(docStr: string): (any, string, PropertyDescriptor) => void {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let m = C.globalKCState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
        m.docString = docStr;
    };
}

/**
 *  Register a new test. If the test throws it fails, otherwise it passes.
 *  @param {string} humanReadableName - The human readable name for this test.
 */
export function Test(humanReadableName: string): (any, string, PropertyDescriptor) => void {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let f = T.globalKTState.getOrInsertFixture(target.constructor);
        let t = f.getOrInsertTest(propertyKey);
        t.humanReadableName = humanReadableName;
        t.explicitlyDeclared = true;
    };
}


/**
 *  Method to run before any of the tests.
 */
export function Before(): (any, string, PropertyDescriptor) => void {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        T.globalKTState.getOrInsertFixture(target.constructor).runBeforeMethods.push(propertyKey);
    };
}

/**
 *  Method to run after any of the tests.
 */
export function After(): (any, string, PropertyDescriptor) => void {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        T.globalKTState.getOrInsertFixture(target.constructor).runAfterMethods.push(propertyKey);
    };
}


/*********************************************************
 * Method Parameters Decorators  
 *********************************************************/

export type RequestValueContainer = "body" | "query" | "path" | "header" | "cookie";

export function MapParameterToRequestValue(rvc: RequestValueContainer, valueKey: string): (target: Object, propertyKey: string | symbol, parameterIndex: number) => void {
    return function (target: any, propertyKey: string, parameterIndex: number) {
        let m = C.globalKCState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
        m.extraParametersMappings[parameterIndex] = { "rvc": rvc, "valueKey": valueKey };
    };
}

export function FromBody(valueKey: string): (target: Object, propertyKey: string | symbol, parameterIndex: number) => void {
    return MapParameterToRequestValue("body", valueKey);
}

export function FromQuery(valueKey: string): (target: Object, propertyKey: string | symbol, parameterIndex: number) => void {
    return MapParameterToRequestValue("query", valueKey);
}

export function FromPath(valueKey: string): (target: Object, propertyKey: string | symbol, parameterIndex: number) => void {
    return MapParameterToRequestValue("path", valueKey);
}

export function FromHeader(valueKey: string): (target: Object, propertyKey: string | symbol, parameterIndex: number) => void {
    return MapParameterToRequestValue("header", valueKey);
}
export function FromCookie(valueKey: string): (target: Object, propertyKey: string | symbol, parameterIndex: number) => void {
    return MapParameterToRequestValue("cookie", valueKey);
}

/*********************************************************
 * Utils
 *********************************************************/

export function DumpInternals(): void {
    for (let ck in C.globalKCState.controllers) {
        console.log("============================================");
        console.log(`Controller on path ${C.globalKCState.controllers[ck].path} built from Class ${C.globalKCState.controllers[ck].ctr.name}`);
        console.log("With Methods:");
        for (let mk in C.globalKCState.controllers[ck].methods) {
            let m = C.globalKCState.controllers[ck].methods[mk];
            console.log(`== ${mk} ==`);
            console.log(m);
            console.log("");
        }
    }
}

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




