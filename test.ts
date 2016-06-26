import * as K from './src/controller'
import HTTPMethod from './src/httpMethod'


@K.Controller("/")
@K.DocController("Documentation for my controller")
class MyController {

	@K.Get()	
    @K.DocAction("My documentation for the action")
	getSomething(context:K.Context): void {
		
		let req = context.request;

		context.response.json({"EverythingIsAwesome": true});
	}
    
    @K.Get("customRoute/:otherValue")	
    @K.Middleware(()=>{})
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

	@K.Method(HTTPMethod.Put)
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

K.DumpInternals();