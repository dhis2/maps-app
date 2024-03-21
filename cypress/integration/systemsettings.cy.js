import { ThematicLayer } from '../elements/thematic_layer';
import { EXTENDED_TIMEOUT } from '../support/util';

const SYSTEM_SETTINGS_ENDPOINT = { method: 'GET', url: 'systemSettings?*' };

describe('systemSettings', () => {
    beforeEach(() => {
        cy.intercept(SYSTEM_SETTINGS_ENDPOINT, req => {
            delete req.headers['if-none-match'];
            req.continue();
        });
    });

    it('does not include Weekly period type when weekly periods hidden in system settings', () => {
        cy.intercept(SYSTEM_SETTINGS_ENDPOINT, req => {
            delete req.headers['if-none-match'];
            req.continue(res => {
                res.body.keyHideWeeklyPeriods = true;

                res.send({
                    body: res.body,
                });
            });
        });

        cy.visit('/');

        const Layer = new ThematicLayer();

        Layer.openDialog('Thematic').selectTab('Period');

        cy.getByDataTest('periodtypeselect-content').click();

        cy.getByDataTest('dhis2-uicore-select-menu-menuwrapper')
            .contains('Bi-weekly')
            .should('be.visible');

        cy.getByDataTest('dhis2-uicore-select-menu-menuwrapper')
            .contains('Weekly')
            .should('not.exist');
    });

    it('includes Weekly period type when weekly periods not hidden in system settings', () => {
        cy.visit('/');

        const Layer = new ThematicLayer();

        Layer.openDialog('Thematic').selectTab('Period');

        cy.getByDataTest('periodtypeselect-content').click();

        cy.getByDataTest('dhis2-uicore-select-menu-menuwrapper')
            .contains('Bi-weekly')
            .should('be.visible');

        cy.getByDataTest('dhis2-uicore-select-menu-menuwrapper')
            .contains('Weekly')
            .should('be.visible');
    });

    it('does not include Bing basemaps if no Bing api key', () => {
        cy.intercept(SYSTEM_SETTINGS_ENDPOINT, req => {
            delete req.headers['if-none-match'];
            req.continue(res => {
                delete res.body.keyBingMapsApiKey;

                res.send({
                    body: res.body,
                });
            });
        });

        cy.visit('/');

        cy.getByDataTest('basemaplist', EXTENDED_TIMEOUT)
            .children()
            .should('have.length', 3);
    });

    it('includes Bing basemaps when Bing api key present', () => {
        cy.visit('/');

        cy.getByDataTest('basemaplist', EXTENDED_TIMEOUT)
            .children()
            .should('have.length.greaterThan', 7);

        cy.getByDataTest('basemaplistitem-name')
            .contains('Bing Road')
            .should('be.visible');
    });

    it('uses Last 6 months as default relative period', () => {
        cy.intercept(SYSTEM_SETTINGS_ENDPOINT, req => {
            delete req.headers['if-none-match'];
            req.continue(res => {
                res.body.keyAnalysisRelativePeriod = 'LAST_6_MONTHS';

                res.send({
                    body: res.body,
                });
            });
        }).as('getSystemSettings6months');

        cy.visit('/', EXTENDED_TIMEOUT);
        cy.wait('@getSystemSettings6months');
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible');

        const Layer = new ThematicLayer();

        Layer.openDialog('Thematic')
            .selectIndicatorGroup('HIV')
            .selectIndicator('VCCT post-test counselling rate')
            .addToMap();

        Layer.validateCardPeriod('Last 6 months');
    });

    it('uses Last 12 months as default relative period', () => {
        cy.intercept(SYSTEM_SETTINGS_ENDPOINT, req => {
            delete req.headers['if-none-match'];
            req.continue(res => {
                res.body.keyAnalysisRelativePeriod = 'LAST_12_MONTHS';

                res.send({
                    body: res.body,
                });
            });
        }).as('getSystemSettings12months');

        cy.visit('/', EXTENDED_TIMEOUT);
        cy.wait('@getSystemSettings12months');

        const Layer = new ThematicLayer();

        Layer.openDialog('Thematic')
            .selectIndicatorGroup('HIV')
            .selectIndicator('VCCT post-test counselling rate')
            .addToMap();

        Layer.validateCardPeriod('Last 12 months');
    });
});
