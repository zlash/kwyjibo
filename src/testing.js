"use strict";
class KwyjiboTest {
    constructor() {
        this.explicitlyDeclared = false;
    }
}
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
exports.globalKTState = new KwyjiboTestsState();
//# sourceMappingURL=testing.js.map