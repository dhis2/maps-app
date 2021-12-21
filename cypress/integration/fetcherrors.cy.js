describe('Fetch errors', () => {
    it('non-existing map id does not crash app', () => {
        cy.visit('/?id=nonexisting');

        cy.getByDataTest('layercard').should('not.exist');
        cy.getByDataTest('basemapcard').should('be.visible');
        cy.get('canvas').should('be.visible');
    });

    it('non-existing currentAnalyticalObject does not crash app', () => {
        cy.intercept(
            'GET',
            '/userDataStore/analytics/currentAnalyticalObject',
            {
                statusCode: 404,
            }
        );

        cy.visit('/?currentAnalyticalObject=true');

        cy.getByDataTest('layercard').should('not.exist');
        cy.getByDataTest('basemapcard').should('be.visible');
        cy.get('canvas').should('be.visible');
    });

    it('error in org units request does not crash app', () => {
        cy.intercept('GET', 'organisationUnits?*', {
            statusCode: 409,
        });

        cy.visit('/');

        cy.getByDataTest('layercard').should('not.exist');
        cy.getByDataTest('basemapcard').should('be.visible');
        cy.get('canvas').should('be.visible');
    });

    it('error in external layers request does not crash app', () => {
        cy.intercept('GET', 'externalMapLayers?*', {
            statusCode: 409,
        });

        cy.visit('/');

        cy.getByDataTest('layercard').should('not.exist');
        cy.getByDataTest('basemapcard').should('be.visible');
        cy.get('canvas').should('be.visible');
    });
});
