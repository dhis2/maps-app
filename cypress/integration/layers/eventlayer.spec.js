/// <reference types="Cypress" />

context('Event Layers', () => {
    before(() => {});
    beforeEach(() => {
        cy.startServer('eventlayer');
        cy.login('system', 'System123');
        cy.clock(Date.UTC(2018, 11, 16, 13, 10, 9), ['Date']); // Ensure we don't get fixture cache misses because of date changes
        cy.loadPage();
    });
    after(() => {
        cy.saveFixtures('eventlayer');
    });

    it('opens EventLayer dialog', () => {
        cy.get('[data-test="addlayerbutton"]').click();
        cy.get('[data-test="addlayeritem-Events"]').click();
        cy.get('[data-test="layeredit"')
            .should('have.length', 1)
            .should('be.visible')
            .contains('Add new event layer');
        cy.get('[data-test="eventdialog"]')
            .should('have.length', 1)
            .should('be.visible');
        cy.get('[data-test="eventdialog-datatab"]')
            .should('have.length', 1)
            .should('be.visible');
    });

    it('shows error if no program selected', () => {
        cy.get('[data-test="addlayerbutton"]').click();
        cy.get('[data-test="addlayeritem-Events"]').click();
        cy.get('[data-test="layeredit-addbtn"]').click();
        cy.get('[data-test="layeredit"')
            .should('have.length', 1)
            .should('be.visible');
        cy.get('[data-test="eventdialog"]')
            .should('have.length', 1)
            .should('be.visible');
        cy.get('[data-test="eventdialog-datatab"]')
            .should('have.length', 1)
            .should('be.visible')
            .contains('Program is required');
    });

    it('adds an event layer', () => {
        cy.get('[data-test="addlayerbutton"]').click();
        cy.get('[data-test="addlayeritem-Events"]').click();
        cy.get('[data-test="eventdialog-datatab"]')
            .should('have.length', 1)
            .should('be.visible');
        cy.get('[data-test="programselect"]')
            .should('have.length', 1)
            .click();
        cy.get('[data-test="selectfield-menuitem"]').should(
            'have.length.greaterThan',
            1
        );

        cy.get('[data-value="eBAyeGv0exc"]') // Inpatient Morbidity and Mortality
            .should('have.length', 1)
            .click();
        cy.get('[data-test="programstageselect"]').should('have.length', 1);
        cy.get('[data-test="layeredit-addbtn"]').click();
        cy.get('[data-test="eventdialog"]')
            .should('have.length', 0)
            .should('not.be.visible');

        cy.getReduxState(state => state.map.mapViews).should('have.length', 1);
        cy.getReduxState(state => state.map.mapViews[0].data).should(
            'have.length',
            86
        );
        const card = cy
            .get('[data-test="layercard"]')
            .should('have.length', 1)
            .contains('Inpatient morbidity and mortality');

        card.get('[data-test="layerlegend"]', { timeout: 10000 }).should(
            'have.length',
            1
        );
        card.get('[data-test="layerlegend-item"]').should('have.length', 1);
        card.get('[data-test="layercard"] [data-test="layertoolbar"]').should(
            'have.length',
            1
        );
    });
});
