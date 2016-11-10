/*********************************************************************************

MIT License

Copyright (c) 2016 - Miguel Ángel Pérez Martínez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*********************************************************************************/
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
const FS = require("fs");
const Path = require("path");
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
class HttpError {
    constructor(code, messageOrError) {
        this.code = code;
        if (messageOrError != undefined) {
            if (messageOrError instanceof Error) {
                this.message = messageOrError.message;
            }
            else {
                this.message = messageOrError.toString();
            }
        }
        else {
            this.message = "";
        }
    }
}
exports.HttpError = HttpError;
class BadRequest extends HttpError {
    constructor(messageOrError) {
        super(400, messageOrError);
    }
}
exports.BadRequest = BadRequest;
class Unauthorized extends HttpError {
    constructor(messageOrError) {
        super(401, messageOrError);
    }
}
exports.Unauthorized = Unauthorized;
class NotFound extends HttpError {
    constructor(messageOrError) {
        super(404, messageOrError);
    }
}
exports.NotFound = NotFound;
class InternalServerError extends HttpError {
    constructor(messageOrError) {
        super(500, messageOrError);
    }
}
exports.InternalServerError = InternalServerError;
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
        method = method.toLowerCase();
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
function Put(path) {
    return Method("put", path);
}
exports.Put = Put;
function Patch(path) {
    return Method("patch", path);
}
exports.Patch = Patch;
function Delete(path) {
    return Method("delete", path);
}
exports.Delete = Delete;
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
/**
 *  Attach a OpenApi Response to the method
 *  @param {number|string} httpCode - The http code used for the response
 *  @param {string} description - Response description
 *  @param {string} type - The Open Api defined type.
 */
function OpenApiResponse(httpCode, description, type) {
    return function (target, propertyKey, descriptor) {
        let m = exports.globalKCState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
        httpCode = httpCode.toString();
        m.openApiResponses[httpCode] = { description: description, type: type };
    };
}
exports.OpenApiResponse = OpenApiResponse;
function MapParameterToRequestValue(rvc, valueKey, openApiType) {
    return function (target, propertyKey, parameterIndex) {
        let m = exports.globalKCState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
        m.extraParametersMappings[parameterIndex] = { "rvc": rvc, "valueKey": valueKey, "openApiType": openApiType };
    };
}
exports.MapParameterToRequestValue = MapParameterToRequestValue;
function FromBody(openApiType, valueKey) {
    return MapParameterToRequestValue("body", valueKey, openApiType);
}
exports.FromBody = FromBody;
function FromQuery(valueKey, openApiType) {
    return MapParameterToRequestValue("query", valueKey, openApiType);
}
exports.FromQuery = FromQuery;
function FromPath(valueKey, openApiType) {
    return MapParameterToRequestValue("path", valueKey, openApiType);
}
exports.FromPath = FromPath;
function FromHeader(valueKey, openApiType) {
    return MapParameterToRequestValue("header", valueKey, openApiType);
}
exports.FromHeader = FromHeader;
function FromCookie(valueKey, openApiType) {
    return MapParameterToRequestValue("cookie", valueKey, openApiType);
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
class KwyjiboMethodOpenApiResponses {
}
exports.KwyjiboMethodOpenApiResponses = KwyjiboMethodOpenApiResponses;
class KwyjiboMethod {
    constructor() {
        this.methodMountpoints = [];
        this.middleware = [];
        this.extraParametersMappings = [];
        this.expressCompatible = false;
        this.docString = "";
        this.openApiResponses = {};
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
        this.node = undefined;
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
    node.controller.node = node;
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
        U.defaultWarnLogger(`Method ${methodKey} was not explicitaly declared with a decorator. Defaulting to GET@/${methodKey}`);
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
                    let params = [context];
                    if (method.extraParametersMappings[0] != undefined) {
                        throw new Error("Cannot map first parameter, it always will contain Context!");
                    }
                    for (let i = 1; i < method.extraParametersMappings.length; i++) {
                        let mp = method.extraParametersMappings[i];
                        if (mp == undefined) {
                            params.push(undefined);
                        }
                        else {
                            switch (mp.rvc) {
                                case "body":
                                    if (mp.valueKey == undefined || mp.valueKey === "") {
                                        params.push(req.body);
                                    }
                                    else {
                                        params.push(req.body[mp.valueKey]);
                                    }
                                    break;
                                case "query":
                                    params.push(req.query[mp.valueKey]);
                                    break;
                                case "path":
                                    params.push(req.params[mp.valueKey]);
                                    break;
                                case "header":
                                    params.push(req.headers[mp.valueKey]);
                                    break;
                                case "cookie":
                                    params.push(req.cookies[mp.valueKey]);
                                    break;
                            }
                        }
                    }
                    ret = instance[methodKey](...params);
                }
                if (ret instanceof Promise) {
                    ret = yield ret;
                }
                if (ret instanceof Object) {
                    if (ret["$render_view"] != undefined) {
                        res.render(ret["$render_view"], ret);
                    }
                    else {
                        res.json(ret);
                    }
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
        U.defaultWarnLogger(`Controller ${controller.ctr.name} was not explicitaly declared with a @Controller decorator.`);
    }
    let instance = Reflect.construct(controller.ctr, []);
    controller.router = Express.Router({ mergeParams: true });
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
function handleRequestErrorMiddlewares(err, req, res, next) {
    for (let i = 0; i < U.errorHandlers.length - 1; i++) {
        U.errorHandlers[i](err, req, res, U.errorHandlers[i + 1]);
    }
    if (U.errorHandlers.length > 0) {
        U.errorHandlers[U.errorHandlers.length - 1](err, req, res, onRequestError);
    }
    else {
        onRequestError(err, req, res, next);
    }
}
function onRequestError(err, req, res, next) {
    if (err.name === "UnauthorizedError") {
        res.sendStatus(401);
    }
    else {
        if (process.env.NODE_ENV === "development") {
            res.statusCode = 500;
            if (err instanceof HttpError) {
                U.defaultErrorLogger(err);
                res.status(err.code).send(err.message);
            }
            else if (err instanceof Error) {
                U.defaultErrorLogger({ name: err.name, message: err.message, stack: err.stack });
                res.json({ name: err.name, message: err.message });
            }
            else {
                U.defaultErrorLogger(err);
                res.json(err);
            }
        }
        else {
            res.sendStatus(500);
        }
    }
}
function onRequestNotFound(req, res, next) {
    res.sendStatus(404);
}
exports.initialized = false;
function initialize(app, ...requiredDirectories) {
    initializeAtRoute(Path.sep, app, ...requiredDirectories);
}
exports.initialize = initialize;
function initializeAtRoute(rootPath, app, ...requiredDirectories) {
    let implicitTests = false;
    let implicitControllers = false;
    if (!requiredDirectories.find((p) => { return p === "tests"; })) {
        requiredDirectories.push("tests");
        implicitTests = true;
    }
    if (!requiredDirectories.find((p) => { return p === "controllers"; })) {
        requiredDirectories.push("controllers");
        implicitControllers = true;
    }
    for (let requiredDirectory of requiredDirectories) {
        let path = "";
        if (requiredDirectory.charAt(0) == Path.sep) {
            path = requiredDirectory;
        }
        else {
            path = Path.join(process.cwd(), requiredDirectory);
        }
        try {
            U.defaultInfoLogger("Loading components from: " + path);
            FS.accessSync(path);
        }
        catch (err) {
            if ((requiredDirectory !== "controllers" || !implicitControllers) &&
                (requiredDirectory !== "tests" || !implicitTests)) {
                U.defaultWarnLogger("Cannot access path: " + path);
            }
            continue;
        }
        require("require-all")(path);
    }
    rootPath = rootPath || "/";
    buildControllersTree();
    for (let node of exports.globalKCState.controllersTree) {
        let nc = createRouterRecursive(app, node);
        if (nc != undefined) {
            useRouterAtPathStrict(app, U.UrlJoin(rootPath, nc.path), nc.router);
            node.fullPath = U.UrlJoin(rootPath, "/", node.fullPath);
        }
    }
    if (process.env.NODE_ENV === "development") {
        app.get(rootPath, indexAutogenerator(undefined, exports.globalKCState.controllersTree));
    }
    app.use(handleRequestErrorMiddlewares);
    app.use(onRequestNotFound);
    exports.initialized = true;
}
exports.initializeAtRoute = initializeAtRoute;
function getActionRoute(controller, methodName, httpMethod) {
    let kc = exports.globalKCState.getOrInsertController(controller);
    if (kc.methods[methodName] != undefined) {
        let method = kc.methods[methodName];
        if (httpMethod == undefined && method.methodMountpoints.length > 0) {
            return U.UrlJoin(kc.node.fullPath, "/", method.methodMountpoints[0].path);
        }
        for (let mp of method.methodMountpoints) {
            if (mp.httpMethod.toLowerCase() === httpMethod.toLowerCase()) {
                return U.UrlJoin(kc.node.fullPath, "/", mp.path);
            }
        }
    }
    return "";
}
exports.getActionRoute = getActionRoute;
//# sourceMappingURL=controller.js.map