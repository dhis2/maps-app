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

        cy.wait('@externalMapLayers')
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
        cy.getByDataTest('map-loading-mask').should('not.exist')

        cy.getByDataTest('layercard')
            .contains(OVERLAY_TITLE)
            .should('be.visible')

        cy.getByDataTest('load-error-noticebox').should('not.exist')

        // open the data table and check that there is one row
        cy.getByDataTest('moremenubutton').first().click()

        cy.getByDataTest('more-menu')
            .find('li')
            .not('.disabled')
            .should('have.length', 5)

        cy.getByDataTest('more-menu')
            .find('li')
            .contains('Show data table')
            .click()

        //check that the bottom panel is present
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

    it('handles a url not found error', () => {
        cy.intercept('externalMapLayers?*', {
            fixture: 'externalMapLayersWithGeojson.json',
        }).as('externalMapLayers')

        cy.visit('/')

        cy.wait('@externalMapLayers')
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
        cy.getByDataTest('map-loading-mask').should('not.exist')

        cy.getByDataTest('layercard')
            .contains(OVERLAY_TITLE)
            .should('be.visible')

        cy.getByDataTest('load-error-noticebox').should('be.visible')
        cy.getByDataTest('load-error-noticebox')
            .find('h6')
            .contains('Failed to load layer')
            .should('be.visible')
        cy.getByDataTest('dhis2-uicore-noticebox-content-message')
            .contains('Error: Url to geojson was not found')
            .should('be.visible')

        // open the data table and check that there is one row
        cy.getByDataTest('moremenubutton').first().click()

        cy.getByDataTest('more-menu')
            .find('li')
            .not('.disabled')
            .should('have.length', 2)

        cy.getByDataTest('more-menu')
            .find('li')
            .contains('Remove layer')
            .click()

        cy.getByDataTest('layercard').should('not.exist')
    })

    it('handles a 409 conflict', () => {
        cy.intercept('externalMapLayers?*', {
            fixture: 'externalMapLayersWithGeojson.json',
        }).as('externalMapLayers')

        cy.visit('/')

        cy.wait('@externalMapLayers')
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
        cy.getByDataTest('map-loading-mask').should('not.exist')

        cy.getByDataTest('layercard')
            .contains(OVERLAY_TITLE)
            .should('be.visible')

        cy.getByDataTest('load-error-noticebox').should('be.visible')
        cy.getByDataTest('load-error-noticebox')
            .find('h6')
            .contains('Failed to load layer')
            .should('be.visible')
        cy.getByDataTest('dhis2-uicore-noticebox-content-message')
            .contains('Error: The request for geojson was invalid.')
            .should('be.visible')

        // open the data table and check that there is one row
        cy.getByDataTest('moremenubutton').first().click()

        cy.getByDataTest('more-menu')
            .find('li')
            .not('.disabled')
            .should('have.length', 2)

        cy.getByDataTest('more-menu')
            .find('li')
            .contains('Remove layer')
            .click()

        cy.getByDataTest('layercard').should('not.exist')
    })
})
