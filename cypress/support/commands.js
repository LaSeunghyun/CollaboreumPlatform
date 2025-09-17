// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command for login
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Custom command for logout
Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('token');
    win.localStorage.removeItem('user');
  });
  cy.visit('/');
});

// Custom command for API mocking
Cypress.Commands.add('mockApi', (method, url, response) => {
  cy.intercept(method, url, response).as('mockApi');
});

// Custom command for waiting for API calls
Cypress.Commands.add('waitForApi', (alias) => {
  cy.wait(`@${alias}`);
});
