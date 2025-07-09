/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to wait for Angular to be ready
Cypress.Commands.add('waitForAngular', () => {
  cy.window().then((win) => {
    return new Cypress.Promise((resolve) => {
      if (win.getAllAngularTestabilities) {
        const testabilities = win.getAllAngularTestabilities();
        if (testabilities.length === 0) {
          resolve();
          return;
        }
        let count = testabilities.length;
        testabilities.forEach((testability: any) => {
          testability.whenStable(() => {
            count--;
            if (count === 0) {
              resolve();
            }
          });
        });
      } else {
        resolve();
      }
    });
  });
});

// Custom command to select by data-cy attribute
Cypress.Commands.add('getByCy', (selector: string) => {
  return cy.get(`[data-cy="${selector}"]`);
});

// Custom command to select by data-testid attribute
Cypress.Commands.add('getByTestId', (selector: string) => {
  return cy.get(`[data-testid="${selector}"]`);
});

// Custom command to wait for element to be visible and clickable
Cypress.Commands.add('waitAndClick', (selector: string) => {
  cy.get(selector).should('be.visible').should('not.be.disabled').click();
});

// Custom command to type with delay for better stability
Cypress.Commands.add('typeSlowly', { prevSubject: 'element' }, (subject, text: string) => {
  cy.wrap(subject).type(text, { delay: 50 });
});

declare global {
  namespace Cypress {
    interface Chainable {
      waitForAngular(): Chainable<void>
      getByCy(selector: string): Chainable<JQuery<HTMLElement>>
      getByTestId(selector: string): Chainable<JQuery<HTMLElement>>
      waitAndClick(selector: string): Chainable<void>
      typeSlowly(text: string): Chainable<void>
    }
  }
}
