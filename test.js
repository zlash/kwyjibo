"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
const K = require('./src/controller');
const httpMethod_1 = require('./src/httpMethod');
let MyController = class MyController {
    getSomething(context) {
        let req = context.request;
        context.response.json({ "EverythingIsAwesome": true });
    }
    getSomethingCustom(context, id, value, otherValue, customHeader, valueFromCookie) {
    }
    postSomething(context) {
    }
    getSomething2(context) {
    }
    getSomethingPortedFromExpress(req, res, next) {
    }
};
__decorate([
    K.Get(),
    K.DocAction("My documentation for the action"), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', [K.Context]), 
    __metadata('design:returntype', void 0)
], MyController.prototype, "getSomething", null);
__decorate([
    K.Get("customRoute/:otherValue"),
    K.Middleware(() => { }),
    __param(1, K.FromBody("id")),
    __param(2, K.FromQuery("value")),
    __param(3, K.FromPath("otherValue")),
    __param(4, K.FromHeader("x-mycustomheader")),
    __param(5, K.FromCookie("myCookieValue")), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', [Object, Number, String, String, Object, String]), 
    __metadata('design:returntype', void 0)
], MyController.prototype, "getSomethingCustom", null);
__decorate([
    K.Post(), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', [Object]), 
    __metadata('design:returntype', void 0)
], MyController.prototype, "postSomething", null);
__decorate([
    K.Method(httpMethod_1.default.Put), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', [Object]), 
    __metadata('design:returntype', void 0)
], MyController.prototype, "getSomething2", null);
__decorate([
    K.ExpressCompatible(),
    K.Get("oldEndpoint"), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', [Object, Object, Object]), 
    __metadata('design:returntype', void 0)
], MyController.prototype, "getSomethingPortedFromExpress", null);
MyController = __decorate([
    K.Controller("/"),
    K.DocController("Documentation for my controller"), 
    __metadata('design:paramtypes', [])
], MyController);
let MyDevController = class MyDevController {
};
MyDevController = __decorate([
    K.Controller(MyController, "/dev"),
    //will mount in [root for MyController]/dev
    K.Dev(), 
    __metadata('design:paramtypes', [])
], MyDevController);
K.DumpInternals();
//# sourceMappingURL=test.js.map