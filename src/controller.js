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
         * Set to false to avoid mounting this controller.
         */
        this.mount = true;
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
//# sourceMappingURL=controller.js.map