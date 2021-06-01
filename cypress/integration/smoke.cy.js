/// <reference types="Cypress" />

context('Smoke Test', () => {
    it('loads', () => {
        cy.visit('/');
        cy.title().should('equal', 'DHIS2 Maps');
    });

    // it('shows basemap card and can switch basemaps', () => {
    //     cy.get('[data-test="basemapcard"]')
    //         .should('have.length', 1)
    //         .should('be.visible');
    //     cy.get('[data-test="basemapcard"] [data-test="layertoolbar"]')
    //         .should('have.length', 1)
    //         .should('be.visible');
    //     cy.get('[data-test="basemaplist"]')
    //         .should('have.length', 1)
    //         .children()
    //         .should('have.length', 9);

    //     const defaultBasemap = 'OSM Light';
    //     const secondBasemap = 'OSM Detailed';
    //     cy.get(
    //         `[data-test="basemaplistitem"][title="${defaultBasemap}"] [data-test="basemaplistitem-name"]`
    //     ).should('have.css', 'font-weight', '500');
    //     cy.get(`[data-test="basemaplistitem"][title="${secondBasemap}"]`)
    //         .should('have.length', 1)
    //         .click();
    //     cy.get(
    //         `[data-test="basemaplistitem"][title="${defaultBasemap}"] [data-test="basemaplistitem-name"]`
    //     ).should('have.css', 'font-weight', '400');
    //     cy.get(
    //         `[data-test="basemaplistitem"][title="${secondBasemap}"] [data-test="basemaplistitem-name"]`
    //     ).should('have.css', 'font-weight', '500');
    // });

    // it('opens AddLayer popup', () => {
    //     cy.get('[data-test="addlayerpopover"]')
    //         .should('have.length', 0)
    //         .should('not.be.visible');
    //     cy.get('[data-test="addlayerbutton"]')
    //         .should('have.length', 1)
    //         .click();
    //     cy.get('[data-test="addlayerpopover"]')
    //         .should('have.length', 1)
    //         .should('be.visible');
    // });
});
