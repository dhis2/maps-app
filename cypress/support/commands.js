Cypress.Commands.add('getByDataTest', (selector, ...args) =>
    cy.get(`[data-test=${selector}]`, ...args)
);
