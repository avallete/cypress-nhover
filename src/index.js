/// <reference types="cypress" />

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

function intersectWithViewport(pts, viewportWidth, viewportHeight) {
    return pts.map((pt) => {
        return {
            x: Math.min(Math.max(pt.x, 0), viewportWidth),
            y: Math.min(Math.max(pt.y, 0), viewportHeight),
        }
    });
}

function computeArea(points) {
    let area = 0;
    for (let i = 0; i < points.length; ++i) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        area += (p1.x * p2.y - p2.x * p1.y) / 2;
    }
    return Math.abs(area);
}

async function getElementNodeId(DOMElement) {
    try {
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
        return nodeId;
    } catch (error) {
        throw new Error(`Cannot retrieve element ${DOMElement.selector} nodeId from the DOM`);
    }
}

async function getNodeIdQuads(nodeId) {
    try {
        const {layoutViewport} = await Cypress.automation('remote:debugger:protocol', {
            command: 'Page.getLayoutMetrics',
        });
        const retrievedQuads = await Cypress.automation('remote:debugger:protocol', {
            command: 'DOM.getContentQuads',
            params: {
                nodeId: nodeId,
            }
        });
        const quads = retrievedQuads.quads
            .map(quadToPoint)
            .map(pts => intersectWithViewport(pts, layoutViewport.clientWidth, layoutViewport.clientHeight))
            .filter((pts) => computeArea(pts) > 1);
        if (!quads.length) {
            throw new Error('Cannot hover a non-visible or 0 sized element');
        }
        return quads;
    } catch (error) {
        throw new Error('Cannot hover a non-visible or 0 sized element');
    }
}

/**
 * Adds nhover (NativeHover) support to Cypress using a custom command.
 *
 * @example
 ```js
 it('element css change background color because of :hover pseudoclass', () => {
  cy.get('#hoverButton')
    .should('have.css', 'background-color', 'rgb(0, 0, 255)');
  cy.get('#hoverButton')
    .nhover()
    .should('have.css', 'background-color', 'rgb(255, 0, 0)');
})
 ```
 */
const nhover = (DOMElement, {log, steps} = {log: true, steps: 1}) => {
    return cy.wrap(DOMElement, {log: false})
        .scrollIntoView({log: false})
        .then(async (DOMElement) => {
            if (log) {
                Cypress.log({name: 'nhover', message: DOMElement});
            }
            await Cypress.automation('remote:debugger:protocol', {command: 'DOM.enable'});
            const nodeId = await getElementNodeId(DOMElement);
            const quads = await getNodeIdQuads(nodeId);
            const firstQuad = quads[0]
            const {x, y} = getQuadMiddle(firstQuad);
            return await nmove(DOMElement, {x: x, y: y}, {steps, log});
        });
}


/**
 * Adds nmove (NativeMouseMove) support to Cypress using a custom command.
 *
 * @example
 ```js
 it('unhover previously hovered element', () => {
  cy.get('#hoverButton')
    .should('have.css', 'background-color', 'rgb(0, 0, 255)');
  cy.get('#hoverButton')
    .nhover()
    .should('have.css', 'background-color', 'rgb(255, 0, 0)')
    .nmove({x: 0, y: 0}) // reset mouse position to 0,0
    .should('have.css', 'background-color', 'rgb(0, 0, 255)') // hover pseudoclass is not active anymore
})
 ```
 */
const nmove = async (subject, destPoint, {log, steps} = {log: true, steps: 1}, fromPoint) => {
    const {x, y} = destPoint;
    const fromPos = fromPoint || destPoint;

    if (fromPos.x === x && fromPos.y === y) {
        steps = 1;
    }

    if (log) {
        Cypress.log({
            name: 'nmove',
            message: `Move mouse from (x: ${fromPos.x}, y: ${fromPos.y}) to (x: ${x}, y: ${y}) in ${steps} steps`
        })
    }
    for (let i = 1; i <= steps; i++) {
        await Cypress.automation('remote:debugger:protocol', {
            command: 'Input.dispatchMouseEvent',
            params: {
                type: 'mouseMoved',
                x: fromPos.x + (x - fromPos.x) * (i / steps),
                y: fromPos.y + (y - fromPos.y) * (i / steps),
                button: 'none',
            }
        });
    }

    return (subject);
}

Cypress.Commands.add('nhover', {prevSubject: 'element'}, nhover)
Cypress.Commands.add('nmove', {prevSubject: 'optional'}, nmove)
