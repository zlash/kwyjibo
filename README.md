#Kwyjibo
A set of TypeScript Decorators and helpers for a better node.js+Express experience.

##Key features
- [Requirements](#requirements)
- [Express integration](#express-integration)
- [Controllers and Actions](#controllers-and-actions)
- [Dev Endpoints](#dev-endpoints)
- [Tests execution and automation](#tests-execution-and-automation)
- [API Documentation](#api-documentation)
- [Passport integration](#passport-integration)

###Quickstart
1. Install [Visual Studio Code](https://code.visualstudio.com/Download)
2. Install `yeoman` with the  `generator-kwyjibo` package, and the required dependencies for every-day development (`TypeScript`, `tsd`, and `package-to-tsd`)
	```
	npm install --global yeoman generator-kwyjibo TypeScript tsd package-to-tsd
	```

3. Use the `generator-kwyjibo` to scaffold a new web app. When asked, give a name to the app and answer `Yes` to every generator option
	```
	yo kwyjibo
	```
4. Get all the TypeScript definitions for the project
	```
	package-to-tsd
	```
5. Start Visual Studio Code
	```
	code .
	```
6. Press `F1`, type `>Run Build Task`, select `Configure Task Runner` and then choose `TypeScript - Watch Mode` to create the `task.json` file. 
	- Press `F1`, and type `>Run Build Task` again to run it
7. Press `F5` and choose `Node.js` to create a `launch.json`
	- Change the `sourceMaps` key to `true`
8. Press `F5` again to start the Kwyjibo app in `http://localhost:3000`
9. You did it! Your Kwyjibo app is up and running!

###Requirements
To use the Kwyjibo framework with a Node.js+Express web app, the minimum requirements are:

- Node.js 6.x
- Express 4.14.0
- TypeScript 1.8.10, with:
	- `experimentalDecorators` support 
	- ECMAScript 6 target 

(in your `tsconfig.json` file, inside `compilerOptions` set `experimentalDecorators` to `true` and `target` to `es6`)

###Express integration
The easiest way to use Kwyjibo is using the Yeoman generator, as it is explained in the [quickstart](#quickstart). However, if you already have an Express application, or just don't want to use the generator, you can use this steps to integrate Kwyjibo with an existing Express app.

Once you have an Express app up and running (and using TypeScript), go to a terminal and run `npm install --save kwyjibo` to add it as a dependency to you app. Then, open the app entrypoint (let's say, `app.ts`) and add the following line at the beginning:

`import * as Kwyjibo from 'kwyjibo`

And right after creating the Http server, add the following lines (assuming `expressApp` is an object containing the Express app):

```
// Set Kwyjibo loggers
Kwyjibo.defaultError = (toLog: any) => { console.write(toLog); };
Kwyjibo.defaultWarn = (toLog: any) => { console.write(toLog); };
Kwyjibo.defaultLog = (toLog: any) => { console.write(toLog); };

// Init all Kwyjibo controllers and tests (assuming "tests" and "controllers" folders)
Kwyjibo.addControllersToExpressApp(App.express, "tests", "controllers");
```
This will configure the framework loggers, and load all the tests and controllers that are inside the `tests` and `controllers` folders

###Controllers and Actions
The main components in a Kwyjibo app are the controllers and their actions.
Each controller is a mount point for a set of actions, and each action can handle a request to a specific path and HTTP method.

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

In any of those cases, if an exception is thrown (or the promise is rejected), the exception will be handled by the error handler middlewares configured in Express


###Dev endpoints
Lorem impsum Lorem impsum Lorem impsum Lorem impsum 
Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum 


###Tests execution and automation
Lorem impsum Lorem impsum Lorem impsum Lorem impsum 
Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum 

###API Documentation
Lorem impsum Lorem impsum Lorem impsum Lorem impsum 
Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum 

###Passport integration
m Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum Lorem impsum 


#DOC-TODO:

	- Async support in actions and tests
	- @FromXXX in action parameters
	- Mount container in another container
	- Middleware for actions and controllers 
	- Passport integration



