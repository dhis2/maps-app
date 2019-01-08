/// <reference types="Cypress" />

context('Thematic Layers', () => {
    before(() => {});
    beforeEach(() => {
        cy.startServer('thematiclayer');
        cy.login('system', 'System123');
        cy.clock(Date.UTC(2018, 11, 16, 13, 10, 9), ['Date']); // Ensure we don't get fixture cache misses because of date changes
        cy.loadPage();
    });
    after(() => {
        cy.saveFixtures('thematiclayer');
    });

    it('opens ThematicLayer dialog', () => {
        cy.get('[data-test="addlayerbutton"]').click();
        cy.get('[data-test="addlayeritem-Thematic"]').click();
        cy.get('[data-test="layeredit"')
            .should('have.length', 1)
            .should('be.visible')
            .contains('Add new thematic layer');
        cy.get('[data-test="thematicdialog"]')
            .should('have.length', 1)
            .should('be.visible');
        cy.get('[data-test="thematicdialog-datatab"]')
            .should('have.length', 1)
            .should('be.visible');
    });

    it('shows error if no indicator group selected', () => {
        cy.get('[data-test="addlayerbutton"]').click();
        cy.get('[data-test="addlayeritem-Thematic"]').click();
        cy.get('[data-test="layeredit-addbtn"]').click();
        cy.get('[data-test="thematicdialog-datatab"]')
            .should('have.length', 1)
            .should('be.visible')
            .contains('Indicator group is required');
    });

    it('shows error if no indicator selected', () => {
        cy.get('[data-test="addlayerbutton"]').click();
        cy.get('[data-test="addlayeritem-Thematic"]').click();
        cy.get('[data-test="indicatorgroupselect"]')
            .should('have.length', 1)
            .click();
        cy.get('[data-test="selectfield-menuitem"]').should(
            'have.length.greaterThan',
            1
        );

        cy.get('[data-value="RsvclmONCT3"]') // HIV
            .should('have.length', 1)
            .click();
        cy.get('[data-test="indicatorselect"]').should('have.length', 1);
        cy.get('[data-test="layeredit-addbtn"]').click();
        cy.get('[data-test="thematicdialog-datatab"]')
            .should('have.length', 1)
            .should('be.visible')
            .contains('Indicator is required');
    });

    it('shows error if no period type selected', () => {
        cy.get('[data-test="addlayerbutton"]').click();
        cy.get('[data-test="addlayeritem-Thematic"]').click();
        cy.get('[data-test="indicatorgroupselect"]').click();
        cy.get('[data-value="RsvclmONCT3"]').click(); // HIV
        cy.get('[data-test="indicatorselect"]').click();
        cy.get('[data-test="selectfield-menuitem"]').should('have.length', 1);
        cy.get('[data-value="lZZxDlIsvTc"]') // VCCT post-test counselling rate
            .should('have.length', 1)
            .click();
        cy.get('[data-test="layeredit-addbtn"]').click();
        cy.get('[data-test="thematicdialog-periodtab"]')
            .should('be.visible')
            .contains('Period type is required');
    });

    it('adds a thematic layer', () => {
        cy.get('[data-test="addlayerbutton"]').click();
        cy.get('[data-test="addlayeritem-Thematic"]').click();
        cy.get('[data-test="indicatorgroupselect"]').click();
        cy.get('[data-value="RsvclmONCT3"]').click(); // HIV
        cy.get('[data-test="indicatorselect"]').click();
        cy.get('[data-value="lZZxDlIsvTc"]').click(); // VCCT post-test counselling rate
        cy.get('[data-test="thematicdialog-tabs-period"]').click();
        cy.get('[data-test="thematicdialog-periodtab"]').should('be.visible');
        cy.get('[data-test="periodtypeselect"]').click();
        cy.get('[data-value="Yearly"]').click();

        cy.get('[data-test="thematicdialog-tabs-orgunits"]').click();

        cy.get('[data-test="thematicdialog-orgunitstab"]').should('be.visible');

        // TODO: This is a bug!  The orgunit error clears by navigating to the orgunit tab and waiting for the levels to load.

        cy.get('[data-test="orgunitlevelselect"]').should('be.visible');

        cy.get('[data-test="layeredit-addbtn"]').click();
        cy.get('[data-test="thematicdialog"]')
            .should('have.length', 0)
            .should('not.be.visible');

        cy.getReduxState(state => state.map.mapViews).should('have.length', 1);
        cy.getReduxState(state => state.map.mapViews[0].data).should(
            'have.length',
            12
        );

        const card = cy
            .get('[data-test="layercard"]')
            .should('have.length', 1)
            .contains('VCCT post-test couns rate'); // This is how it appears in the test DB
        card.get('[data-test="layerlegend"]').should('have.length', 1);
        card.get('[data-test="layerlegend-item"]').should('have.length', 5);
        card.get('[data-test="layercard"] [data-test="layertoolbar"]').should(
            'have.length',
            1
        );
    });
});
