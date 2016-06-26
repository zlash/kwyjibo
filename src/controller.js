"use strict";
const Utils = require("./utils");
class KwyjiboController {
    constructor() {
        this.path = "";
        /**
         * Set to true by the Controller decorator to assert that
         * it was explicitly declared.
         */
        this.explicitlyDeclared = false;
        /**
         * If mountCondition is false, the controller not be mounted.
         */
        this.mountCondition = true;
    }
}
class KwyjiboInternalState {
    constructor() {
        this.controllers = {};
        this.mountpoints = [];
    }
    getOrInsertController(ctr) {
        let key = ctr.toString();
        if (this.controllers[key] == undefined) {
            this.controllers[key] = new KwyjiboController();
            this.controllers[key].ctr = ctr;
        }
        return this.controllers[key];
    }
    registerMountPoint(dstCtr, ctr) {
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
function Controller(mountpoint, path) {
    return (ctr) => {
        let c = globalKState.getOrInsertController(ctr);
        c.explicitlyDeclared = true;
        if (mountpoint != undefined) {
            if (typeof (mountpoint) === "string") {
                c.path = mountpoint;
            }
            else {
                globalKState.registerMountPoint(mountpoint["new"], ctr);
                c.path = (typeof (path) === "string") ? path : ctr.name;
            }
        }
        else {
            c.path = ctr.name;
        }
        c.path = Utils.UrlJoin("/", c.path);
    };
}
exports.Controller = Controller;
/**
 * @param { boolean } condition - Only mounts this controller if condition is true.
 */
function MountCondition(condition) {
    return (ctr) => {
        let c = globalKState.getOrInsertController(ctr);
        c.mountCondition = c.mountCondition && condition;
    };
}
exports.MountCondition = MountCondition;
/**
 * @param { boolean } condition - Only mounts this controller if condition is true.
 */
function MountCondition(condition) {
    return (ctr) => {
        let c = globalKState.getOrInsertController(ctr);
        c.mountCondition = c.mountCondition && condition;
    };
}
exports.MountCondition = MountCondition;
/**
 *  Only mounts this controller if NODE_ENV is set to "development"
 */
function Dev() {
    return (ctr) => {
        let c = globalKState.getOrInsertController(ctr);
        c.mountCondition = c.mountCondition && process.env.NODE_ENV === "development";
    };
}
exports.Dev = Dev;
//# sourceMappingURL=controller.js.map