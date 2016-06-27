"use strict";
const C = require("./controller");
const T = require("./testing");
/**
 * Contains context for the current call .
 */
class Context {
}
exports.Context = Context;
/**
 * Entry point
 */
function addControllersToExpressApp(app) {
    C.addControllersToExpressApp(app);
}
exports.addControllersToExpressApp = addControllersToExpressApp;
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
        let c = C.globalKCState.getOrInsertController(ctr);
        c.explicitlyDeclared = true;
        if (mountpoint != undefined) {
            if (typeof (mountpoint) === "string") {
                c.path = mountpoint;
            }
            else {
                C.globalKCState.registerMountPoint(mountpoint, ctr);
                c.path = (typeof (path) === "string") ? path : ctr.name;
            }
        }
        else {
            c.path = ctr.name;
        }
        c.path = UrlJoin("/", c.path);
    };
}
exports.Controller = Controller;
/**
 * Adds express middleware to run before mounting the controller
 * @param { Express.RequestHandler[] } middleware - Array of middleware to add.
 */
function MountMiddleware(...middleware) {
    return (ctr) => {
        if (middleware != undefined) {
            let c = C.globalKCState.getOrInsertController(ctr);
            c.middleware = middleware.concat(c.middleware);
        }
    };
}
exports.MountMiddleware = MountMiddleware;
/**
 * @param { boolean } condition - Only mounts this controller if condition is true.
 */
function MountCondition(condition) {
    return (ctr) => {
        let c = C.globalKCState.getOrInsertController(ctr);
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
 * Generate test runner paths inside this controller
 */
function TestRunner() {
    return (ctr) => {
        C.globalKCState.getOrInsertController(ctr).generateTestRunnerPaths = true;
    };
}
exports.TestRunner = TestRunner;
/**
 *  Attach a documentation string to the controller
 *  @param {string} docStr - The documentation string.
 */
function DocController(docStr) {
    return (ctr) => {
        C.globalKCState.getOrInsertController(ctr).docString = docStr;
    };
}
exports.DocController = DocController;
/**
 *  Registers a fixture of tests with the global test runner.
 *  @param {string} humanReadableName - The human readable name for the fixture
 */
function Fixture(humanReadableName) {
    return (ctr) => {
        let fixture = T.globalKTState.getOrInsertFixture(ctr);
        fixture.humanReadableName = typeof (humanReadableName) === "string" ? humanReadableName : ctr.name;
        fixture.explicitlyDeclared = true;
    };
}
exports.Fixture = Fixture;
/*********************************************************
 * Method Decorators
 *********************************************************/
function Method(method, path) {
    return function (target, propertyKey, descriptor) {
        path = (path != undefined) ? path : propertyKey;
        let m = C.globalKCState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
        m.methodMountpoints.push({ "path": UrlJoin("/", path), "httpMethod": method });
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
function Middleware(...middleware) {
    return function (target, propertyKey, descriptor) {
        if (middleware != undefined) {
            let m = C.globalKCState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
            m.middleware = middleware.concat(m.middleware);
        }
    };
}
exports.Middleware = Middleware;
/**
 * Flags the method as "Express Compatible" and thus will be called with parameters (req,res,next)
 */
function ExpressCompatible() {
    return function (target, propertyKey, descriptor) {
        let m = C.globalKCState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
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
        let m = C.globalKCState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
        m.docString = docStr;
    };
}
exports.DocAction = DocAction;
/**
 *  Register a new test. If the test throws it fails, otherwise it passes.
 *  @param {string} humanReadableName - The human readable name for this test.
 */
function Test(humanReadableName) {
    return function (target, propertyKey, descriptor) {
        let f = T.globalKTState.getOrInsertFixture(target.constructor);
        let t = f.getOrInsertTest(propertyKey);
        t.humanReadableName = humanReadableName;
        t.explicitlyDeclared = true;
    };
}
exports.Test = Test;
/**
 *  Method to run before any of the tests.
 */
function Before() {
    return function (target, propertyKey, descriptor) {
        T.globalKTState.getOrInsertFixture(target.constructor).runBeforeMethods.push(propertyKey);
    };
}
exports.Before = Before;
/**
 *  Method to run after any of the tests.
 */
function After() {
    return function (target, propertyKey, descriptor) {
        T.globalKTState.getOrInsertFixture(target.constructor).runAfterMethods.push(propertyKey);
    };
}
exports.After = After;
function MapParameterToRequestValue(rvc, valueKey) {
    return function (target, propertyKey, parameterIndex) {
        let m = C.globalKCState.getOrInsertController(target.constructor).getOrInsertMethod(propertyKey);
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
    for (let ck in C.globalKCState.controllers) {
        console.log("============================================");
        console.log(`Controller on path ${C.globalKCState.controllers[ck].path} built from Class ${C.globalKCState.controllers[ck].ctr.name}`);
        console.log("With Methods:");
        for (let mk in C.globalKCState.controllers[ck].methods) {
            let m = C.globalKCState.controllers[ck].methods[mk];
            console.log(`== ${mk} ==`);
            console.log(m);
            console.log("");
        }
    }
}
exports.DumpInternals = DumpInternals;
function UrlJoin(...parts) {
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
exports.UrlJoin = UrlJoin;
//# sourceMappingURL=kwyjibo.js.map