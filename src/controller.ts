import * as Express from "express";
import * as Http from "http";
import * as Utils from "./utils"

/**
 * Contains context for the current call . 
 */
export class Context {
    request: Express.Request;
    response: Express.Response;
    nextMiddleware: Function;
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
                globalKState.registerMountPoint(mountpoint["new"], ctr);
                c.path = (typeof (path) === "string") ? path : ctr.name;
            }
        } else {
            c.path = ctr.name;
        }
        c.path = Utils.UrlJoin("/", c.path);
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


/*********************************************************
 * Method Decorators  
 *********************************************************/

export function Method(method: string, path?: string): (any, string, PropertyDescriptor) => void {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        //TODO: Fill
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
        //TODO: Fill
    };
}

/**
 * Flags the method as "Express Compatible" and thus will be called with parameters (req,res,next)
 */
export function ExpressCompatible(): (any, string, PropertyDescriptor) => void {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        //TODO: Fill
    };
}




/*********************************************************
 * Internals
 *********************************************************/

type ControllerConstructor<T> = { new (...args: any[]): T; };

class KwyjiboController {
    path: string;
    ctr: Function;
    middleware: Express.RequestHandler[] = [];

    /**
     * Set to true by the Controller decorator to assert that 
     * it was explicitly declared.
     */
    explicitlyDeclared: boolean = false;

    /**
     * If mountCondition is false, the controller not be mounted.
     */
    mountCondition: boolean = true;
    
}

type KwyjiboControllerMap = { [key: string]: KwyjiboController };
type Mountpoint = { dstCtr: Function; ctr: Function };

class KwyjiboInternalState {

    private controllers: KwyjiboControllerMap = {};
    private mountpoints: Mountpoint[] = [];

    getOrInsertController(ctr: Function): KwyjiboController {
        let key = ctr.toString();
        if (this.controllers[key] == undefined) {
            this.controllers[key] = new KwyjiboController();
            this.controllers[key].ctr = ctr;
        }
        return this.controllers[key];
    }

    registerMountPoint(dstCtr: Function, ctr: Function): void {
        this.mountpoints.push({ "dstCtr": dstCtr, "ctr": ctr });
    }

}

let globalKState = new KwyjiboInternalState();

