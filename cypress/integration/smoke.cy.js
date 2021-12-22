import { ThematicLayer } from '../elements/thematic_layer';
import { analyticalObject } from '../fixtures/analyticalObject';
import { EXTENDED_TIMEOUT } from '../support/util';

context('Smoke Test', () => {
    it('loads', () => {
        cy.visit('/', EXTENDED_TIMEOUT);
        cy.title().should('equal', 'DHIS2 Maps');
    });

    it.skip('loads with map id', () => {
        cy.visit('/?id=ytkZY3ChM6J', EXTENDED_TIMEOUT); //ANC: 3rd visit coverage last year by district

        const Layer = new ThematicLayer();
        Layer.validateCardTitle('ANC 3 Coverage');
    });

    it.skip('loads currentAnalyticalObject', () => {
        cy.intercept('/userDataStore/analytics/currentAnalyticalObject', {
            body: analyticalObject,
        });

        cy.visit('/?currentAnalyticalObject=true', EXTENDED_TIMEOUT);

        cy.contains('button', 'Proceed').click();

        const Layer = new ThematicLayer();
        Layer.validateCardTitle('ANC 1 Coverage');
        cy.get('canvas.maplibregl-canvas').should('be.visible');
    });

    it.skip('opens the interpretations panel for a map', () => {
        cy.visit('/', EXTENDED_TIMEOUT);

        cy.contains('File').click();
        cy.getByDataTest('file-menu-container').should('be.visible');

        cy.getByDataTest('file-menu-open')
            .should('be.visible')
            .click();

        cy.getByDataTest('open-file-dialog-modal-name-filter')
            .find('input')
            .focus()
            .type('ANC: LLITN coverage district and facility');

        cy.getByDataTest('open-file-dialog-modal')
            .contains('ANC: LLITN coverage district and facility')
            .click();

        cy.get('button')
            .contains('Interpretations')
            .click();

        cy.contains('Map details').should('be.visible');
        cy.get('textarea').should(
            'have.attr',
            'placeholder',
            'Write an interpretation'
        );

        cy.get('p')
            .contains(
                'Koinadugu has a very high LLITN coverage despite low density of facilities providing nets.'
            )
            .should('be.visible');
    });
});
