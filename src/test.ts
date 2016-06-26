import * as K from './controller'


@K.Controller("/")
export default class MyController {

}

@K.Controller(MyController, "/dev") //will mount in [root for MyController]/dev
@K.Dev()
@K.Middleware(Middleware1, Middleware2)
export default class MyDevController {

}