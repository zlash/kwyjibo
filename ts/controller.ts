import * as Express from "express";
import * as Http from "http";
import * as U from "./utils"

export interface IDisposable {
    dispose(): void;
}

/**
 * Contains context for the current call . 
 */
export class Context {
    request: Express.Request;
    response: Express.Response;
    nextMiddleware: Function;

    private disposableInstances: IDisposable[];

    constructor() {
        this.disposableInstances = [];
    }

    create<T extends IDisposable>(tFactory: { new (...args: any[]): T; }, ...args: any[]): T {
        let instance = new tFactory(...args);
        this.disposableInstances.push(instance);
        return instance;
    }

    dispose(): void {
        for (let instance of this.disposableInstances) {
            instance.dispose();
        }
    }
}

/*********************************************************
 * Class Decorators  
 *********************************************************/

/**
 * Registers a new controller.
 * @param { string | Controller } [mountpoint] - An string indicating a path, or a Controller to mount over. If not present, the name of the class will be used as path.
 * @param { string } [path] - Used if mountpoint is a Controller. If not present, the name of the class will be used as path.     
 */
export function Controller<T>(mountpoint?: string | KwyjiboControllerConstructor<T>, path?: string): (Function) => void {
    return (ctr: Function) => {
        let c = globalKCState.getOrInsertController(ctr);
        c.explicitlyDeclared = true;
        if (mountpoint != undefined) {
            if (typeof (mountpoint) === "string") {
                c.path = mountpoint as string;
            } else {
                globalKCState.registerMountPoint(mountpoint as any, ctr);
                c.path = (typeof (path) === "string") ? path : ctr.name;
            }
        } else {
            c.path = ctr.name;
        }
        c.path = U.UrlJoin("/", c.path);
    };
}

/** 
 * Adds express middleware to run before mounting the controller 
 * @param { Express.RequestHandler[] } middleware - Array of middleware to add.
 */
export function Middleware(...middleware: Express.RequestHandler[]): (Function) => void {
    return (ctr: Function) => {
        if (middleware != undefined) {
            let c = globalKCState.getOrInsertController(ctr);
            c.middleware = middleware.concat(c.middleware);
        }
    };
}

/** 
 * @param { boolean } condition - Only mounts this controller if condition is true. 
 */
export function MountCondition(condition: boolean): (Function) => void {
    return (ctr: Function) => {
        let c = globalKCState.getOrInsertController(ctr);
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
        globalKCState.getOrInsertController(ctr).docString = docStr;
    };
}

/**
 * Generate test runner paths inside this controller
 */
export function TestRunner(): (Function) => void {
    return (ctr: Function) => {
        globalKCState.getOrInsertController(ctr).generateTestRunnerPaths = true;
    };
}

/*********************************************************
 * Method Decorators  
 *********************************************************/

export function Method(method: string, path?: string): (any, string, PropertyDescriptor) => void {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        path = (path != undefined) ? path : propertyKey;
        let m = globalKCState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
        m.methodMountpoints.push({ "path": U.UrlJoin("/", path), "httpMethod": method });
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
export function ActionMiddleware(...middleware: Express.RequestHandler[]): (any, string, PropertyDescriptor) => void {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (middleware != undefined) {
            let m = globalKCState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
            m.middleware = middleware.concat(m.middleware);
        }
    };
}

/**
 * Flags the method as "Express Compatible" and thus will be called with parameters (req,res,next)
 */
export function ExpressCompatible(): (any, string, PropertyDescriptor) => void {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let m = globalKCState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
        m.expressCompatible = true;
    };
}


/**
 *  Attach a documentation string to the method
 *  @param {string} docStr - The documentation string.
 */
export function DocAction(docStr: string): (any, string, PropertyDescriptor) => void {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let m = globalKCState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
        m.docString = docStr;
    };
}


/*********************************************************
 * Method Parameters Decorators  
 *********************************************************/

export type RequestValueContainer = "body" | "query" | "path" | "header" | "cookie";

export function MapParameterToRequestValue(rvc: RequestValueContainer, valueKey: string): (target: Object, propertyKey: string | symbol, parameterIndex: number) => void {
    return function (target: any, propertyKey: string, parameterIndex: number) {
        let m = globalKCState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
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
    for (let ck in globalKCState.controllers) {
        console.log("============================================");
        console.log(`Controller on path ${globalKCState.controllers[ck].path} built from Class ${globalKCState.controllers[ck].ctr.name}`);
        console.log("With Methods:");
        for (let mk in globalKCState.controllers[ck].methods) {
            let m = globalKCState.controllers[ck].methods[mk];
            console.log(`== ${mk} ==`);
            console.log(m);
            console.log("");
        }
    }
}

/*********************************************************
 * Internals
 *********************************************************/


export type KwyjiboMethodMountpoint = { path: string; httpMethod: string };
export type KwyjiboExtraParametersMapping = { rvc: RequestValueContainer; valueKey: string };

export class KwyjiboMethod {
    methodMountpoints: KwyjiboMethodMountpoint[] = [];
    middleware: Express.RequestHandler[] = [];
    extraParametersMappings: KwyjiboExtraParametersMapping[] = [];
    expressCompatible: boolean = false;
    docString: string = "";
    explicitlyDeclared: boolean = false;
}

export type KwyjiboMethodMap = { [key: string]: KwyjiboMethod };
export type KwyjiboControllerConstructor<T> = { new (...args: any[]): T; };

export class KwyjiboController {
    path: string;
    ctr: Function;
    middleware: Express.RequestHandler[] = [];
    methods: KwyjiboMethodMap = {};
    docString: string = "";

    generateTestRunnerPaths: boolean = false;
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

export type KwyjiboControllerMap = { [key: string]: KwyjiboController };
export type KwyjiboMountpoint = { dstCtr: Function; ctr: Function };

export class KwyjiboControllersState {

    controllers: KwyjiboControllerMap = {};
    mountpoints: KwyjiboMountpoint[] = [];

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

export let globalKCState = new KwyjiboControllersState();

export function addControllersToExpressApp(app: Express.Application): void {
    console.log("Adding controllers to Express App");

    //A method without paths, defaults to get with the name of the method as path
    for (let ck in globalKCState.controllers) {
        let c = globalKCState.controllers[ck];
        if (c.childController === false) {
            console.log(c.ctr.name);
        }

    }

}