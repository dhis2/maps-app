import { ThematicLayer } from '../elements/thematic_layer';
import { getApiBaseUrl } from '../support/util';
import { analyticalObject } from '../fixtures/analyticalObject';

context('Smoke Test', () => {
    it('loads', () => {
        cy.visit('/');
        cy.title().should('equal', 'DHIS2 Maps');
    });

    it('loads with map id', () => {
        cy.visit('/?id=ytkZY3ChM6J'); //ANC: 3rd visit coverage last year by district

        const Layer = new ThematicLayer();
        Layer.validateCardTitle('ANC 3 Coverage');
    });

    it('loads currentAnalyticalObject', () => {
        cy.request({
            method: 'DELETE',
            url: `${getApiBaseUrl()}/api/userDataStore/analytics/currentAnalyticalObject`,
            failOnStatusCode: false,
        }).then(() => {
            cy.request({
                method: 'POST',
                url: `${getApiBaseUrl()}/api/userDataStore/analytics/currentAnalyticalObject`,
                headers: {
                    'content-type': 'application/json',
                },
                body: analyticalObject,
            }).then(response => {
                expect(response.status).to.equal(201);
                cy.visit('/?currentAnalyticalObject=true');

                cy.contains('button', 'Proceed').click();

                const Layer = new ThematicLayer();
                Layer.validateCardTitle('ANC 1 Coverage');
                cy.get('canvas.maplibregl-canvas').should('be.visible');
            });
        });
    });

    it('opens the interpretations panel for a map', () => {
        cy.visit('/');

        cy.contains('File').click();
        cy.get('[data-test="file-menu-container"]').should('be.visible');

        cy.get('[data-test="file-menu-open"]')
            .should('be.visible')
            .click();

        cy.get('[data-test="open-file-dialog-modal-name-filter"]')
            .find('input')
            .focus()
            .type('ANC: LLITN coverage district and facility');

        cy.get('[data-test="open-file-dialog-modal"')
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
