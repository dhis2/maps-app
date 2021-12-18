// import { ThematicLayer } from '../elements/thematic_layer';

context('Fetch errors', () => {
    it('non-existing map id', () => {
        cy.visit('/?id=nonexisting');

        cy.getByDataTest('layercard').should('not.exist');
        cy.get('canvas').should('be.visible');
    });

    it('currentAnalyticalObject doesnt exist', () => {
        cy.intercept(
            'GET',
            '/userDataStore/analytics/currentAnalyticalObject',
            {
                statusCode: 404,
            }
        ).as('noCurrentAnalyticalObject');

        cy.visit('/?currentAnalyticalObject=true');

        cy.getByDataTest('layercard').should('not.exist');
        cy.get('canvas').should('be.visible');

        // cy.contains('button', 'Proceed').click();

        // const Layer = new ThematicLayer();
        // Layer.validateCardTitle('ANC 1 Coverage');
        // cy.get('canvas.maplibregl-canvas').should('be.visible');

        // it('org units request fails', () => {});

        // it('external layers request fails', () => {});
    });
});
