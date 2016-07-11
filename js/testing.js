"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const Crypto = require("crypto");
const U = require("./utils");
/*********************************************************
 * Class Decorators
 *********************************************************/
/**
 *  Registers a fixture of tests with the global test runner.
 *  @param {string} humanReadableName - The human readable name for the fixture
 */
function Fixture(humanReadableName) {
    return (ctr) => {
        let fixture = exports.globalKTState.getOrInsertFixture(ctr);
        fixture.humanReadableName = typeof (humanReadableName) === "string" ? humanReadableName : ctr.name;
        fixture.explicitlyDeclared = true;
    };
}
exports.Fixture = Fixture;
/*********************************************************
 * Method Decorators
 *********************************************************/
/**
 *  Register a new test. If the test throws it fails, otherwise it passes.
 *  @param {string} humanReadableName - The human readable name for this test.
 */
function Test(humanReadableName) {
    return function (target, propertyKey, descriptor) {
        let f = exports.globalKTState.getOrInsertFixture(target.constructor);
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
        exports.globalKTState.getOrInsertFixture(target.constructor).runBeforeMethods.push(propertyKey);
    };
}
exports.Before = Before;
/**
 *  Method to run after any of the tests.
 */
function After() {
    return function (target, propertyKey, descriptor) {
        exports.globalKTState.getOrInsertFixture(target.constructor).runAfterMethods.push(propertyKey);
    };
}
exports.After = After;
/*********************************************************
 * Tests
 *********************************************************/
class KwyjiboTest {
    constructor() {
        this.explicitlyDeclared = false;
    }
}
exports.KwyjiboTest = KwyjiboTest;
class KwyjiboFixture {
    constructor() {
        this.runBeforeMethods = [];
        this.runAfterMethods = [];
        this.tests = {};
        this.explicitlyDeclared = false;
    }
    getOrInsertTest(key) {
        if (this.tests[key] == undefined) {
            this.tests[key] = new KwyjiboTest();
        }
        return this.tests[key];
    }
}
exports.KwyjiboFixture = KwyjiboFixture;
class KwyjiboTestResult {
}
exports.KwyjiboTestResult = KwyjiboTestResult;
class KwyjiboTestsState {
    constructor() {
        this.fixtures = {};
    }
    getOrInsertFixture(ctr) {
        let key = ctr.toString();
        if (this.fixtures[key] == undefined) {
            this.fixtures[key] = new KwyjiboFixture();
            this.fixtures[key].ctr = ctr;
        }
        return this.fixtures[key];
    }
    generateCompleteFixtureMetadata() {
        let metadata = {};
        for (let fxk in this.fixtures) {
            let fixture = this.fixtures[fxk];
            let fxkHash = KwyjiboTestsState.getFixtureHashId(fixture);
            metadata[fxkHash] = {};
            for (let tk in fixture.tests) {
                metadata[fxkHash][tk] = true;
            }
        }
        return metadata;
    }
    static getFixtureHashId(fixture) {
        let hasher = Crypto.createHash("sha256");
        hasher.update(fixture.ctr.toString());
        return fixture.ctr.name + "_" + hasher.digest("hex").substr(0, 8);
    }
    generateRainbowTables() {
        let rt = {};
        for (let fxk in this.fixtures) {
            let fixture = this.fixtures[fxk];
            let fxkHash = KwyjiboTestsState.getFixtureHashId(fixture);
            rt[fxkHash] = fixture;
        }
        return rt;
    }
    run(testsToRun) {
        return __awaiter(this, void 0, Promise, function* () {
            if (testsToRun == undefined) {
                testsToRun = this.generateCompleteFixtureMetadata();
            }
            let testResults = [];
            let rainbowTables = this.generateRainbowTables();
            for (let fxk in testsToRun) {
                let fixture = rainbowTables[fxk];
                let fi = Reflect.construct(fixture.ctr, []);
                for (let mn of fixture.runBeforeMethods) {
                    let r = fi[mn]();
                    if (r instanceof Promise) {
                        yield r;
                    }
                }
                for (let mn in testsToRun[fxk]) {
                    if (testsToRun[fxk][mn] === true && fixture.tests[mn] != undefined && fi[mn] != undefined) {
                        let result = new KwyjiboTestResult();
                        result.fixtureKey = fxk;
                        result.fixtureDesc = fixture.humanReadableName;
                        result.testKey = mn;
                        result.testDesc = fixture.tests[mn].humanReadableName;
                        try {
                            let r = fi[mn]();
                            if (r instanceof Promise) {
                                yield r;
                            }
                            result.passed = true;
                            result.message = "";
                        }
                        catch (err) {
                            result.passed = false;
                            if (err instanceof Error) {
                                result.message = JSON.stringify({ name: err.name, message: err.message, stack: err.stack });
                            }
                            else if (err instanceof Object) {
                                result.message = JSON.stringify(err);
                            }
                            else if (typeof (err) === "string") {
                                result.message = err;
                            }
                            else {
                                result.message = err.toString();
                            }
                        }
                        testResults.push(result);
                    }
                }
                for (let mn of fixture.runAfterMethods) {
                    let r = fi[mn]();
                    if (r instanceof Promise) {
                        yield r;
                    }
                }
            }
            return testResults;
        });
    }
}
exports.KwyjiboTestsState = KwyjiboTestsState;
exports.globalKTState = new KwyjiboTestsState();
const defaultCSS = `
    body {
        font-family:verdana;
    }

    tr {
        padding:5px;
    }

    tr a {
        color:#000000;
    }

    tr.header {
        background-color:#AAAAAA;
    }

    tr.header-allpassed {
       background-color:#00AA00; 
    }

    tr.header-somefailed {
       background-color:#AA0000; 
    }
    tr.header-somefailed a{
       color:#FFFFFF;
    }

    button#runButton {
        width:100%;
        font-size:18px;
        font-weight:bold;
    }

    .flex-container {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-content: stretch;
        align-items: center;
    }

    .flex-item {
        order: 0;
        flex: 0 1 auto;
        align-self: auto;
    }
`;
function generateInteractiveTestRunnerMiddleware(useFixture) {
    return (req, res) => {
        let content = `
        <html>
        <head>
        <style>
            ${defaultCSS}
        </style>
        </head>
        <body class="flex-container">
        <script>

            function init() {
                var runners = Array.from(document.querySelectorAll('input.runner'));
                runners.forEach(function(runner){
                    runner.onchange = function(e) {
                        var childs = Array.from(document.querySelectorAll('input.' + e.target.id));
                        childs.forEach(function(child){
                            child.checked = e.target.checked;
                        });
                    };
                });
                
                document.getElementById('runButton').onclick=submit;
            }
            
            function submit() {
                var runners = Array.from(document.querySelectorAll('input.runner'));
                var toSubmit = {};
                runners.forEach(function(runner){
                    document.getElementById(runner.id+"-header").className="header";
                    var childs = Array.from(document.querySelectorAll('input.' + runner.id));
                    childs.forEach(function(child){
                        var curTD = document.getElementById(runner.id+"_"+child.id+"_result");
                        if(child.checked) {
                            if(toSubmit[runner.id]==undefined) toSubmit[runner.id]={};
                            toSubmit[runner.id][child.id]=true;
                            curTD.innerHTML="&#x1f552;";
                            curTD.title="Loading...";
                        } else {
                            curTD.innerHTML="";
                            curTD.title="";
                        }

                    }); 
                });

                var xhr = new XMLHttpRequest();
                xhr.open("POST", "${useFixture == undefined ? "" : "../../"}some", true);
                xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

                // send the collected data as JSON
                xhr.send(JSON.stringify(toSubmit));

                xhr.onloadend = function () {
                    var results = JSON.parse(this.responseText);
                    var fixturePass = {};
                    results.forEach(function(result){
                        if(fixturePass[result.fixtureKey]==undefined) {
                            fixturePass[result.fixtureKey]=true;
                        }
                        var rTD = document.getElementById(result.fixtureKey+"_"+result.testKey+"_result");
                        rTD.innerHTML = result.passed ? '&#x2705;' : '&#x274c;';
                        if(!result.passed) {
                            fixturePass[result.fixtureKey]=false;
                        }
                        rTD.title = result.message;
                    });

                    for(var fxk in fixturePass) {
                        var fh = document.getElementById(fxk+"-header");
                        fh.className = fixturePass[fxk]? "header-allpassed" : "header-somefailed";
                    }

                };
            }

            window.onload=init;
        </script>
        <div class="flex-item">
        <center>
        <h2> Interactive Tests Runner </h2>
        `;
        let useFixtureHash = undefined;
        if (useFixture == undefined) {
            content += `
                    To run all the tests programatically use: <a href="all">/all</a><br />
                    To run some of the tests programatically send a JSON payload via POST to: <a href="some">/some</a><br />
                    (You can see how the JSON payload should look at <a href="metadata">/metadata</a>)<br /><br /> 
                    `;
        }
        else {
            content += `
                    To run all the tests programatically use: <a href="all">/all</a><br />
                    To run some of the tests programatically, see <a href="../../">tests home</a><br /><br /> 
                    `;
            useFixtureHash = KwyjiboTestsState.getFixtureHashId(useFixture);
        }
        content += `<table>`;
        for (let fxk in exports.globalKTState.fixtures) {
            let fixture = exports.globalKTState.fixtures[fxk];
            let fxkHash = KwyjiboTestsState.getFixtureHashId(fixture);
            if (useFixtureHash != undefined && fxkHash !== useFixtureHash) {
                continue;
            }
            content += `<tr class="header" id="${fxkHash}-header" >
                       <td><input class="runner" id="${fxkHash}" type="checkbox" checked /></td>
                       <td colspan="2"><a href="fixture/${fxkHash}/">${fixture.humanReadableName}</a></td></tr>`;
            for (let tk in fixture.tests) {
                let test = fixture.tests[tk];
                content += `<tr><td><input class="${fxkHash}" id="${tk}" type="checkbox" checked /></td>
                                <td text-align="left">${test.humanReadableName}</td><td id="${fxkHash}_${tk}_result"></td></tr>`;
            }
        }
        content += `<tr><td colspan="3"></td></tr><tr><td colspan="3"><button id="runButton">Run Tests</button></td></tr>`;
        content += "</table>";
        content += "</center></div></body></html>";
        res.send(content);
    };
}
function runSetOfTestsAndFillResponse(testsToRun, res) {
    return __awaiter(this, void 0, Promise, function* () {
        let results = yield exports.globalKTState.run(testsToRun);
        let failed = false;
        for (let result of results) {
            if (result.passed === false) {
                failed = true;
            }
        }
        res.statusCode = failed ? 418 : 200;
        res.json(results);
    });
}
function injectTestRunnerMiddleware(controller) {
    /*
        Available endpoints:
            - /: interactive shell
            
            - /all: run all tests unattended
            - /metadata: get json metadata for available tests.
            - /some: post a json to run only a subset of tests.

            - /fixture/[FixtureName]: link to all tests in fixture (interactive shell)
            - /fixture/[FixtureName]/all
    */
    controller.router.get("/all", (req, res) => __awaiter(this, void 0, void 0, function* () {
        yield runSetOfTestsAndFillResponse(undefined, res);
    }));
    controller.router.post("/some", (req, res) => __awaiter(this, void 0, void 0, function* () {
        yield runSetOfTestsAndFillResponse(req.body, res);
    }));
    controller.router.get("/metadata", (req, res) => {
        res.json(exports.globalKTState.generateCompleteFixtureMetadata());
    });
    for (let fxk in exports.globalKTState.fixtures) {
        let fixture = exports.globalKTState.fixtures[fxk];
        let fxkHash = KwyjiboTestsState.getFixtureHashId(fixture);
        controller.router.get(U.UrlJoin("/fixture/", fxkHash, "/"), generateInteractiveTestRunnerMiddleware(fixture));
        controller.router.get(U.UrlJoin("/fixture/", fxkHash, "/all"), (req, res) => __awaiter(this, void 0, void 0, function* () {
            let metadata = exports.globalKTState.generateCompleteFixtureMetadata();
            let thisFixtureSet = {};
            for (let mk in metadata) {
                if (mk === fxkHash) {
                    thisFixtureSet[mk] = metadata[mk];
                }
            }
            yield runSetOfTestsAndFillResponse(thisFixtureSet, res);
        }));
    }
    controller.router.get("/", generateInteractiveTestRunnerMiddleware());
}
exports.injectTestRunnerMiddleware = injectTestRunnerMiddleware;
//# sourceMappingURL=testing.js.map