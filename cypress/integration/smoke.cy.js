import { ThematicLayer } from '../elements/thematic_layer';
import { EXTENDED_TIMEOUT } from '../support/util';

context('Smoke Test', () => {
    it('loads', () => {
        cy.visit('/', EXTENDED_TIMEOUT);
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible');
        cy.title().should('equal', 'DHIS2 Maps');
    });

    it('loads with map id', () => {
        cy.intercept({ method: 'POST', url: /dataStatistics/ }).as(
            'postDataStatistics'
        );

        cy.visit('/?id=ytkZY3ChM6J', EXTENDED_TIMEOUT); //ANC: 3rd visit coverage last year by district

        cy.wait('@postDataStatistics')
            .its('response.statusCode')
            .should('eq', 201);

        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible');

        const Layer = new ThematicLayer();
        Layer.validateCardTitle('ANC 3 Coverage');
    });

    it('loads currentAnalyticalObject', () => {
        cy.intercept('**/userDataStore/analytics/settings', {
            fixture: 'analyticalObject.json',
        });

        cy.visit('/?currentAnalyticalObject=true', EXTENDED_TIMEOUT);
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible');

        cy.contains('button', 'Proceed').click();

        const Layer = new ThematicLayer();
        Layer.validateCardTitle('ANC 1 Coverage');
        cy.get('canvas.maplibregl-canvas').should('be.visible');
    });
});
