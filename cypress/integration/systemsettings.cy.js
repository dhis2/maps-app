import { ThematicLayer } from '../elements/thematic_layer';
import { EXTENDED_TIMEOUT } from '../support/util';

const SYSTEM_SETTINGS_ENDPOINT = { method: 'GET', url: 'systemSettings?*' };

describe('systemSettings', () => {
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
        cy.intercept(SYSTEM_SETTINGS_ENDPOINT, req => {
            delete req.headers['if-none-match'];
            req.continue();
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
            .should('have.length', 5);
    });

    it('includes Bing basemaps when Bing api key present', () => {
        cy.intercept(SYSTEM_SETTINGS_ENDPOINT, req => {
            delete req.headers['if-none-match'];
            req.continue();
        });

        cy.visit('/');

        cy.getByDataTest('basemaplist', EXTENDED_TIMEOUT)
            .children()
            .should('have.length.greaterThan', 5);

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
        });

        cy.visit('/');

        const Layer = new ThematicLayer();

        Layer.openDialog('Thematic').selectTab('Period');
        cy.getByDataTest('relative-period-select')
            .contains('Last 6 months')
            .should('be.visible');
        cy.getByDataTest('relative-period-select')
            .contains('Last 12 months')
            .should('not.exist');
    });

    it('uses Last 12 months as default relative period', () => {
        cy.intercept(SYSTEM_SETTINGS_ENDPOINT, req => {
            delete req.headers['if-none-match'];
            req.continue();
        });

        cy.visit('/');

        const Layer = new ThematicLayer();

        Layer.openDialog('Thematic').selectTab('Period');
        cy.getByDataTest('relative-period-select')
            .contains('Last 6 months')
            .should('not.exist');
        cy.getByDataTest('relative-period-select')
            .contains('Last 12 months')
            .should('be.visible');
    });
});
