import { checkBasemap } from '../elements/basemap_card.js'
import { ThematicLayer } from '../elements/thematic_layer.js'
import { EXTENDED_TIMEOUT } from '../support/util.js'

const SYSTEM_SETTINGS_ENDPOINT = {
    method: 'GET',
    url: 'systemSettings?*',
    times: 1,
}

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

        cy.getByDataTest('basemaplistitem-name')
            .contains('Bing Road')
            .should('not.exist')
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
        cy.intercept(SYSTEM_SETTINGS_ENDPOINT, (req) => {
            delete req.headers['if-none-match']
            req.continue((res) => {
                res.body.keyAnalysisRelativePeriod = 'LAST_6_MONTHS'
                res.send({
                    body: res.body,
                })
            })
        }).as('getSystemSettings6months')

        cy.visit('/', EXTENDED_TIMEOUT)
        // cy.wait('@getSystemSettings6months')
        cy.wait(2000) // eslint-disable-line cypress/no-unnecessary-waiting

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
        // })
    })

    it('uses Last 12 months as default relative period', () => {
        cy.intercept(SYSTEM_SETTINGS_ENDPOINT, (req) => {
            delete req.headers['if-none-match']
            req.continue((res) => {
                res.body.keyAnalysisRelativePeriod = 'LAST_12_MONTHS'
                res.send({
                    body: res.body,
                })
            })
        }).as('getSystemSettings12months')

        cy.visit('/', EXTENDED_TIMEOUT)

        // cy.wait('@getSystemSettings12months')
        cy.wait(2000) // eslint-disable-line cypress/no-unnecessary-waiting

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

    it('uses the correct default basemap', () => {
        cy.intercept(SYSTEM_SETTINGS_ENDPOINT, (req) => {
            delete req.headers['if-none-match']
            req.continue((res) => {
                res.body.keyDefaultBaseMap = 'LOw2p0kPwua'

                res.send({
                    body: res.body,
                })
            })
        })

        cy.visit('/', EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        checkBasemap.activeBasemap('Dark basemap')
    })
})
