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

## Use

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

See [cypress/integration/spec.js](cypress/integration/spec.js)

## Limitations

Those commands use `Cypress.automation('remote:debugger:protocol')` calls in background to dispatch MouseEvents
as if user was really interacting with the Page.

Cypress doesn't currently have the support of this protocol for the Firefox browser.

But since Firefox currently is implementing CDP under [Remote](https://wiki.mozilla.org/Remote), we can fairly assume that it's only a matter of time before this support come into Cypress. 

Also since it's simulating user interaction, interacting with the page during the tests (mouving the mouse when using `cypress open` during running tests)
can mess up with assertions because of events race condition.

## Roadmap
 - [ ] Add more real tests case scenarios
 - [ ] Add Firefox Compatibility

## License

This project is licensed under the terms of the [MIT license](/LICENSE.md).

[renovate-badge]: https://img.shields.io/badge/renovate-app-blue.svg
[renovate-app]: https://renovateapp.com/
