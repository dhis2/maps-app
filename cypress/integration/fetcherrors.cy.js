import { ThematicLayer } from '../elements/thematic_layer.js'
import { EXTENDED_TIMEOUT } from '../support/util.js'

describe('Fetch errors', () => {
    it('non-existing map id does not crash app', () => {
        cy.intercept('GET', '**/maps/nonexisting*').as('getMap')

        cy.visit('/?id=nonexisting')

        cy.wait('@getMap')

        cy.getByDataTest('layercard', EXTENDED_TIMEOUT).should('not.exist')
        cy.getByDataTest('basemapcard', EXTENDED_TIMEOUT).should('be.visible')
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')
    })

    it('non-existing currentAnalyticalObject does not crash app', () => {
        cy.intercept(
            'GET',
            '/userDataStore/analytics/currentAnalyticalObject',
            {
                statusCode: 404,
            }
        )

        cy.visit('/?currentAnalyticalObject=true')

        cy.getByDataTest('layercard', EXTENDED_TIMEOUT).should('not.exist')
        cy.getByDataTest('basemapcard', EXTENDED_TIMEOUT).should('be.visible')
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')
    })

    // Skipped: needs to be re-written or removed following changes to the org unit component
    it.skip('error in org units request does not crash app', () => {
        cy.intercept('GET', 'organisationUnits?*', {
            statusCode: 409,
        })

        cy.visit('/')

        cy.getByDataTest('layercard', EXTENDED_TIMEOUT).should('not.exist')
        cy.getByDataTest('basemapcard', EXTENDED_TIMEOUT).should('be.visible')
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')
    })

    it('failed timeline thematic layer does not crash app', () => {
        cy.intercept('GET', '**/api/**/analytics*', { statusCode: 500 })

        cy.visit('/')

        const Layer = new ThematicLayer()
        Layer.openDialog('Thematic')
            .selectItemType('Indicators')
            .selectIndicatorGroup('ANC')
            .selectIndicator('ANC 1 Coverage')
            .selectTab('Period')
            .selectPeriodType({
                periodType: 'QUARTERLY',
                periodDimension: 'relative',
                n: 2,
            })

        cy.get('[type="radio"]').check('TIMELINE')
        cy.getByDataTest('dhis2-uicore-modalactions')
            .contains('Add layer')
            .click()

        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')
        cy.getByDataTest('basemapcard', EXTENDED_TIMEOUT).should('be.visible')
        cy.getByDataTest('load-error-noticebox', EXTENDED_TIMEOUT).within(
            () => {
                cy.contains('Failed to load layer').should('be.visible')
            }
        )
    })

    // TODO - need to make changes in analytics CachedDataProvider to make this test pass
    it.skip('error in external layers request does not crash app', () => {
        cy.intercept('GET', 'externalMapLayers?*', {
            statusCode: 409,
        })

        cy.visit('/')

        cy.getByDataTest('layercard', EXTENDED_TIMEOUT).should('not.exist')
        cy.getByDataTest('basemapcard', EXTENDED_TIMEOUT).should('be.visible')
        cy.getByDataTest('basemaplist', EXTENDED_TIMEOUT)
            .children()
            .should('have.length', 6)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')
    })
})
