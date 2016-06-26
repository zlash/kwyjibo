import * as Express from "express";
import * as Http from "http";

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

}

/*********************************************************
 * Class Decorators  
 *********************************************************/

/**
 * Registers a new controller.
 * @param { string | Controller } [mountpoint] - An string indicating a path, or a Controller to mount over. If not present, the name of the class will be used as path.
 * @param { string } [path] - Used if mountpoint is a Controller. If not present, the name of the class will be used as path.     
 */
export function Controller<T>(mountpoint: string | ControllerConstructor<T>, path?: string): (Function) => void {
    return (ctr: Function) => {
        let c = globalKState.getOrInsertController(ctr);
        c.explicitlyDeclared = true;
        if (mountpoint != undefined) {
            if (typeof (mountpoint) === "string") {
                c.path = mountpoint as string;
            } else {
                globalKState.registerMountPoint(mountpoint as any, ctr);
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
            let c = globalKState.getOrInsertController(ctr);
            c.middleware = middleware.concat(c.middleware);
        }
    };
}

/** 
 * @param { boolean } condition - Only mounts this controller if condition is true. 
 */
export function MountCondition(condition: boolean): (Function) => void {
    return (ctr: Function) => {
        let c = globalKState.getOrInsertController(ctr);
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
 *  Attach a documentation string to the controller
 *  @param {string} docStr - The documentation string.
 */
export function DocController(docStr: string): (Function) => void {
    return (ctr: Function) => {
        globalKState.getOrInsertController(ctr).docString = docStr;
    };
}


/*********************************************************
 * Method Decorators  
 *********************************************************/

export function Method(method: string, path?: string): (any, string, PropertyDescriptor) => void {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        path = (path != undefined) ? path : propertyKey;
        let m = globalKState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
        m.methodMountpoints.push({ "path": UrlJoin("/", path), "httpMethod": method });
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
            let m = globalKState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
            m.middleware = middleware.concat(m.middleware);
        }
    };
}

/**
 * Flags the method as "Express Compatible" and thus will be called with parameters (req,res,next)
 */
export function ExpressCompatible(): (any, string, PropertyDescriptor) => void {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let m = globalKState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
        m.expressCompatible = true;
    };
}


/**
 *  Attach a documentation string to the method
 *  @param {string} docStr - The documentation string.
 */
export function DocAction(docStr: string): (any, string, PropertyDescriptor) => void {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let m = globalKState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
        m.docString = docStr;
    };
}


/*********************************************************
 * Method Parameters Decorators  
 *********************************************************/

type RequestValueContainer = "body" | "query" | "path" | "header" | "cookie";

export function MapParameterToRequestValue(rvc: RequestValueContainer, valueKey: string): (target: Object, propertyKey: string | symbol, parameterIndex: number) => void {
    return function (target: any, propertyKey: string, parameterIndex: number) {
        let m = globalKState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
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
    for (let ck in globalKState.controllers) {
        console.log("============================================");
        console.log(`Controller on path ${globalKState.controllers[ck].path} built from Class ${globalKState.controllers[ck].ctr.name}`);
        console.log("With Methods:");
        for (let mk in globalKState.controllers[ck].methods) {
            let m = globalKState.controllers[ck].methods[mk];
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

/*********************************************************
 * Internals
 *********************************************************/

type MethodMountpoint = { path: string; httpMethod: string };
type extraParametersMapping = { rvc: RequestValueContainer; valueKey: string };

class KwyjiboMethod {
    methodMountpoints: MethodMountpoint[] = [];
    middleware: Express.RequestHandler[] = [];
    extraParametersMappings: extraParametersMapping[] = [];
    expressCompatible: boolean = false;
    docString: string = "";
}

type KwyjiboMethodMap = { [key: string]: KwyjiboMethod };
type ControllerConstructor<T> = { new (...args: any[]): T; };

class KwyjiboController {
    path: string;
    ctr: Function;
    middleware: Express.RequestHandler[] = [];
    methods: KwyjiboMethodMap = {};
    docString: string = "";


    childController: boolean = false;

    /**
     * Set to true by the Controller decorator to assert that 
     * it was explicitly declared.
     */
    explicitlyDeclared: boolean = false;

    /**
     * If mountCondition is false, the controller not be mounted.
     */
    mountCondition: boolean = true;

    getOrInsertMethod(key: string): KwyjiboMethod {
        if (this.methods[key] == undefined) {
            this.methods[key] = new KwyjiboMethod();
        }
        return this.methods[key];
    }

}

type KwyjiboControllerMap = { [key: string]: KwyjiboController };
type Mountpoint = { dstCtr: Function; ctr: Function };

class KwyjiboInternalState {

    controllers: KwyjiboControllerMap = {};
    mountpoints: Mountpoint[] = [];

    getOrInsertController(ctr: Function): KwyjiboController {
        let key = ctr.toString();
        if (this.controllers[key] == undefined) {
            this.controllers[key] = new KwyjiboController();
            this.controllers[key].ctr = ctr;
        }
        return this.controllers[key];
    }

    registerMountPoint(dstCtr: any, ctr: Function): void {
        this.getOrInsertController(ctr).childController = true;
        this.mountpoints.push({ "dstCtr": dstCtr, "ctr": ctr });
    }

}

let globalKState = new KwyjiboInternalState();

