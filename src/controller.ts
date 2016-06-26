import * as Express from "express";
import * as Http from "http";
import * as Utils from "./utils"

type ControllerConstructor<T> = { new (...args: any[]): T; };

class KwyjiboController {
    path: string = "";
    ctr: Function;
    
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


/**
 * Class Decorators  
 */

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
 * @param { boolean } condition - Only mounts this controller if condition is true. 
 */
export function MountCondition(condition: boolean): (Function) => void {
    return (ctr: Function) => {
        let c = globalKState.getOrInsertController(ctr);
        c.mountCondition = c.mountCondition && condition;
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
    return (ctr: Function) => {
        let c = globalKState.getOrInsertController(ctr);
        c.mountCondition = c.mountCondition && process.env.NODE_ENV==="development";
    };
}