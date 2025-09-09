import { EXTENDED_TIMEOUT } from '../../support/util.js'

// values for these constants comes from the externalMapLayersWithGeojson.json fixture
const OVERLAY_TITLE = 'Feature geojson'
const GEOJSON_URL =
    'https://dhis2.github.io/maps-app/public/temp/BandajumaClinic.geojson'

Cypress.on('uncaught:exception', (err) => {
    if (
        err.message.includes(
            'ResizeObserver loop completed with undelivered notifications.'
        )
    ) {
        return false
    }
})

describe('GeoJSON URL Layer', () => {
    it('adds a geojson url layer', () => {
        cy.intercept('externalMapLayers?*', {
            fixture: 'externalMapLayersWithGeojson.json',
        }).as('externalMapLayers')

        cy.visit('/')

        cy.wait('@externalMapLayers', EXTENDED_TIMEOUT)

        // add a geojson layer (provided by the fixture)
        cy.getByDataTest('add-layer-button').click()

        const dataTest = `addlayeritem-${`${OVERLAY_TITLE}`
            .toLowerCase()
            .replace(/\s/g, '_')}`

        cy.getByDataTest(dataTest).click()

        cy.getByDataTest('dhis2-uicore-modaltitle')
            .contains('Add new feature layer')
            .should('be.visible')

        cy.intercept(GEOJSON_URL, {
            fixture: 'feature.geojson',
        }).as('geojson')

        cy.getByDataTest('layeredit').contains('Add layer').click()

        cy.wait('@geojson')

        // check that loading completes and the layer card is present
        cy.getByDataTest('map-loading-mask').should('not.exist')

        cy.getByDataTest('layercard')
            .contains(OVERLAY_TITLE)
            .should('be.visible')

        cy.getByDataTest('load-error-noticebox').should('not.exist')

        // open the data table
        cy.getByDataTest('moremenubutton').first().click()

        cy.getByDataTest('more-menu')
            .find('li')
            .not('.disabled')
            .should('have.length', 5)

        cy.getByDataTest('more-menu')
            .find('li')
            .contains('Show data table')
            .click()

        // check that the data table looks correct
        cy.getByDataTest('bottom-panel').should('be.visible')

        cy.getByDataTest('bottom-panel')
            .find('tbody')
            .find('tr')
            .should('have.length', 1)

        // open the feature panel by clicking on the row
        cy.getByDataTest('bottom-panel')
            .find('tbody')
            .find('tr')
            .find('td')
            .first()
            .click()

        // check that Feature profile is displayed
        cy.getByDataTest('details-panel')
            .findByDataTest('feature-profile-header')
            .contains(OVERLAY_TITLE)
            .should('be.visible')
    })

    it('handles a 404 error', () => {
        cy.intercept('externalMapLayers?*', {
            fixture: 'externalMapLayersWithGeojson.json',
        }).as('externalMapLayers')

        cy.visit('/')

        cy.wait('@externalMapLayers', EXTENDED_TIMEOUT)

        // add a geojson layer (provided by the fixture)
        cy.getByDataTest('add-layer-button').click()

        const dataTest = `addlayeritem-${`${OVERLAY_TITLE}`
            .toLowerCase()
            .replace(/\s/g, '_')}`

        cy.getByDataTest(dataTest).click()

        cy.getByDataTest('dhis2-uicore-modaltitle')
            .contains('Add new feature layer')
            .should('be.visible')

        cy.intercept(GEOJSON_URL, { statusCode: 404 }).as('geojson')

        cy.getByDataTest('layeredit').contains('Add layer').click()

        cy.wait('@geojson')

        // check that loading completes and the layer card is present
        cy.getByDataTest('map-loading-mask').should('not.exist')

        cy.getByDataTest('layercard')
            .contains(OVERLAY_TITLE)
            .should('be.visible')

        // check that an error is displayed in the layer card
        cy.getByDataTest('load-error-noticebox').should('be.visible')
        cy.getByDataTest('load-error-noticebox')
            .find('h6')
            .contains('Failed to load layer')
            .should('be.visible')
        cy.getByDataTest('dhis2-uicore-noticebox-content-message')
            .contains(
                'There was a problem with this layer. Contact a system administrator.'
            )
            .should('be.visible')

        // remove the layer
        cy.getByDataTest('moremenubutton').first().click()

        cy.getByDataTest('more-menu')
            .find('li')
            .not('.disabled')
            .should('have.length', 3) // Edit layer, Remove layer, divider line

        cy.getByDataTest('more-menu')
            .find('li')
            .contains('Remove layer')
            .click()

        cy.getByDataTest('layercard').should('not.exist')
    })

    it('handles a 400 error', () => {
        cy.intercept('externalMapLayers?*', {
            fixture: 'externalMapLayersWithGeojson.json',
        }).as('externalMapLayers')

        cy.visit('/')

        cy.wait('@externalMapLayers', EXTENDED_TIMEOUT)

        // add a geojson layer (provided by the fixture)
        cy.getByDataTest('add-layer-button').click()

        const dataTest = `addlayeritem-${`${OVERLAY_TITLE}`
            .toLowerCase()
            .replace(/\s/g, '_')}`

        cy.getByDataTest(dataTest).click()

        cy.getByDataTest('dhis2-uicore-modaltitle')
            .contains('Add new feature layer')
            .should('be.visible')

        cy.intercept(GEOJSON_URL, {
            statusCode: 400,
        }).as('geojson')

        cy.getByDataTest('layeredit').contains('Add layer').click()

        cy.wait('@geojson')

        // check that loading completes and the layer card is present
        cy.getByDataTest('map-loading-mask').should('not.exist')

        cy.getByDataTest('layercard')
            .contains(OVERLAY_TITLE)
            .should('be.visible')

        // check that an error is displayed in the layer card
        cy.getByDataTest('load-error-noticebox').should('be.visible')
        cy.getByDataTest('load-error-noticebox')
            .find('h6')
            .contains('Failed to load layer')
            .should('be.visible')
        cy.getByDataTest('dhis2-uicore-noticebox-content-message')
            .contains(
                'There was a problem with this layer. Contact a system administrator.'
            )
            .should('be.visible')

        // remove the layer
        cy.getByDataTest('moremenubutton').first().click()

        cy.getByDataTest('more-menu')
            .find('li')
            .not('.disabled')
            .should('have.length', 3) // Edit layer, Remove layer, divider line

        cy.getByDataTest('more-menu')
            .find('li')
            .contains('Remove layer')
            .click()

        cy.getByDataTest('layercard').should('not.exist')
    })
})
