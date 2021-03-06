#Kwyjibo
A set of TypeScript Decorators and helpers for a better node.js+Express experience.

##TL;DR
Watch this video

[![IMAGE ALT TEXT HERE](http://img.youtube.com/vi/OiXc3kKcn5g/0.jpg)](http://www.youtube.com/watch?v=OiXc3kKcn5g)


##Key features

- [Requirements](#requirements)
- [Express integration](#express-integration)
- [Controllers and Actions](#controllers-and-actions)
- [Custom mount conditions](#custom-mount-conditions)
- [Error Handling](#error-handling)
- [Tests execution and automation](#tests-execution-and-automation)
- [Documentation generator](#documentation-generator)

##Quickstart

1. Install [Visual Studio Code](https://code.visualstudio.com/Download)
2. Install `yo` with the  `generator-kwyjibo` package, and the required dependencies for every-day development (`typescript`)

	```
	npm install --global yo generator-kwyjibo typescript@beta
	```

3. Use the `generator-kwyjibo` to scaffold a new web app in the current directory. When asked, give a name to the app and answer `Yes` to every generator option

	```
	yo kwyjibo
	```

4. Start Visual Studio Code
	```
	code .
	```

5. Press `F1` and type `>Run Build Task` to build the app

6. Press `F5`  to start the Kwyjibo app in `http://localhost:3000`

7. You did it! Your Kwyjibo app is up and running!


##Requirements

To use the Kwyjibo framework with a Node.js+Express web app, the minimum requirements are:

- Node.js 6.x
- Express 4.14.0
- TypeScript 2.0.0 (beta), with:
	- `experimentalDecorators` support 
	- ECMAScript 6 target 

(in your `tsconfig.json` file, inside `compilerOptions` set `experimentalDecorators` to `true` and `target` to `es6`)


##Express integration

The easiest way to use Kwyjibo is using the Yeoman generator, as it is explained in the [quickstart](#quickstart). However, if you already have an Express application, or just don't want to use the generator, you can use this steps to integrate Kwyjibo with an existing Express app.

Once you have an Express app up and running (and using TypeScript), go to a terminal and run `npm install --save kwyjibo` to add it as a dependency to you app. Then, open the app entrypoint (let's say, `app.ts`) and add the following line at the beginning:

`import * as Kwyjibo from "kwyjibo"`

And right after creating the Http server, add the following lines (assuming `expressApp` is an object containing the Express app):

```typescript
// Init all Kwyjibo controllers and tests (assuming "tests" and "controllers" folders)
// To use custom folders, pass the folder names as extra parameters to initialize
Kwyjibo.initialize(App.express);
```

This will configure the framework loggers, and load all the tests and controllers that are inside the `tests` and `controllers` folders


##Controllers and Actions

The main components in a Kwyjibo app are the controllers and their actions.
Each controller is a mount point for a set of actions, and each action can handle a request to a specific path and HTTP method.

###Controllers

The controllers must be decorated with the `@Controller` decorator, specifying the mount point:

- `@Controller("/myMountPoint")` will mount the controller in `/myMountPoint`.
- `@Controller(AnotherController, "/myMountPoint")` will mount the controller in the specified mount point, but using `AnotherController` as its root (for instance, this could be ended up being mounted as `/someMountPoint/myMountPoint`.

You can - optionally - add the `@DocController` decorator to add documentation and the `@Middleware` decorator to apply middlewares to all the controller actions

###Actions

Each action is a method in the controller with either, a `@Get`, `@Post` or `@Method` decorator to specify its route and HTTP method, or at least one of the `@DocAction` or `@ActionMiddleware` decorators, and it will use the default mount point (the method name, using the `GET` HTTP method)

The `@DocAction` the same way `@DocController` does, but for actions, and the `@ActionMiddleware` to apply middlewares to particular actions. 

By default, the action methods receive at least a `context: Kwyjibo.Context` parameter that allows it to access the request and response objects and can return:

- If the action just returns `200 OK`, invokes to `context.response.render` or manually handles the `context.response`:
 - `void` 
 - `Promise<void>`
- if the actions returns `200 OK` and sends a string as a response (for instance, an HTML):  
 - `string`
 - `Promise<string>`
- If the action returns a `200 OK` and sends a `json` object as a response:  
 - `Object`
 - `Promise<Object>`

In any of those cases, if an exception is thrown (or the promise is rejected), the exception will be handled by the error handler middlewares configured in Express.

Also, a method can return an HttpError for which the correct status and message will be sent. For example:
```typescript
async someMethod(context:Context): Promise<Object|HttpError> {
	let retObj = await someMethodThatBringsTheObject();
	if(retObj == undefined) {
		return NotFound("Cannot find the requested object");
	}
	return retObj;
}
```

###Parameters

To use request parameters from the body, route path, querystring, headers or cookies, you can decorate any action parameter but the first (that must be the context) with the following decorators:

- `@FromBody("paramName")`
- `@FromPath("paramName")`
- `@FromQuery("paramName")`
- `@FromHeader("paramName")`
- `@FromCookie("paramName")`

For instance, to create a controller for users operations:
- Create a `controllers` folder in your app root and create a `usersController.ts` file inside.
- Add the following code:

```typescript
import * as K from "kwyjibo";

@K.Controller("/users")
@K.DocController("Users Controller.")
@K.Middleware(UsersController.loggingMiddleware)
class UsersController {

	static loggingMiddleware(req: Express.Request, res: Express.Response, next: Function) {
		console.log("Request to: " + req.path);
	}

    @K.Get("/")
    @K.DocAction(`Users index`)
    index(context: K.Context): string {
        return "<html><body><ul><li>/list: all users</li><li>/user/:id: specifi user</li></ul></body></html>";
    }

    @K.Get("/list")
    @K.DocAction(`Return all users`)
    allUsers(context: Context): Object {
        let users = UsersRepository.getAllUsers();
        return users; // this action will send a json object
    }

    @Get("/user/:id")
    @DocAction(`Return a specific user`)
    oneUser(context: Context, @FromPath("id") id: string): string {
        let user = UsersRepository.getUser(id);
        return user;
    }
}
```

###Migration from standard Express

If you want to use the standard Express route method signature, instead of just receiving the `context` object (useful to migrate classic Express apps to Kwyjibo), you can use the `@ExpressCompatible` decorator and create methods like this:

```typescript
@Get("/somewhere")
@ExpressCompatible()
myExpressCompatibleAction(req: Express.Request, res: Express.Response, next: Function): void {
	// do something
}
```


##Custom mount conditions

If you want to mount controllers conditionally, you can use the `@MountCondition` decorator.

###Dev environment
When the node app is started with the environment variable `NODE_ENV = development`, every controller that doesn't have it's root endpoint mapped to an action will autogenerate an index with links to every action available at that endpoint.

Also, if you have controllers that should only be exposed in development environment, you can use the `@Dev` controller decorator (a special case of a custom mount condition) and it will only be mounted if that condition is met.


##Error Handling

Kwijibo will automatically handle errors thrown inside actions and send a `500 Internal Server Error` response.
However, you can throw known error types that Kwyjibo can handle:
- `HttpError`: custom HttpError, with message and status code
- `InternalServerError`: 500 error with message
- `NotFound`: 404 error with message
- `BadRequest`: 400 error with message
- `Unauthorized`: 401 error with message

For instance, if you wanted to validate a payload in a web API, you would do something like this:

```typescript
@Controller("/api")
class Api {
	@Get()
	doSomething(context: Context, @FromQuery("id") id: string): Object {
		if (id == undefined) {
			throw new BadRequest("id parameter is required");
		}
		
		return {
			value: id
		};
	}
}
```

##Tests execution and automation

The Kwyjibo framework includes the autogeneration of endpoints for integration tests execution, in both interactive and automatic scenarios.

###Test fixture

To add tests to you app, create a `sampleTests.ts` file inside the `tests` folder under the app root. The test fixture class must be decorated with `@Fixture` and each test is a method inside it that has the `@Test` decorator.

To do the test preparation and cleanup, you can write methods inside the fixture with the `@Before` and `@After` decorators.

Each test method can have either `void` or `Promise<void>`as its return type.

If the test finishes its execution successfully, will be considered as passed. To make a test fail, it must throw an exeption, or reject the returned promise.

A Test fixture example:

```typescript
import * as K from "kwyjibo"

@K.Fixture()
export default class Fixture {
    @K.Before()
    prepare(): void {
        // this method will run before the tests
    }

    @K.Test("A test that passes")
    test1(): void {
        // this test will pass
    }

    @K.Test("A test that fails")
    test2(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
	        reject(new Error('failed test!'));
        });
    }

    @K.After()
    cleanUp(): void {
        // this method will run after the tests
    }
}
```

###Test runner

Then, you have to add the `@TestRunner` decorator to a controller. It will scan for all the available test fixtures in the app and generate the endpoints to execute them.

A controller with the autogenerated test endpoints (test runner):

```typescript
import * as K from "kwyjibo";

@K.TestRunner()
@K.Controller("/test")
export default class Test {
}
```

The interactive test runner will explain how to invoke the same set of tests programatically. 


##Documentation generator

Kwyjibo reads all the `@DocController` and `@DocAction` decorators and uses that information to automatically generate documentation for your web app or API

There are two functions available to access obtain the generated documentation:
- `Kwyjibo.getDocs()`: returns a `ControllerDocNode[]` representing all the controllers documentation with their actions.
- `Kwyjibo.getDocsAsHTML()`: returns a string with the controllers documentation as HTML

For instance, if you wanted to have a documentation endpoint for your web API, and it should only be exposed when running in a dev environment, you should create the following controller:

```typescript
import * as K from "kwyjibo";

K.Dev()
K.Controller("/docs")
K.DocController("API Documentation")
export default class DocsController {
	@K.Get("/")
	htmlDocs(context: K.Context): string {
		return K.getDocsAsHTML();
	}
}
```
