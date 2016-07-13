"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const Express = require("express");
const U = require("./utils");
const T = require("./testing");
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
class KwyjiboControllerTreeNode {
    constructor(controller) {
        this.childs = [];
        this.controller = controller;
        this.fullPath = controller.path;
    }
}
exports.KwyjiboControllerTreeNode = KwyjiboControllerTreeNode;
class KwyjiboControllersState {
    constructor() {
        this.controllers = {};
        this.mountpoints = [];
        this.controllersTree = [];
    }
    getController(ctr) {
        return this.controllers[ctr.toString()];
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
function addChildsToTreeNode(node) {
    for (let mp of exports.globalKCState.mountpoints) {
        if (node.controller.ctr.toString() === mp.dstCtr.toString()) {
            let child = new KwyjiboControllerTreeNode(exports.globalKCState.getController(mp.ctr));
            addChildsToTreeNode(child);
            node.childs.push(child);
        }
    }
}
function buildControllersTree() {
    for (let ck in exports.globalKCState.controllers) {
        let c = exports.globalKCState.controllers[ck];
        if (c.childController === false) {
            let node = new KwyjiboControllerTreeNode(c);
            addChildsToTreeNode(node);
            exports.globalKCState.controllersTree.push(node);
        }
    }
}
function indexAutogenerator(controller, childs) {
    return (req, res) => {
        let content = "<html><head></head><body><pre> Autogenerated Index (Only in dev env) <br /><br />";
        for (let child of childs) {
            content += `[Controller] <a href=".${child.controller.path}/">${child.controller.path}</a><br />`;
        }
        content += "<br />";
        if (controller != undefined) {
            for (let mk in controller.methods) {
                for (let mmp of controller.methods[mk].methodMountpoints) {
                    content += `[${mmp.httpMethod.toUpperCase()}] <a href=".${mmp.path}/">${mmp.path}</a><br />`;
                }
            }
        }
        content += "</pre></body></html>";
        res.send(content);
    };
}
function mountMethod(controller, instance, methodKey) {
    let method = controller.methods[methodKey];
    if (method.explicitlyDeclared === false) {
        U.defaultWarn(`Method ${methodKey} was not explicitaly declared with a decorator. Defaulting to GET@/${methodKey}`);
        method.methodMountpoints.push({ "path": `/${methodKey}`, "httpMethod": "get" });
    }
    for (let mp of method.methodMountpoints) {
        let callback = (req, res, next) => {
            let context = new Context();
            let runner = () => __awaiter(this, void 0, void 0, function* () {
                let ret;
                if (method.expressCompatible) {
                    ret = instance[methodKey](req, res, next);
                }
                else {
                    context.request = req;
                    context.response = res;
                    context.nextMiddleware = next;
                    ret = instance[methodKey](context);
                }
                if (ret instanceof Promise) {
                    ret = yield ret;
                }
                if (ret instanceof Object) {
                    res.json(ret);
                }
                else if (typeof (ret) === "string") {
                    res.send(ret);
                }
            });
            runner().then(() => { context.dispose(); })
                .catch((err) => { context.dispose(); next(err); });
        };
        controller.router[mp.httpMethod](U.UrlJoin(mp.path, "/"), ...method.middleware, callback);
    }
}
function useRouterAtPathStrict(baseRouter, basePath, router) {
    if (basePath.substring(basePath.length - 1) === "/") {
        basePath = basePath.trim().substr(0, basePath.length - 1);
    }
    let strictPath = U.UrlJoin(basePath, "/");
    if (strictPath !== "/") {
        baseRouter.use(strictPath, (req, res, next) => {
            if (req.originalUrl.substring(req.originalUrl.length - basePath.length) === basePath) {
                res.redirect(strictPath);
            }
            else {
                next();
            }
        }, router);
    }
    else {
        baseRouter.use(strictPath, router);
    }
}
function createRouterRecursive(app, controllerNode) {
    let controller = controllerNode.controller;
    controllerNode.fullPath = controller.path;
    if (controller.mountCondition === false) {
        return undefined;
    }
    if (controller.explicitlyDeclared === false) {
        U.defaultWarn(`Controller ${controller.ctr.name} was not explicitaly declared with a @Controller decorator.`);
    }
    let instance = Reflect.construct(controller.ctr, []);
    controller.router = Express.Router();
    for (let middleware of controller.middleware) {
        controller.router.use(middleware);
    }
    for (let mk in controller.methods) {
        mountMethod(controller, instance, mk);
    }
    for (let child of controllerNode.childs) {
        let nc = createRouterRecursive(app, child);
        if (nc != undefined) {
            useRouterAtPathStrict(controller.router, nc.path, nc.router);
            child.fullPath = U.UrlJoin(controllerNode.fullPath, "/", child.fullPath);
        }
    }
    if (controller.generateTestRunnerPaths) {
        T.injectTestRunnerMiddleware(controller);
    }
    if (process.env.NODE_ENV === "development") {
        controller.router.get("/", indexAutogenerator(controller, controllerNode.childs));
    }
    return controller;
}
function addControllersToExpressApp(app, rootPath) {
    rootPath = rootPath || "/";
    buildControllersTree();
    for (let node of exports.globalKCState.controllersTree) {
        let nc = createRouterRecursive(app, node);
        if (nc != undefined) {
            useRouterAtPathStrict(app, U.UrlJoin(rootPath, nc.path), nc.router);
        }
    }
    if (process.env.NODE_ENV === "development") {
        app.get(rootPath, indexAutogenerator(undefined, exports.globalKCState.controllersTree));
    }
}
exports.addControllersToExpressApp = addControllersToExpressApp;
//# sourceMappingURL=controller.js.map