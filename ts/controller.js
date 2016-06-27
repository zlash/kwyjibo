"use strict";
const U = require("./utils");
/**
 * Contains context for the current call .
 */
class Context {
    constructor() {
        this.disposableInstances = [];
    }
    create(tFactory, ...args) {
        let instance = new tFactory(...args);
        this.disposableInstances.push(instance);
        return instance;
    }
    dispose() {
        for (let instance of this.disposableInstances) {
            instance.dispose();
        }
    }
}
exports.Context = Context;
/*********************************************************
 * Class Decorators
 *********************************************************/
/**
 * Registers a new controller.
 * @param { string | Controller } [mountpoint] - An string indicating a path, or a Controller to mount over. If not present, the name of the class will be used as path.
 * @param { string } [path] - Used if mountpoint is a Controller. If not present, the name of the class will be used as path.
 */
function Controller(mountpoint, path) {
    return (ctr) => {
        let c = exports.globalKCState.getOrInsertController(ctr);
        c.explicitlyDeclared = true;
        if (mountpoint != undefined) {
            if (typeof (mountpoint) === "string") {
                c.path = mountpoint;
            }
            else {
                exports.globalKCState.registerMountPoint(mountpoint, ctr);
                c.path = (typeof (path) === "string") ? path : ctr.name;
            }
        }
        else {
            c.path = ctr.name;
        }
        c.path = U.UrlJoin("/", c.path);
    };
}
exports.Controller = Controller;
/**
 * Adds express middleware to run before mounting the controller
 * @param { Express.RequestHandler[] } middleware - Array of middleware to add.
 */
function Middleware(...middleware) {
    return (ctr) => {
        if (middleware != undefined) {
            let c = exports.globalKCState.getOrInsertController(ctr);
            c.middleware = middleware.concat(c.middleware);
        }
    };
}
exports.Middleware = Middleware;
/**
 * @param { boolean } condition - Only mounts this controller if condition is true.
 */
function MountCondition(condition) {
    return (ctr) => {
        let c = exports.globalKCState.getOrInsertController(ctr);
        c.mountCondition = c.mountCondition && condition;
    };
}
exports.MountCondition = MountCondition;
/**
 *  Only mounts this controller if NODE_ENV is set to "development"
 */
function Dev() {
    return MountCondition(process.env.NODE_ENV === "development");
}
exports.Dev = Dev;
/**
 *  Attach a documentation string to the controller
 *  @param {string} docStr - The documentation string.
 */
function DocController(docStr) {
    return (ctr) => {
        exports.globalKCState.getOrInsertController(ctr).docString = docStr;
    };
}
exports.DocController = DocController;
/**
 * Generate test runner paths inside this controller
 */
function TestRunner() {
    return (ctr) => {
        exports.globalKCState.getOrInsertController(ctr).generateTestRunnerPaths = true;
    };
}
exports.TestRunner = TestRunner;
/*********************************************************
 * Method Decorators
 *********************************************************/
function Method(method, path) {
    return function (target, propertyKey, descriptor) {
        path = (path != undefined) ? path : propertyKey;
        let m = exports.globalKCState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
        m.methodMountpoints.push({ "path": U.UrlJoin("/", path), "httpMethod": method });
        m.explicitlyDeclared = true;
    };
}
exports.Method = Method;
function Get(path) {
    return Method("get", path);
}
exports.Get = Get;
function Post(path) {
    return Method("post", path);
}
exports.Post = Post;
/**
 * Adds express middleware to run before the method
 * @param { Express.RequestHandler[] } middleware - Array of middleware to add.
 */
function ActionMiddleware(...middleware) {
    return function (target, propertyKey, descriptor) {
        if (middleware != undefined) {
            let m = exports.globalKCState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
            m.middleware = middleware.concat(m.middleware);
        }
    };
}
exports.ActionMiddleware = ActionMiddleware;
/**
 * Flags the method as "Express Compatible" and thus will be called with parameters (req,res,next)
 */
function ExpressCompatible() {
    return function (target, propertyKey, descriptor) {
        let m = exports.globalKCState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
        m.expressCompatible = true;
    };
}
exports.ExpressCompatible = ExpressCompatible;
/**
 *  Attach a documentation string to the method
 *  @param {string} docStr - The documentation string.
 */
function DocAction(docStr) {
    return function (target, propertyKey, descriptor) {
        let m = exports.globalKCState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
        m.docString = docStr;
    };
}
exports.DocAction = DocAction;
function MapParameterToRequestValue(rvc, valueKey) {
    return function (target, propertyKey, parameterIndex) {
        let m = exports.globalKCState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
        m.extraParametersMappings[parameterIndex] = { "rvc": rvc, "valueKey": valueKey };
    };
}
exports.MapParameterToRequestValue = MapParameterToRequestValue;
function FromBody(valueKey) {
    return MapParameterToRequestValue("body", valueKey);
}
exports.FromBody = FromBody;
function FromQuery(valueKey) {
    return MapParameterToRequestValue("query", valueKey);
}
exports.FromQuery = FromQuery;
function FromPath(valueKey) {
    return MapParameterToRequestValue("path", valueKey);
}
exports.FromPath = FromPath;
function FromHeader(valueKey) {
    return MapParameterToRequestValue("header", valueKey);
}
exports.FromHeader = FromHeader;
function FromCookie(valueKey) {
    return MapParameterToRequestValue("cookie", valueKey);
}
exports.FromCookie = FromCookie;
/*********************************************************
 * Utils
 *********************************************************/
function DumpInternals() {
    for (let ck in exports.globalKCState.controllers) {
        console.log("============================================");
        console.log(`Controller on path ${exports.globalKCState.controllers[ck].path} built from Class ${exports.globalKCState.controllers[ck].ctr.name}`);
        console.log("With Methods:");
        for (let mk in exports.globalKCState.controllers[ck].methods) {
            let m = exports.globalKCState.controllers[ck].methods[mk];
            console.log(`== ${mk} ==`);
            console.log(m);
            console.log("");
        }
    }
}
exports.DumpInternals = DumpInternals;
class KwyjiboMethod {
    constructor() {
        this.methodMountpoints = [];
        this.middleware = [];
        this.extraParametersMappings = [];
        this.expressCompatible = false;
        this.docString = "";
        this.explicitlyDeclared = false;
    }
}
exports.KwyjiboMethod = KwyjiboMethod;
class KwyjiboController {
    constructor() {
        this.middleware = [];
        this.methods = {};
        this.docString = "";
        this.generateTestRunnerPaths = false;
        this.childController = false;
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
    getOrInsertMethod(key) {
        if (this.methods[key] == undefined) {
            this.methods[key] = new KwyjiboMethod();
        }
        return this.methods[key];
    }
}
exports.KwyjiboController = KwyjiboController;
class KwyjiboControllersState {
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
        this.getOrInsertController(ctr).childController = true;
        this.mountpoints.push({ "dstCtr": dstCtr, "ctr": ctr });
    }
}
exports.KwyjiboControllersState = KwyjiboControllersState;
exports.globalKCState = new KwyjiboControllersState();
function addControllersToExpressApp(app) {
    console.log("Adding controllers to Express App");
    //A method without paths, defaults to get with the name of the method as path
    for (let ck in exports.globalKCState.controllers) {
        let c = exports.globalKCState.controllers[ck];
        if (c.childController === false) {
            console.log(c.ctr.name);
        }
    }
}
exports.addControllersToExpressApp = addControllersToExpressApp;
//# sourceMappingURL=controller.js.map