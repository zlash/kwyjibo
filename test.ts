import * as K from './controller'


@K.Controller("/")
class MyController {

}

@K.Controller(MyController, "/dev") //will mount in [root for MyController]/dev
@K.Dev()
class MyDevController {

}