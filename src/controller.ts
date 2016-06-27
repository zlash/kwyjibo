import * as Express from "express";
import * as Http from "http";
import * as K from "./kwyjibo"

type MethodMountpoint = { path: string; httpMethod: string };
type extraParametersMapping = { rvc: K.RequestValueContainer; valueKey: string };

class KwyjiboMethod {
    methodMountpoints: MethodMountpoint[] = [];
    middleware: Express.RequestHandler[] = [];
    extraParametersMappings: extraParametersMapping[] = [];
    expressCompatible: boolean = false;
    docString: string = "";
    explicitlyDeclared: boolean = false;
}

type KwyjiboMethodMap = { [key: string]: KwyjiboMethod };
export type ControllerConstructor<T> = { new (...args: any[]): T; };

class KwyjiboController {
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

type KwyjiboControllerMap = { [key: string]: KwyjiboController };
type Mountpoint = { dstCtr: Function; ctr: Function };

class KwyjiboControllersState {

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

export let globalKCState = new KwyjiboControllersState();

export function addControllersToExpressApp(app: Express.Application): void {

}