/*********************************************************************************

MIT License

Copyright (c) 2016 - Miguel Ángel Pérez Martínez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*********************************************************************************/
"use strict";
const controller_1 = require("./controller");
const U = require("./utils");
class MethodDoc {
}
exports.MethodDoc = MethodDoc;
class ControllerDocNode {
}
exports.ControllerDocNode = ControllerDocNode;
function getControllerDocNodeAndChilds(rootCdns, node) {
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
function getDocs() {
    let cdns = [];
    for (let node of controller_1.globalKCState.controllersTree) {
        getControllerDocNodeAndChilds(cdns, node);
    }
    return cdns;
}
exports.getDocs = getDocs;
function crlfToBr(str) {
    return str.replace(/\n|\r/g, "<br />");
}
function getControllerId(cdns, cdn) {
    for (let idx in cdns) {
        if (cdns[idx] == cdn) {
            return "ci_" + idx;
        }
    }
    return "";
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
        background: #91AA9D;
        width: 250px;
        padding:8px;
        position:fixed;
        top: 0;
        left:0;
    }

    .left h1{
        font-weight: bold;
        font-size: 20px;
        text-decoration: underline;
        margin-bottom:5px;
    }

    .rightFluid{
        float: left;
        width: 100%;
    }
    .right{
        background: #FFFFFF;
        margin-left: 270px;
    }
    .controller{
        background: #91AA9D;
        border-radius: 25px;
        margin-top:3px;
        margin-bottom:3px;
        padding: 10px;
        padding-top: 15px;
        padding-bottom: 15px;
    }

    .controller h1{
        font-weight: bold;
        font-size: 24px;
        text-decoration: underline;
        margin-bottom:5px;
    }

    .controller h2{
        font-weight: bold;
        font-size: 18px;
        margin-bottom:5px;
    }

    .controller h3{
        font-size: 16px;
        margin-bottom:5px;
    }

    .controller a{
        text-decoration: underline;
    }

    .method {
        background: #AFB2B2;
        border-radius: 25px;
        margin-top:3px;
        margin-bottom:3px;
        padding: 10px;
        padding-top: 15px;
        padding-bottom: 15px;
    }

    .method h1{
        font-weight: bold;
        font-size: 20px;
        text-decoration: underline;
        margin-bottom:8px;
    }

    .method h2{
        font-weight: bold;
        font-size: 15px;
        margin-bottom:10px;
    }

    .method p{
        background: #DDDDDD;
    }

    a {
        text-decoration: none;
        color:0;
    }

    ul {
        font-size: 18px;
        list-style-type: square;
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
function getDocsAsHTML() {
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
        content += `<div id="${getControllerId(cdns, cdn)}" class="controller">
                    <div>
                        <h1>${cdn.name}</h1>
                        <h2>Path: ${cdn.path}</h2>
                  `;
        if (cdn.parent != undefined) {
            content += `<div>
                      <h3>Parent: <a href="#${getControllerId(cdns, cdn.parent)}">${cdn.parent.name}</a></h3>
                      </div>`;
        }
        if (cdn.childs.length > 0) {
            content += `<div><h3>Childs: `;
            let childLinks = [];
            for (let child of cdn.childs) {
                childLinks.push(`<a href="#${getControllerId(cdns, child)}">${child.name}</a>`);
            }
            content += `${childLinks.join(", ")}</h3></div>`;
        }
        content += `<p>${crlfToBr(cdn.docString)}</p>
                    </div>                    
                    `;
        if (cdn.methods.length > 0) {
            content += `<div>`;
            for (let method of cdn.methods) {
                content += `<div class="method"><h1>${method.name}</h1>`;
                for (let mp of method.mountpoints) {
                    content += `<h2> ${mp.httpMethod.toUpperCase()} : ${U.UrlJoin(cdn.path, "/", mp.path)} </h2>`;
                }
                content += `<p>${crlfToBr(method.docString)}</p></div>`;
            }
            content += `</div>`;
        }
        content += `</div>`;
    }
    content += `</div></div>`;
    // Sidebar
    content += `<div class="left"><ul>`;
    for (let cdn of cdns) {
        content += `<li><a href="#${getControllerId(cdns, cdn)}">${cdn.name}</a></li>`;
    }
    content += `</div>`;
    content += `<ul></div></body></html>`;
    return content;
}
exports.getDocsAsHTML = getDocsAsHTML;
//# sourceMappingURL=documentation.js.map