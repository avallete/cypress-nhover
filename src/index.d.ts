/// <reference types="cypress" />

declare namespace Cypress {
    /**
     * Options that control in how many step a command will perform his action if the action is decomposable
     */
    interface Steppable {
        /**
         * Define the number of fraction that the main action will be decomposed
         *
         * @default 1
         */
        steps: boolean
    }

    interface Point {
        /**
         * Define an x/y point
         *
         * @default {x: 0, y: 0}
         */
        x: number,
        y: number
    }

    interface Chainable<Subject> {
        /**
         *  Use CDP to simulate a native hovering event on a selected element.
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
        nhover<E extends Node = HTMLElement>(options?: Partial<Loggable & Timeoutable & Steppable>): Chainable<JQuery<E>>

        /**
         *  Use CDP to simulate a native move event to a specific position.
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
        nmove<E extends Node = HTMLElement>(destPoint: Point, options?: Partial<Loggable & Timeoutable & Steppable>, fromPoint?: Point): Chainable<JQuery<E>>
    }
}
