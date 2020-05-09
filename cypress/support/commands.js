// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

function getQuadMiddle(quad) {
    let x = 0;
    let y = 0;
    for (const point of quad) {
        x += point.x;
        y += point.y;
    }
    return {
        x: x / 4,
        y: y / 4,
    }
}

function quadToPoint(quads) {
    return [
        {x: quads[0], y: quads[1]},
        {x: quads[2], y: quads[3]},
        {x: quads[4], y: quads[5]},
        {x: quads[6], y: quads[7]},
    ]
}

/*
 * A command to retrieve middle X and Y absolute position of an element to make nmove testing easier
 */
const getMiddlePoint = async (DOMElement) => {
    await Cypress.automation('remote:debugger:protocol', {command: 'DOM.enable'});
    await Cypress.automation('remote:debugger:protocol', {command: 'CSS.enable'});
    const allRootNodes = await Cypress.automation('remote:debugger:protocol', {command: 'DOM.getFlattenedDocument'});
    const isIframe = (node) => node.nodeName === 'IFRAME' && node.contentDocument
    const filtered = allRootNodes.nodes.filter(isIframe);
    // The first Iframe containing the tested page
    const root = filtered.filter(node => node.attributes.includes("aut-iframe"))[0].contentDocument;
    const {nodeId} = await Cypress.automation('remote:debugger:protocol', {
        command: 'DOM.querySelector',
        params: {
            nodeId: root.nodeId,
            selector: DOMElement.selector
        }
    });
    const retrievedQuads = await Cypress.automation('remote:debugger:protocol', {
        command: 'DOM.getContentQuads',
        params: {
            nodeId: nodeId,
        }
    });
    const quad = retrievedQuads.quads[0];

    return (getQuadMiddle(quadToPoint(quad)));
}

Cypress.Commands.add('getMiddlePoint', {prevSubject: 'element'}, getMiddlePoint)
