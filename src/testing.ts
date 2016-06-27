
class KwyjiboTest {
    humanReadableName: string;
    explicitlyDeclared: boolean = false;
}

type KwyjiboTestMap = { [key: string]: KwyjiboTest };

class KwyjiboFixture {
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

type KwyjiboFixtureMap = { [key: string]: KwyjiboFixture };

class KwyjiboTestsState {
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

