import {globalKCState, KwyjiboControllerTreeNode, KwyjiboMethodMountpoint} from "./controller";
import * as U from "./utils";

export class MethodDoc {
    name: string;
    docString: string;
    mountpoints: KwyjiboMethodMountpoint[];
}

export class ControllerDocNode {
    name: string;
    docString: string;
    path: string;
    parent: ControllerDocNode;
    childs: ControllerDocNode[];
    methods: MethodDoc[];
}

function getControllerDocNodeAndChilds(rootCdns: ControllerDocNode[], node: KwyjiboControllerTreeNode): ControllerDocNode {
    let cdn = new ControllerDocNode();

    cdn.name = node.controller.ctr.name;
    cdn.docString = node.controller.docString;
    cdn.path = node.fullPath;
    cdn.parent = undefined;
    cdn.childs = [];
    cdn.methods = [];

    for (let methodKey in node.controller.methods) {
        let m = new MethodDoc();
        let method = node.controller.methods[methodKey];
        m.name = methodKey;
        m.docString = method.docString;
        m.mountpoints = method.methodMountpoints;
        cdn.methods.push(m);
    }

    for (let child of node.childs) {
        let childCdn = getControllerDocNodeAndChilds(rootCdns, child);
        childCdn.parent = cdn;
        cdn.childs.push(childCdn);
    }

    rootCdns.push(cdn);

    return cdn;
}

export function getDocs(): ControllerDocNode[] {
    let cdns: ControllerDocNode[] = [];
    for (let node of globalKCState.controllersTree) {
        getControllerDocNodeAndChilds(cdns, node);
    }
    return cdns;
}


function crlfToBr(str: string): string {
    return str.replace(/\n|\r/g, "<br />");
}

const defaultCSS = `

    /**
    * Eric Meyer's Reset CSS v2.0 (http://meyerweb.com/eric/tools/css/reset/)
    * http://www.cssportal.com
    */
    html, body, div, span, applet, object, iframe,
    h1, h2, h3, h4, h5, h6, p, blockquote, pre,
    a, abbr, acronym, address, big, cite, code,
    del, dfn, em, img, ins, kbd, q, s, samp,
    small, strike, strong, sub, sup, tt, var,
    b, u, i, center,
    dl, dt, dd, ol, ul, li,
    fieldset, form, label, legend,
    table, caption, tbody, tfoot, thead, tr, th, td,
    article, aside, canvas, details, embed,
    figure, figcaption, footer, header, hgroup,
    menu, nav, output, ruby, section, summary,
    time, mark, audio, video {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
    }
    /* HTML5 display-role reset for older browsers */
    article, aside, details, figcaption, figure,
    footer, header, hgroup, menu, nav, section {
    display: block;
    }
    body {
    line-height: 1;
    }
    ol, ul {
    list-style: none;
    }
    blockquote, q {
    quotes: none;
    }
    blockquote:before, blockquote:after,
    q:before, q:after {
    content: '';
    content: none;
    }
    table {
    border-collapse: collapse;
    border-spacing: 0;
    }



    .wrapper{
        width: 100%;
        min-width: 1000px;
        max-width: 2000px;
        margin: 0 auto;
    }
    .left{
        float: left;
        background: #CC33FF;
        width: 200px;
        margin-left: -100%;
        border-radius: 25px;
    }
    .rightFluid{
        float: left;
        width: 100%;
    }
    .right{
        background: #FFFFFF;
        margin-left: 200px;
    }

    p {
        padding: 10px;
    }
    body {
        font-family: Verdana, Arial, Helvetica, sans-serif;
        font-size: 13px;
        color:#333
    }


    `;

export function getDocsAsHTML(): string {
    let content = `
    <html>
    <head>
    <style>
        ${defaultCSS}
    </style>
    </head>
    <body><div class="wrapper">    
    `;

    let cdns = getDocs();
    
    content += `<div class="rightFluid"><div class="right">`;

    for (let cdn of cdns) {
        content += `<div>
                    <div>
                        <h2>${cdn.name}</h2>
                        <h3>Path: ${cdn.path}</h3>
                  `;


        if (cdn.parent != undefined) {
            content += `<div>
                      <h4>Parent: ${cdn.parent.name}</h4>
                      </div>`
        }

        if (cdn.childs.length>0) {
            content += `<div><h4>Childs: `;
            let childLinks: string[] =[];
            for(let child of cdn.childs) {
                childLinks.push(`${child.name}`);
            }             

            content+=`${childLinks.join(", ")}</h4></div>`;
        }


        content += `<p>${crlfToBr(cdn.docString)}</p>
                    </div>                    
                    `;

        if (cdn.methods.length>0) {
            content += `<div><h2>Methods</h2> `;
            
            for(let method of cdn.methods) {
                content += `<div><h3>${method.name}</h3>`;
                for(let mp of method.mountpoints) {
                    content+= `<h4> ${mp.httpMethod.toUpperCase()} : ${U.UrlJoin(cdn.path,"/",mp.path)} </h4>`;
                }
                content+= `<p>${crlfToBr(method.docString)}</p></div>`;
            }             

            content+=`</div>`;
        }

        content += `</div>`;
    }
    
    content += `</div></div>`;

    // Sidebar
    content += `<div class="left"> Controllers </div>`

    content += `</div></body></html>`;
    return content;
}
