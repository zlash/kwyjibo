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

import * as Express from "express";
import * as C from "./controller";
import * as Crypto from "crypto";
import * as U from "./utils";

export let globalKTState: KwyjiboTestsState;

/*********************************************************
 * Class Decorators  
 *********************************************************/

/**
 *  Registers a fixture of tests with the global test runner.
 *  @param {string} humanReadableName - The human readable name for the fixture
 */
export function Fixture(humanReadableName?: string): (f: Function) => void {
    return (ctr: Function) => {
        let fixture = globalKTState.getOrInsertFixture(ctr);
        fixture.humanReadableName = typeof (humanReadableName) === "string" ? humanReadableName : ctr.name;
        fixture.explicitlyDeclared = true;
    };
}


/*********************************************************
 * Method Decorators  
 *********************************************************/


/**
 *  Register a new test. If the test throws it fails, otherwise it passes.
 *  @param {string} humanReadableName - The human readable name for this test.
 */
export function Test(humanReadableName: string): (a: any, s: string, pd: PropertyDescriptor) => void {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let f = globalKTState.getOrInsertFixture(target.constructor);
        let t = f.getOrInsertTest(propertyKey);
        t.humanReadableName = humanReadableName;
        t.explicitlyDeclared = true;
    };
}


/**
 *  Method to run before any of the tests.
 */
export function Before(): (a: any, s: string, pd: PropertyDescriptor) => void {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        globalKTState.getOrInsertFixture(target.constructor).runBeforeMethods.push(propertyKey);
    };
}

/**
 *  Method to run after any of the tests.
 */
export function After(): (a: any, s: string, pd: PropertyDescriptor) => void {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        globalKTState.getOrInsertFixture(target.constructor).runAfterMethods.push(propertyKey);
    };
}

/*********************************************************
 * Tests
 *********************************************************/

export class KwyjiboTest {
    humanReadableName: string;
    explicitlyDeclared: boolean = false;
}

export type KwyjiboTestMap = { [key: string]: KwyjiboTest };

export class KwyjiboFixture {
    runBeforeMethods: string[] = [];
    runAfterMethods: string[] = [];
    tests: KwyjiboTestMap = {};
    ctr: Function;
    humanReadableName: string;
    explicitlyDeclared: boolean = false;

    getOrInsertTest(key: string): KwyjiboTest {
        if (this.tests[key] == undefined) {
            this.tests[key] = new KwyjiboTest();
        }
        return this.tests[key];
    }

}

export type KwyjiboFixtureMap = { [key: string]: KwyjiboFixture };

export class KwyjiboTestResult {
    fixtureDesc: string;
    fixtureKey: string;
    testDesc: string;
    testKey: string;
    passed: boolean;
    message: string;
}


export class KwyjiboTestsState {
    fixtures: KwyjiboFixtureMap = {};

    getOrInsertFixture(ctr: Function): KwyjiboFixture {
        let key = ctr.toString();
        if (this.fixtures[key] == undefined) {
            this.fixtures[key] = new KwyjiboFixture();
            this.fixtures[key].ctr = ctr;
        }
        return this.fixtures[key];
    }

    generateCompleteFixtureMetadata(): Object {
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

    static getFixtureHashId(fixture: KwyjiboFixture): string {
        let hasher = Crypto.createHash("sha256");
        hasher.update(fixture.ctr.toString());
        return fixture.ctr.name + "_" + hasher.digest("hex").substr(0, 8);
    }

    generateRainbowTables(): Object {
        let rt = {};
        for (let fxk in this.fixtures) {
            let fixture = this.fixtures[fxk];
            let fxkHash = KwyjiboTestsState.getFixtureHashId(fixture);
            rt[fxkHash] = fixture;
        }
        return rt;
    }

    async run(testsToRun?: Object): Promise<KwyjiboTestResult[]> {

        if (testsToRun == undefined) {
            testsToRun = this.generateCompleteFixtureMetadata();
        }

        let testResults: KwyjiboTestResult[] = [];
        let rainbowTables = this.generateRainbowTables();

        for (let fxk in testsToRun) {
            let fixture: KwyjiboFixture = rainbowTables[fxk];
            let fi = Reflect.construct(fixture.ctr, []);

            for (let mn of fixture.runBeforeMethods) {
                let r = fi[mn]();
                if (r instanceof Promise) {
                    await r;
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
                            await r;
                        }
                        result.passed = true;
                        result.message = "";
                    } catch (err) {
                        result.passed = false;
                        if (err instanceof Error) {
                            result.message = JSON.stringify({ name: err.name, message: err.message, stack: err.stack });
                        } else if (err instanceof Object) {
                            result.message = JSON.stringify(err);
                        } else if (typeof (err) === "string") {
                            result.message = err;
                        } else {
                            result.message = err.toString();
                        }
                    }
                    testResults.push(result);
                }
            }

            for (let mn of fixture.runAfterMethods) {
                let r = fi[mn]();
                if (r instanceof Promise) {
                    await r;
                }
            }

        }
        return testResults;
    }
}

globalKTState = new KwyjiboTestsState();

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



function generateInteractiveTestRunnerMiddleware(useFixture?: KwyjiboFixture): (req: Express.Request, res: Express.Response) => void {
    return (req: Express.Request, res: Express.Response) => {
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

        let useFixtureHash: string = undefined;

        if (useFixture == undefined) {
            content += `
                    To run all the tests programatically use: <a href="all">/all</a><br />
                    To run some of the tests programatically send a JSON payload via POST to: <a href="some">/some</a><br />
                    (You can see how the JSON payload should look at <a href="metadata">/metadata</a>)<br /><br /> 
                    `;
        } else {
            content += `
                    To run all the tests programatically use: <a href="all">/all</a><br />
                    To run some of the tests programatically, see <a href="../../">tests home</a><br /><br /> 
                    `;
            useFixtureHash = KwyjiboTestsState.getFixtureHashId(useFixture);
        }

        content += `<table>`;
        for (let fxk in globalKTState.fixtures) {
            let fixture = globalKTState.fixtures[fxk];
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


async function runSetOfTestsAndFillResponse(testsToRun: Object, res: Express.Response): Promise<void> {
    let results = await globalKTState.run(testsToRun);
    let failed = false;
    for (let result of results) {
        if (result.passed === false) {
            failed = true;
        }
    }
    res.statusCode = failed ? 418 : 200;
    res.json(results);
}

export function injectTestRunnerMiddleware(controller: C.KwyjiboController) {

    /*
		Available endpoints:
			- /: interactive shell
            
            - /all: run all tests unattended
			- /metadata: get json metadata for available tests.
            - /some: post a json to run only a subset of tests.

			- /fixture/[FixtureName]: link to all tests in fixture (interactive shell)
			- /fixture/[FixtureName]/all
	*/

    controller.router.get("/all", async (req: Express.Request, res: Express.Response) => {
        await runSetOfTestsAndFillResponse(undefined, res);
    });

    controller.router.post("/some", async (req: Express.Request, res: Express.Response) => {
        await runSetOfTestsAndFillResponse(req.body, res);
    });

    controller.router.get("/metadata", (req: Express.Request, res: Express.Response) => {
        res.json(globalKTState.generateCompleteFixtureMetadata());
    });

    for (let fxk in globalKTState.fixtures) {
        let fixture = globalKTState.fixtures[fxk];
        let fxkHash = KwyjiboTestsState.getFixtureHashId(fixture);
        controller.router.get(U.UrlJoin("/fixture/", fxkHash, "/"), generateInteractiveTestRunnerMiddleware(fixture));
        controller.router.get(U.UrlJoin("/fixture/", fxkHash, "/all"), async (req: Express.Request, res: Express.Response) => {
            let metadata = globalKTState.generateCompleteFixtureMetadata();
            let thisFixtureSet = {};
            for (let mk in metadata) {
                if (mk === fxkHash) {
                    thisFixtureSet[mk] = metadata[mk];
                }
            }
            await runSetOfTestsAndFillResponse(thisFixtureSet, res);
        });
    }

    controller.router.get("/", generateInteractiveTestRunnerMiddleware());
}

