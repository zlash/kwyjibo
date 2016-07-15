#Kwyjibo
A set of Typescript Decorators and helpers for a better node.js+Express experience.

###Key features
- Express integration
- Controllers / Actions
- Dev endpoints
- Tests execution and automation
- API Documentation

###Quickstart
1. Install [Visual Studio Code](https://code.visualstudio.com/Download)
2. Install `yeoman` with the  `generator-kwyjibo` package, and the required dependencies for every-day development (`typescript`, `tsd`, and `package-to-tsd`)
	```
	npm install --global yeoman generator-kwyjibo typescript tsd package-to-tsd
	```

3. Use the `generator-kwyjibo` to scaffold a new web app. When asked, give a name to the app and answer `Yes` to every generator option
	```
	yo kwyjibo
	```
4. Get all the Typescript definitions for the project
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

