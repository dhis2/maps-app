/// <reference types="Cypress" />

context('Boundary Layers', () => {
    before(() => {});
    beforeEach(() => {
        cy.startServer('boundarylayer');
        cy.login('system', 'System123');
        cy.clock(Date.UTC(2018, 11, 16, 13, 10, 9), ['Date']); // Ensure we don't get fixture cache misses because of date changes
        cy.loadPage();
    });
    after(() => {
        cy.saveFixtures('boundarylayer');
    });

    it('opens BoundaryLayer dialog', () => {
        cy.get('[data-test="addlayerbutton"]').click();
        cy.get('[data-test="addlayeritem-Boundaries"]').click();
        cy.get('[data-test="layeredit"')
            .should('have.length', 1)
            .should('be.visible')
            .contains('Add new boundary layer');
        cy.get('[data-test="boundarydialog"]')
            .should('have.length', 1)
            .should('be.visible');
        cy.get('[data-test="boundarydialog-orgunitstab"]')
            .should('have.length', 1)
            .should('be.visible');
    });

    it('shows error if no orgunit level selected', () => {
        cy.get('[data-test="addlayerbutton"]').click();
        cy.get('[data-test="addlayeritem-Boundaries"]').click();
        cy.get('[data-test="layeredit-addbtn"]').click();
        cy.get('[data-test="layeredit"')
            .should('have.length', 1)
            .should('be.visible');
        cy.get('[data-test="boundarydialog"]')
            .should('have.length', 1)
            .should('be.visible');
        cy.get('[data-test="boundarydialog-orgunitstab"]')
            .should('have.length', 1)
            .should('be.visible')
            .contains('No organisation units are selected');
    });

    it('adds a boundary layer', () => {
        cy.get('[data-test="addlayerbutton"]').click();
        cy.get('[data-test="addlayeritem-Boundaries"]').click();
        cy.get('[data-test="boundarydialog-orgunitstab"]')
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
        cy.get('[data-test="boundarydialog"]')
            .should('have.length', 0)
            .should('not.be.visible');

        cy.getReduxState(state => state.map.mapViews).should('have.length', 1);
        cy.getReduxState(state => state.map.mapViews[0].data).should(
            'have.length',
            13
        );

        const card = cy
            .get('[data-test="layercard"]')
            .should('have.length', 1)
            .contains('Boundaries');

        card.get('[data-test="layerlegend"]').should('have.length', 1);
        card.get('[data-test="layerlegend-item"]').should('have.length', 1);
        card.get('[data-test="layercard"] [data-test="layertoolbar"]').should(
            'have.length',
            1
        );
    });
});
