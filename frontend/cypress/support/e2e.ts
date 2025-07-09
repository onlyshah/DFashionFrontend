// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Custom commands for authentication
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/auth/login`,
    body: {
      email,
      password
    }
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token);
    window.localStorage.setItem('user', JSON.stringify(response.body.user));
  });
});

Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('token');
  window.localStorage.removeItem('user');
});

// Custom commands for cart operations
Cypress.Commands.add('addToCart', (productId: string, quantity: number = 1) => {
  const token = window.localStorage.getItem('token');
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/cart/add`,
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      productId,
      quantity
    }
  });
});

Cypress.Commands.add('clearCart', () => {
  const token = window.localStorage.getItem('token');
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}/api/cart/clear`,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
});

// Declare custom commands for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      logout(): Chainable<void>
      addToCart(productId: string, quantity?: number): Chainable<void>
      clearCart(): Chainable<void>
    }
  }
}
