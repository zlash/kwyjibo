import * as K from './src/kwyjibo'

@K.Controller("/")
@K.DocController("Documentation for my controller")
class MyController {

    @K.Get()
    @K.DocAction("My documentation for the action")
    getSomething(context: K.Context): void {

        let req = context.request;

        context.response.json({ "EverythingIsAwesome": true });
    }

    @K.Get("customRoute/:otherValue")
    @K.Middleware(() => { })
    getSomethingCustom(context,
        @K.FromBody("id") id: number,
        @K.FromQuery("value") value: string,
        @K.FromPath("otherValue") otherValue: string,
        @K.FromHeader("x-mycustomheader") customHeader: any,
        @K.FromCookie("myCookieValue") valueFromCookie: string): void {
    }

    @K.Post()
    postSomething(context): void {

    }

    @K.Method("Put")
    getSomething2(context): void {

    }

    @K.ExpressCompatible()
    @K.Get("oldEndpoint")
    getSomethingPortedFromExpress(req, res, next) {

    }
}

@K.Controller(MyController, "/dev") //will mount in [root for MyController]/dev
@K.Dev()
class MyDevController {

}


@K.Controller("/test")
@K.TestRunner()
export class TestController {
	/*
		Available endpoints:
			- /: interactive shell
			- /metadata: get json metadata for available tests
			- /?run=true: run all tests
			- /fixtures: link to all fixtures
			- /fixtures/[FixtureName]: link to all tests in fixture (interactive shell)
			- /fixtures/[FixtureName]?run=true: run all tests in fixture
			- /fixtures/[FixtureName]/[TestName]: link to test (interactive shell)
			- /fixtures/[FixtureName]/[TestName]?run=true: run test
	*/
}


@K.Fixture("This represents what i'm gonna run")
export class MyTests {

    @K.Before()
    runBeforeAllTheTests(context) {

    }

    @K.Test("very test")
    test1(context): void {

    }

    @K.Test("much quality")
    async test2(context): Promise<void> {

    }

    @K.Test("wow")
    test3(context): any {

    }

    @K.After()
    runAfterAllTheTests(context) {

    }
}


K.DumpInternals();