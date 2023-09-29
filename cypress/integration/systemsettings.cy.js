import { checkBasemap } from '../elements/basemap_card.js'
import { ThematicLayer } from '../elements/thematic_layer.js'
import { EXTENDED_TIMEOUT, getApiBaseUrl } from '../support/util.js'

const SYSTEM_SETTINGS_ENDPOINT = { method: 'GET', url: 'systemSettings?*' }

describe('systemSettings', () => {
    beforeEach(() => {
        cy.intercept(SYSTEM_SETTINGS_ENDPOINT, (req) => {
            delete req.headers['if-none-match']
            req.continue()
        })
    })

    it('does not include Weekly period type when weekly periods hidden in system settings', () => {
        cy.intercept(SYSTEM_SETTINGS_ENDPOINT, (req) => {
            delete req.headers['if-none-match']
            req.continue((res) => {
                res.body.keyHideWeeklyPeriods = true

                res.send({
                    body: res.body,
                })
            })
        })

        cy.visit('/')

        const Layer = new ThematicLayer()

        Layer.openDialog('Thematic').selectTab('Period')

        cy.getByDataTest('periodtypeselect-content').click()

        cy.getByDataTest('dhis2-uicore-select-menu-menuwrapper')
            .contains('Bi-weekly')
            .should('be.visible')

        cy.getByDataTest('dhis2-uicore-select-menu-menuwrapper')
            .contains('Weekly')
            .should('not.exist')
    })

    it('includes Weekly period type when weekly periods not hidden in system settings', () => {
        cy.visit('/')

        const Layer = new ThematicLayer()

        Layer.openDialog('Thematic').selectTab('Period')

        cy.getByDataTest('periodtypeselect-content').click()

        cy.getByDataTest('dhis2-uicore-select-menu-menuwrapper')
            .contains('Bi-weekly')
            .should('be.visible')

        cy.getByDataTest('dhis2-uicore-select-menu-menuwrapper')
            .contains('Weekly')
            .should('be.visible')
    })

    it('does not include Bing basemaps if no Bing api key', () => {
        cy.intercept(SYSTEM_SETTINGS_ENDPOINT, (req) => {
            delete req.headers['if-none-match']
            req.continue((res) => {
                delete res.body.keyBingMapsApiKey

                res.send({
                    body: res.body,
                })
            })
        })

        cy.visit('/')

        cy.getByDataTest('basemaplist', EXTENDED_TIMEOUT)
            .children()
            .should('have.length', 5)
    })

    it('includes Bing basemaps when Bing api key present', () => {
        cy.visit('/')

        cy.getByDataTest('basemaplist', EXTENDED_TIMEOUT)
            .children()
            .should('have.length.greaterThan', 5)

        cy.getByDataTest('basemaplistitem-name')
            .contains('Bing Road')
            .should('be.visible')
    })

    it('uses Last 6 months as default relative period', () => {
        // set relative period to 6 months
        cy.request({
            method: 'POST',
            url: `${getApiBaseUrl()}/api/systemSettings/keyAnalysisRelativePeriod`,
            headers: {
                'Content-Type': 'text/plain',
            },
            body: 'LAST_6_MONTHS',
        }).then((response) => {
            expect(response.status).to.eq(200)

            cy.visit('/', EXTENDED_TIMEOUT)
            cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

            const Layer = new ThematicLayer()

            Layer.openDialog('Thematic')
                .selectIndicatorGroup('HIV')
                .selectIndicatorGroup('ANC')
                .selectIndicator('ANC 1 Coverage')
                .selectTab('Org Units')
                .selectOu('Sierra Leone')
                .addToMap()

            Layer.validateCardPeriod('Last 6 months')
        })
    })

    it('uses Last 12 months as default relative period', () => {
        // set relative period to 12 months
        cy.request({
            method: 'POST',
            url: `${getApiBaseUrl()}/api/systemSettings/keyAnalysisRelativePeriod`,
            headers: {
                'Content-Type': 'text/plain',
            },
            body: 'LAST_12_MONTHS',
        }).then((response) => {
            expect(response.status).to.eq(200)

            cy.visit('/', EXTENDED_TIMEOUT)
            cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

            const Layer = new ThematicLayer()

            Layer.openDialog('Thematic')
                .selectIndicatorGroup('HIV')
                .selectIndicatorGroup('ANC')
                .selectIndicator('ANC 1 Coverage')
                .selectTab('Org Units')
                .selectOu('Sierra Leone')
                .addToMap()

            Layer.validateCardPeriod('Last 12 months')
        })
    })

    it('uses the correct default basemap', () => {
        cy.request({
            method: 'POST',
            url: `${getApiBaseUrl()}/api/systemSettings/keyDefaultBaseMap`,
            headers: {
                'Content-Type': 'text/plain',
            },
            body: 'wNIQ8pNvSQd',
        }).then((response) => {
            expect(response.status).to.eq(200)

            cy.visit('/', EXTENDED_TIMEOUT)
            cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

            checkBasemap.activeBasemap('Terrain basemap')

            cy.request({
                method: 'POST',
                url: `${getApiBaseUrl()}/api/systemSettings/keyDefaultBaseMap`,
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: 'osmLight',
            }).then((response) => {
                expect(response.status).to.eq(200)

                cy.visit('/', EXTENDED_TIMEOUT)
                cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

                checkBasemap.activeBasemap('OSM Light')
            })
        })
    })
})
