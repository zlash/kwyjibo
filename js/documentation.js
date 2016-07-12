"use strict";
const controller_1 = require("./controller");
class MethodDoc {
}
exports.MethodDoc = MethodDoc;
class ControllerDocNode {
}
exports.ControllerDocNode = ControllerDocNode;
function getControllerDocNodeAndChilds(node) {
    let cdn = new ControllerDocNode();
    cdn.name = node.controller.ctr.name;
    cdn.docString = node.controller.docString;
    for (let methodKey in node.controller.methods) {
        let m = new MethodDoc();
        m.name = methodKey;
        m.docString = node.controller.methods[methodKey].docString;
    }
    for (let child of node.childs) {
        cdn.childs.push(getControllerDocNodeAndChilds(child));
    }
    return cdn;
}
function getDocs() {
    let cdns = [];
    for (let node of controller_1.globalKCState.controllersTree) {
        cdns.push(getControllerDocNodeAndChilds(node));
    }
    return cdns;
}
exports.getDocs = getDocs;
//# sourceMappingURL=documentation.js.map