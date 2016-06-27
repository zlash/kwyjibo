
/*********************************************************
 * Class Decorators  
 *********************************************************/


/**
 *  Registers a fixture of tests with the global test runner.
 *  @param {string} humanReadableName - The human readable name for the fixture
 */
export function Fixture(humanReadableName?: string): (Function) => void {
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
export function Test(humanReadableName: string): (any, string, PropertyDescriptor) => void {
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
export function Before(): (any, string, PropertyDescriptor) => void {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        globalKTState.getOrInsertFixture(target.constructor).runBeforeMethods.push(propertyKey);
    };
}

/**
 *  Method to run after any of the tests.
 */
export function After(): (any, string, PropertyDescriptor) => void {
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
    runBeforeMethods: string[]=[];
    runAfterMethods: string[]=[];
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
}

export let globalKTState = new KwyjiboTestsState();

