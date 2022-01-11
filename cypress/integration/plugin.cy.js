import { EXTENDED_TIMEOUT } from '../support/util';

const SYSTEM_SETTINGS_ENDPOINT = { method: 'GET', url: /\/systemSettings\// };

// const pluginUrl = '/plugin.html?id=';
const pluginUrl = '/plugin.html';

describe('Basemap checks for plugin', () => {
    it('open map with basemap = none uses default basemap set to not visible', () => {
        cy.intercept({ method: 'GET', url: /\/maps\/aVYDp6FYyFU/ }, req => {
            delete req.headers['if-none-match'];
            req.continue(res => {
                expect(res).to.exist;
                expect(res.body).to.exist;
                res.body.basemap = 'none';
                res.send({ body: res.body });
            });
        }).as('openMap');

        // cy.visit(`${pluginUrl}aVYDp6FYyFU`, EXTENDED_TIMEOUT);
        cy.visit(pluginUrl);
        cy.get('#inputMapID')
            .clear()
            .type('aVYDp6FYyFU');
        cy.get('#btnLoadPlugin').click();
        cy.wait('@openMap');

        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible');

        cy.get('#cypressBasemapId')
            .contains('osmLight')
            .should('be.visible');
        cy.get('#cypressBasemapVisible')
            .contains('no')
            .should('be.visible');
        cy.get('#cypressMapViews')
            .contains('thematic thematic')
            .should('be.visible');
    });

    it('open map with basemap = object uses id from the object', () => {
        cy.intercept({ method: 'GET', url: /\/maps\/zDP78aJU8nX/ }, req => {
            delete req.headers['if-none-match'];
            req.continue(res => {
                expect(res).to.exist;
                expect(res.body).to.exist;
                res.body.basemap = { id: 'openStreetMap' };
                res.send({ body: res.body });
            });
        }).as('openMap');

        // cy.visit(`${pluginUrl}zDP78aJU8nX`, EXTENDED_TIMEOUT);
        cy.visit(pluginUrl);
        cy.get('#inputMapID')
            .clear()
            .type('zDP78aJU8nX');
        cy.get('#btnLoadPlugin').click();
        cy.wait('@openMap');

        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible');

        cy.get('#cypressBasemapId')
            .contains('openStreetMap')
            .should('be.visible');
        cy.get('#cypressBasemapVisible')
            .contains('yes')
            .should('be.visible');
    });

    it('open map with external basemap string', () => {
        cy.intercept({ method: 'GET', url: /\/maps\/qTfO4YkQ9xW/ }, req => {
            delete req.headers['if-none-match'];
            req.continue(res => {
                expect(res).to.exist;
                expect(res.body).to.exist;
                res.body.basemap = 'LOw2p0kPwua';
                res.send({ body: res.body });
            });
        }).as('openMap');

        // cy.visit(`${pluginUrl}qTfO4YkQ9xW`, EXTENDED_TIMEOUT);
        cy.visit(pluginUrl);
        cy.get('#inputMapID')
            .clear()
            .type('qTfO4YkQ9xW');
        cy.get('#btnLoadPlugin').click();
        cy.wait('@openMap');

        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible');

        cy.get('#cypressBasemapId')
            .contains('LOw2p0kPwua')
            .should('be.visible');
        cy.get('#cypressBasemapVisible')
            .contains('yes')
            .should('be.visible');
    });

    it('open map with no basemap uses fallback basemap (OSM Light) when system default basemap is not set', () => {
        cy.intercept(SYSTEM_SETTINGS_ENDPOINT, req => {
            delete req.headers['if-none-match'];
            req.continue(res => {
                delete res.body.keyDefaultBaseMap;

                res.send({
                    body: res.body,
                });
            });
        });
        cy.intercept({ method: 'GET', url: /\/maps\/ZugJzZ7xxRW/ }, req => {
            delete req.headers['if-none-match'];
            req.continue(res => {
                expect(res).to.exist;
                expect(res.body).to.exist;
                delete res.body.basemap;
                res.send({ body: res.body });
            });
        }).as('openMap');

        // cy.visit(`${pluginUrl}ZugJzZ7xxRW`, EXTENDED_TIMEOUT);
        cy.visit(pluginUrl);
        cy.get('#inputMapID')
            .clear()
            .type('ZugJzZ7xxRW');
        cy.get('#btnLoadPlugin').click();
        cy.wait('@openMap');

        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible');

        cy.get('#cypressBasemapId')
            .contains('osmLight')
            .should('be.visible');
        cy.get('#cypressBasemapVisible')
            .contains('yes')
            .should('be.visible');
    });

    it('open map with unknown basemap uses system default basemap (which is set to an external basemap)', () => {
        cy.intercept(SYSTEM_SETTINGS_ENDPOINT, req => {
            delete req.headers['if-none-match'];
            req.continue(res => {
                res.body.keyDefaultBaseMap = 'wNIQ8pNvSQd';

                res.send({
                    body: res.body,
                });
            });
        });
        cy.intercept({ method: 'GET', url: /\/maps\/ZBjCfSaLSqD/ }, req => {
            delete req.headers['if-none-match'];
            req.continue(res => {
                expect(res).to.exist;
                expect(res.body).to.exist;
                res.body.basemap = 'unknoWNvSQd';
                res.send({ body: res.body });
            });
        }).as('openMap');

        // cy.visit(`${pluginUrl}ZBjCfSaLSqD`, EXTENDED_TIMEOUT);
        cy.visit(pluginUrl);
        cy.get('#inputMapID')
            .clear()
            .type('ZBjCfSaLSqD');
        cy.get('#btnLoadPlugin').click();
        cy.wait('@openMap');

        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible');

        cy.get('#cypressBasemapId')
            .contains('wNIQ8pNvSQd')
            .should('be.visible');
        cy.get('#cypressBasemapVisible')
            .contains('yes')
            .should('be.visible');
    });

    it('open map with unknown basemap uses fallback basemap (OSM Light) when system default basemap is invalid', () => {
        cy.intercept(SYSTEM_SETTINGS_ENDPOINT, req => {
            delete req.headers['if-none-match'];
            req.continue(res => {
                res.body.keyDefaultBaseMap = 'noexist';

                res.send({
                    body: res.body,
                });
            });
        });
        cy.intercept({ method: 'GET', url: /\/maps\/wIIoj44X77r/ }, req => {
            delete req.headers['if-none-match'];
            req.continue(res => {
                expect(res).to.exist;
                expect(res.body).to.exist;
                res.body.basemap = 'unknoWNvSQd';
                res.send({ body: res.body });
            });
        }).as('openMap');

        // cy.visit(`${pluginUrl}wIIoj44X77r`, EXTENDED_TIMEOUT);
        cy.visit(pluginUrl);
        cy.get('#inputMapID')
            .clear()
            .type('wIIoj44X77r');
        cy.get('#btnLoadPlugin').click();
        cy.wait('@openMap');

        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible');

        cy.get('#cypressBasemapId')
            .contains('osmLight')
            .should('be.visible');
        cy.get('#cypressBasemapVisible')
            .contains('yes')
            .should('be.visible');
    });

    it('open map with external basemap uses fallback basemap (OSM Light) when externalMapLayers request fails', () => {
        cy.intercept('externalMapLayers?*', { statusCode: 409 });
        cy.intercept({ method: 'GET', url: /\/maps\/voX07ulo2Bq/ }, req => {
            delete req.headers['if-none-match'];
            req.continue(res => {
                expect(res).to.exist;
                expect(res.body).to.exist;
                res.body.basemap = 'LOw2p0kPwua';
                res.send({ body: res.body });
            });
        }).as('openMap');

        // cy.visit(`${pluginUrl}voX07ulo2Bq`, EXTENDED_TIMEOUT);
        cy.visit(pluginUrl);
        cy.get('#inputMapID')
            .clear()
            .type('voX07ulo2Bq');
        cy.get('#btnLoadPlugin').click();
        cy.wait('@openMap');

        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible');

        cy.get('#cypressBasemapId')
            .contains('osmLight')
            .should('be.visible');
        cy.get('#cypressBasemapVisible')
            .contains('yes')
            .should('be.visible');
    });

    it('open map with internal basemap when externalMapLayers request fails', () => {
        cy.intercept('externalMapLayers?*', { statusCode: 409 });
        cy.intercept({ method: 'GET', url: /\/maps\/voX07ulo2Bq/ }, req => {
            delete req.headers['if-none-match'];
            req.continue(res => {
                expect(res).to.exist;
                expect(res.body).to.exist;
                res.body.basemap = 'bingDark';
                res.send({ body: res.body });
            });
        }).as('openMap');

        // cy.visit(`${pluginUrl}voX07ulo2Bq`, EXTENDED_TIMEOUT);
        cy.visit(pluginUrl);
        cy.get('#inputMapID')
            .clear()
            .type('voX07ulo2Bq');
        cy.get('#btnLoadPlugin').click();
        cy.wait('@openMap');

        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible');

        cy.get('#cypressBasemapId')
            .contains('bingDark')
            .should('be.visible');
        cy.get('#cypressBasemapVisible')
            .contains('yes')
            .should('be.visible');
    });
});
