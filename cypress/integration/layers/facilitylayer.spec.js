/// <reference types="Cypress" />

context('Facility Layers', () => {
    before(() => {});
    beforeEach(() => {
        cy.startServer('facilitylayer');
        cy.login('system', 'System123');
        cy.loadPage();
    });
    after(() => {
        cy.saveFixtures('facilitylayer');
    });

    it('opens FacilityLayer dialog', () => {
        cy.get('[data-test="addlayerbutton"]').click();
        cy.get('[data-test="addlayeritem-Facilities"]').click();
        cy.get('[data-test="layeredit"')
            .should('have.length', 1)
            .should('be.visible')
            .contains('Add new facility layer');
        cy.get('[data-test="facilitydialog"]')
            .should('have.length', 1)
            .should('be.visible');
        cy.get('[data-test="facilitydialog-grouptab"]')
            .should('have.length', 1)
            .should('be.visible');
    });

    it('shows error if no group selected', () => {
        cy.get('[data-test="addlayerbutton"]').click();
        cy.get('[data-test="addlayeritem-Facilities"]').click();
        cy.get('[data-test="layeredit-addbtn"]').click();
        cy.get('[data-test="layeredit"')
            .should('have.length', 1)
            .should('be.visible');
        cy.get('[data-test="facilitydialog"]')
            .should('have.length', 1)
            .should('be.visible');
        cy.get('[data-test="facilitydialog-grouptab"]')
            .should('have.length', 1)
            .should('be.visible')
            .contains('Group set is required');
    });
    it('shows error if no orgunit level selected', () => {
        cy.get('[data-test="addlayerbutton"]').click();
        cy.get('[data-test="addlayeritem-Facilities"]').click();
        cy.get('[data-test="orgunitgroupsetselect"]')
            .should('have.length', 1)
            .click();
        cy.get('[data-test="selectfield-menuitem"]').should('have.length', 4);
        cy.get('[data-value="J5jldMd8OHv"]') // Facility type
            .should('have.length', 1)
            .click();

        cy.get('[data-test="layeredit-addbtn"]').click();
        cy.get('[data-test="layeredit"')
            .should('have.length', 1)
            .should('be.visible');
        cy.get('[data-test="facilitydialog"]')
            .should('have.length', 1)
            .should('be.visible');
        cy.get('[data-test="facilitydialog-orgunitstab"]')
            .should('have.length', 1)
            .should('be.visible')
            .contains('No organisation units are selected');
    });

    it('adds a facilities layer', () => {
        cy.get('[data-test="addlayerbutton"]').click();
        cy.get('[data-test="addlayeritem-Facilities"]').click();
        cy.get('[data-test="facilitydialog-orgunitstab"]')
            .should('have.length', 1)
            .should('be.visible');
        cy.get('[data-test="orgunitlevelselect"]')
            .should('have.length', 1)
            .click();
        cy.get('[data-test="selectfield-menuitem"]').should(
            'have.length.greaterThan',
            1
        );

        cy.get('[data-value="2"]') // District
            .should('have.length', 1)
            .click();
        cy.get('body').click(); // Close the modal menu
        cy.get('[data-test="layeredit-addbtn"]').click();
        cy.get('[data-test="facilitydialog"]')
            .should('have.length', 0)
            .should('not.be.visible');
        const card = cy
            .get('[data-test="layercard"]')
            .should('have.length', 1)
            .contains('Facilities');

        card.get('[data-test="layerlegend"]').should('have.length', 1);
        card.get('[data-test="layerlegend-item"]').should('have.length', 5);
        card.get('[data-test="layercard"] [data-test="layertoolbar"]').should(
            'have.length',
            1
        );
    });
});
