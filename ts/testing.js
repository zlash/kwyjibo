/*********************************************************
 * Class Decorators
 *********************************************************/
"use strict";
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
}
exports.KwyjiboTestsState = KwyjiboTestsState;
exports.globalKTState = new KwyjiboTestsState();
//# sourceMappingURL=testing.js.map