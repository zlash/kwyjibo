import * as C from "./controller";
export declare let globalKTState: KwyjiboTestsState;
/*********************************************************
 * Class Decorators
 *********************************************************/
/**
 *  Registers a fixture of tests with the global test runner.
 *  @param {string} humanReadableName - The human readable name for the fixture
 */
export declare function Fixture(humanReadableName?: string): (f: Function) => void;
/*********************************************************
 * Method Decorators
 *********************************************************/
/**
 *  Register a new test. If the test throws it fails, otherwise it passes.
 *  @param {string} humanReadableName - The human readable name for this test.
 */
export declare function Test(humanReadableName: string): (a: any, s: string, pd: PropertyDescriptor) => void;
/**
 *  Method to run before any of the tests.
 */
export declare function Before(): (a: any, s: string, pd: PropertyDescriptor) => void;
/**
 *  Method to run after any of the tests.
 */
export declare function After(): (a: any, s: string, pd: PropertyDescriptor) => void;
/*********************************************************
 * Tests
 *********************************************************/
export declare class KwyjiboTest {
    humanReadableName: string;
    explicitlyDeclared: boolean;
}
export declare type KwyjiboTestMap = {
    [key: string]: KwyjiboTest;
};
export declare class KwyjiboFixture {
    runBeforeMethods: string[];
    runAfterMethods: string[];
    tests: KwyjiboTestMap;
    ctr: Function;
    humanReadableName: string;
    explicitlyDeclared: boolean;
    getOrInsertTest(key: string): KwyjiboTest;
}
export declare type KwyjiboFixtureMap = {
    [key: string]: KwyjiboFixture;
};
export declare class KwyjiboTestResult {
    fixtureDesc: string;
    fixtureKey: string;
    testDesc: string;
    testKey: string;
    passed: boolean;
    message: string;
}
export declare class KwyjiboTestsState {
    fixtures: KwyjiboFixtureMap;
    getOrInsertFixture(ctr: Function): KwyjiboFixture;
    generateCompleteFixtureMetadata(): Object;
    static getFixtureHashId(fixture: KwyjiboFixture): string;
    generateRainbowTables(): Object;
    run(testsToRun?: Object): Promise<KwyjiboTestResult[]>;
}
export declare function injectTestRunnerMiddleware(controller: C.KwyjiboController): void;
