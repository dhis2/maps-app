/// <reference types="Cypress" />

context('Smoke Test', () => {
    it('loads', () => {
        cy.visit('/');
        cy.title().should('equal', 'DHIS2 Maps');
    });
});
