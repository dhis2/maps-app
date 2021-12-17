import { ThematicLayer } from '../elements/thematic_layer';
import { getApiBaseUrl, EXTENDED_TIMEOUT } from '../support/util';
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

    it('does not include Bing basemaps if no Bing api key', () => {
        cy.intercept({ method: 'GET', url: 'systemSettings?*' }, req => {
            delete req.headers['if-none-match'];
            req.continue(res => {
                delete res.body.keyBingMapsApiKey;

                res.send({
                    body: res.body,
                });
            });
        });

        cy.visit('/');

        cy.get('[data-test="basemaplist"]', EXTENDED_TIMEOUT)
            .children()
            .should('have.length', 5);
    });

    it('includes Bing basemaps when Bing api key present', () => {
        cy.intercept({ method: 'GET', url: 'systemSettings?*' }, req => {
            delete req.headers['if-none-match'];
            req.continue();
        });

        cy.visit('/');

        cy.get('[data-test="basemaplist"]', EXTENDED_TIMEOUT)
            .children()
            .should('have.length.greaterThan', 5);

        cy.get('[data-test="basemaplistitem-name"]')
            .contains('Bing Road')
            .should('be.visible');
    });
});
