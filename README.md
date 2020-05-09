# cypress-nhover [![CircleCI](https://circleci.com/gh/avallete/cypress-nhover.svg?style=svg&circle-token=987db2b47506cc91bb05e0671eeaf0f0c8cfe25e)](https://circleci.com/gh/avallete/cypress-nhover) [![renovate-app badge][renovate-badge]][renovate-app]

> Add nhover (NativeHover) and nmove (NativeMove) command to [Cypress.io](https://www.cypress.io) test runner.
> Use [CDP](https://chromedevtools.github.io/devtools-protocol/) in background to create a "real" hover on 
> elements in a [puppeteer'ish](https://github.com/puppeteer/puppeteer/) way.
 

## Install

```shell
npm install -D cypress-nhover
```

Then include in your project's `cypress/support/index.js`

```js
require('cypress-nhover')
```

## Usage
### nhover:
After installation, your `cy` object will have `.nhover` child command.

`.nhover` command must be chained from a command yielding an HTMLElement.

```js
it('element css change background color because of :hover pseudoclass', () => {
  cy.get('#hoverButton')
    .should('have.css', 'background-color', 'rgb(0, 0, 255)');
  cy.get('#hoverButton')
    .nhover()
    .should('have.css', 'background-color', 'rgb(255, 0, 0)');
})
```

If an element isn't visible into the view, `.nhover` will try to scroll onto it before trying to hovering it.

So, the two following commands will produce the same result:

```js
it('explicitly scollIntoView for hovering', () => {
   cy.get('#hoverButton')
    .scrollIntoView()
    .nhover()
    .should('have.css', 'background-color', 'rgb(255, 0, 0)');
})
// Is equivalent to:
it('dont explicilty scollIntoView', () => {
   cy.get('#hoverButton')
    .nhover()
    .should('have.css', 'background-color', 'rgb(255, 0, 0)');
})
```

**note:** This hover implementation work more or less in the same way as the one implemented by puppeteer and discussed [here](https://github.com/cypress-io/cypress/issues/10#issuecomment-559829533)


### nmove:
This package come with another new command: `nmove`. The main goal of `.nmove` is to provide an easy way to "unhover" an
element hovered with the `.nhover` command.

Ex:
```js
it('Should hover and unhover my element', () => {
  cy.get('#hoverButton')
    .should('have.css', 'background-color', 'rgb(0, 0, 255)')   // element isn't hovered and background-color is blue
    .nhover()
    .should('have.css', 'background-color', 'rgb(255, 0, 0)')   // :hover pseudo class active, background-color is red
    .nmove({x: 0, y: 0})                                        // move the mouse cursor to the top left of the window
    .should('have.css', 'background-color', 'rgb(0, 0, 255)');  // :hover pseudo isn't active anymore
})
```
__________________________

See [cypress/integration/spec.js](cypress/integration/spec.js)

## Limitations

Those commands use `Cypress.automation('remote:debugger:protocol')` calls in background to dispatch MouseEvents
as if user was really interacting with the Page.

#### Common bugs:
- Since it's simulating user interaction, interacting with the page during the tests (moving the mouse when
 using `cypress open` during running tests) can mess up with assertions because of events race condition.
- The Cypress 'replay' behavior doesn't take into account pseudo CSS class activation as a change,
so you will not see the css change when "going back in time" between the different commands of your test. 


#### Firefox support:
Cypress doesn't currently have the support of this protocol for the Firefox browser.

But since Firefox currently is implementing CDP under [Remote](https://wiki.mozilla.org/Remote), we can fairly assume that it's only a matter of time before this support come into Cypress. 

## Roadmap
 - [ ] Add more real tests case scenarios
 - [ ] Add Firefox Compatibility

## License

This project is licensed under the terms of the [MIT license](/LICENSE.md).

[renovate-badge]: https://img.shields.io/badge/renovate-app-blue.svg
[renovate-app]: https://renovateapp.com/
