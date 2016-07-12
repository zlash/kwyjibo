import {globalKCState, KwyjiboControllerTreeNode} from "./controller";

export class MethodDoc {
    name: string;
    docString: string;
}

export class ControllerDocNode {
    name: string;
    docString: string;
    childs: ControllerDocNode[];
    methods: MethodDoc[];
}

function getControllerDocNodeAndChilds(node: KwyjiboControllerTreeNode): ControllerDocNode {
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

export function getDocs(): ControllerDocNode[] {
    let cdns: ControllerDocNode[] = [];
    for (let node of globalKCState.controllersTree) {
        cdns.push(getControllerDocNodeAndChilds(node));
    }
    return cdns;
}

