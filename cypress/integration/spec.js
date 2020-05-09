/// <reference types="cypress" />
/// <reference path="../../src/index.d.ts" />

describe('cypress-nhover', () => {
    it('adds nhover command', () => {
        expect(cy)
            .property('nhover')
            .to.be.a('function')
    })
    it('adds nmove command', () => {
        expect(cy)
            .property('nmove')
            .to.be.a('function')
    })

    context('nhover tests', () => {
        context('basic-tests', () => {
            beforeEach(() => {
                cy.visit('cypress/integration/basic-tests.html');
            })

            it('should trigger :hover CSS pseudo class', () => {
                cy.get('#hoverButton').should('have.css', 'background-color', 'rgb(0, 0, 255)');
                cy.get('#hoverButton')
                    .nhover()
                    .should('have.css', 'background-color', 'rgb(255, 0, 0)');
            });
            it('should call javascript listener events', () => {
                cy.get('#hoverButton').nhover();
                cy.get('#logging').contains('onmouseenter on #hoverButton');
                cy.get('#logging').contains('onmouseover on #hoverButton');
                cy.get('#logging').contains('onmousemove on #hoverButton');
                cy.get('#logging').contains('onmouseout on #hoverButton').should('not.exist');
                cy.get('#logging').contains('onmouseleave on #hoverButton').should('not.exist');
            });
        });
        context('complex-tests', () => {
            beforeEach(() => {
                cy.visit('cypress/integration/complex-tests.html');
            })

            it('should scroll to the element and hover it', () => {
                cy.get('#scrolledButton').should('have.css', 'background-color', 'rgb(0, 0, 255)');
                cy.get('#scrolledButton')
                    .nhover()
                    .should('have.css', 'background-color', 'rgb(255, 0, 0)');
            });
            it('should call javascript listener on scrolled button events', () => {
                cy.get('#scrolledButton').nhover();
                cy.get('#logging').contains('onmouseenter on #scrolledButton');
                cy.get('#logging').contains('onmouseover on #scrolledButton');
                cy.get('#logging').contains('onmousemove on #scrolledButton');
                cy.get('#logging').contains('onmouseout on #scrolledButton').should('not.exist');
                cy.get('#logging').contains('onmouseleave on #scrolledButton').should('not.exist');
            });
            it('should not send javascript event to parent container during hover is steps is 1', () => {
                cy.get('#scrolledButton').nhover({steps: 1});
                cy.get('#logging').contains('onmouseenter on #scrolledButton');
                cy.get('#logging').contains('onmouseover on #scrolledButton');
                cy.get('#logging').contains('onmousemove on #scrolledButton');
                cy.get('#logging').contains('onmouseenter on #containerScrolledButton').should('not.exist');
                cy.get('#logging').contains('onmousemove on #containerScrolledButton').should('not.exist');
                cy.get('#logging').contains('onmouseover on #containerScrolledButton').should('not.exist');
                cy.get('#logging').contains('onmouseout on #scrolledButton').should('not.exist');
                cy.get('#logging').contains('onmouseleave on #scrolledButton').should('not.exist');
            });
            // TODO: Test the error case when I find out the syntax to catch them
            // it('should return an error when trying to hover an non visible element', () => {
            //     cy.get('#nonVisibleButton').nhover();
            //     expect(spy).to.be.called;
            //     expect(spy).to.have.thrown(new Error('Cannot hover a non-visible or 0 sized element'));
            // });
            // it('should return an error if the element is too small to be pointed', () => {
            //     cy.get('#nonVisibleButton').nhover();
            //     expect(spy).to.be.called;
            //     expect(spy).to.have.thrown(new Error('Cannot hover a non-visible or 0 sized element'));
            // });
        });
    })
    context('nmove tests', () => {
        context('basic-tests', () => {
            beforeEach(() => {
                cy.visit('cypress/integration/basic-tests.html');
            })
            it('should be able to remove :hover pseudo class on hovered element', () => {
                cy.get('#hoverButton').should('have.css', 'background-color', 'rgb(0, 0, 255)');
                cy.get('#hoverButton')
                    .nhover()
                    .should('have.css', 'background-color', 'rgb(255, 0, 0)')
                    .nmove({x: 0, y: 0})
                    .should('have.css', 'background-color', 'rgb(0, 0, 255)');
            });
            it('should work the same when called as parent command', () => {
                cy.get('#hoverButton').should('have.css', 'background-color', 'rgb(0, 0, 255)');
                cy.get('#hoverButton')
                    .nhover()
                    .should('have.css', 'background-color', 'rgb(255, 0, 0)');
                cy.nmove({x: 0, y: 0});
                cy.get('#hoverButton').should('have.css', 'background-color', 'rgb(0, 0, 255)');
            });
            it('should trigger javascript listener when moving away from hovered element', () => {
                cy.get('#hoverButton').nhover()
                cy.nmove({x: 0, y: 0});
                cy.get('#logging').contains('onmouseout on #hoverButton');
                cy.get('#logging').contains('onmouseleave on #hoverButton')
            });
        });
        context('complex-tests', () => {
            beforeEach(() => {
                cy.visit('cypress/integration/complex-tests.html');
            })

            it('should trigger javascript event over all traversed elements using steps', () => {
                cy.get('#hoverButton').getMiddlePoint().then(({x, y}) => {
                    // Move mouse 1px by 1px from middle of hover button to begin of containerScrolledButton
                    cy.nmove({x, y: y + 20}, {steps: 20}, {x, y});
                    // Should have triggered the mouse listener of both #hoverButton and #containerScrolledButton
                    // Mouse must have both enter and left the #hoverButton since we traverse it
                    cy.get('#logging').contains('onmouseenter on #hoverButton');
                    cy.get('#logging').contains('onmouseover on #hoverButton');
                    cy.get('#logging').contains('onmousemove on #hoverButton');
                    cy.get('#logging').contains('onmouseout on #hoverButton');
                    cy.get('#logging').contains('onmouseleave on #hoverButton');
                    // Mouse must have entered and moved inside #containerScrolledButton
                    cy.get('#logging').contains('onmouseenter on #containerScrolledButton');
                    cy.get('#logging').contains('onmouseover on #containerScrolledButton');
                    cy.get('#logging').contains('onmousemove on #containerScrolledButton');
                })
            });
        });
    })
})
