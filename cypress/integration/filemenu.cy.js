import { FacilityLayer } from '../elements/facility_layer.js'
import {
    openMap,
    saveAsNewMap,
    saveNewMap,
    renameMap,
    saveExistingMap,
    deleteMap,
} from '../elements/file_menu.js'
import { Layer as OrgUnitLayer } from '../elements/layer.js'
import { ThematicLayer } from '../elements/thematic_layer.js'
import { EXTENDED_TIMEOUT } from '../support/util.js'

const MAP_TITLE = 'test ' + new Date().toUTCString().slice(-24, -4)
const SAVEAS_MAP_TITLE = `${MAP_TITLE}-2`

describe('File menu', () => {
    const FacLayer = new FacilityLayer()
    const ThemLayer = new ThematicLayer()
    const OULayer = new OrgUnitLayer()

    const createMap = (title) => {
        cy.intercept({ method: 'GET', url: /\/indicators/ }).as(
            'fetchIndicators'
        )

        ThemLayer.openDialog('Thematic').selectIndicatorGroup('HIV')

        cy.wait('@fetchIndicators')
        ThemLayer.selectIndicator('VCCT post-test counselling rate')
            .selectTab('Org Units')
            .selectOu('Sierra Leone')
            .addToMap()

        cy.intercept({ method: 'POST', url: 'maps' }, (req) => {
            expect(req.body.mapViews).to.have.length(1)
            req.continue()
        }).as('saveMap')

        cy.intercept({ method: 'POST', url: /dataStatistics/ }).as(
            'postDataStatistics'
        )

        saveNewMap(title)

        cy.wait('@saveMap').its('response.statusCode').should('eq', 201)
        cy.wait('@postDataStatistics')
            .its('response.statusCode')
            .should('eq', 201)
    }

    it.only('saves a new map', () => {
        cy.visit('/', EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        cy.intercept({ method: 'GET', url: /\/maps\// }, (req) => {
            const url = new URL(req.url, window.location.origin)
            const fieldsParam = url.searchParams.get('fields')
            expect(fieldsParam).not.to.include('subscribers')

            req.continue()
        })

        createMap(MAP_TITLE)
    })

    it('renames a map', () => {
        cy.visit('/', EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        const title = 'test ' + new Date().toUTCString().slice(-24, -4)
        const renamedTitle = `renamed ${title}`

        createMap(title)
        const description = 'this is the explanation of the map'

        let fetchMapCount = 0
        cy.intercept({ method: 'GET', url: /\/maps\/[^/]+(\?.*)?$/ }, (req) => {
            const url = new URL(req.url, window.location.origin)
            const fieldsParam = url.searchParams.get('fields')

            fetchMapCount += 1

            if (fetchMapCount === 1) {
                expect(fieldsParam).to.include('subscribers')
            } else if (fetchMapCount === 2) {
                expect(fieldsParam).not.to.include('subscribers')
                expect(fieldsParam).to.include('name')
                expect(fieldsParam).to.include('description')
                expect(fieldsParam).to.include('displayName')
                expect(fieldsParam).to.include('displayDescription')
            }

            req.continue()
        }).as('fetchMap')
        cy.intercept({
            method: 'PUT',
            url: /\/maps\//,
        }).as('renameMap')

        renameMap(renamedTitle, description)
        cy.wait('@renameMap').its('response.statusCode').should('eq', 200)
        // Get visualization calls: original map and updated name and description after rename
        cy.get('@fetchMap.all').should('have.length', 2)

        cy.getByDataTest('dhis2-uicore-alertbar')
            .contains('Rename successful')
            .should('be.visible')

        cy.getByDataTest('map-name').contains(renamedTitle).should('be.visible')

        cy.contains('Interpretations and details').click()
        cy.getByDataTest('details-panel')
            .contains(description)
            .should('be.visible')

        deleteMap(renamedTitle)
    })

    it('handles a failure when renaming the map', () => {
        cy.visit('/', EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        const title = 'test ' + new Date().toUTCString().slice(-24, -4)
        const renamedTitle =
            'renamed ' + new Date().toUTCString().slice(-24, -4)

        createMap(title)
        const description = 'this is the explanation of the map'
        cy.intercept('PUT', /\/maps\//, {
            statusCode: 409,
        }).as('renameMapFailure')
        renameMap(renamedTitle, description)
        cy.wait('@renameMapFailure')
            .its('response.statusCode')
            .should('eq', 409)

        cy.getByDataTest('dhis2-uicore-alertbar')
            .contains('Rename failed')
            .should('be.visible')

        cy.getByDataTest('map-name').contains(title).should('be.visible')

        cy.contains('Interpretations and details').click()
        cy.getByDataTest('details-panel')
            .contains(description)
            .should('not.exist')

        cy.reload(true)

        cy.getByDataTest('map-name').contains(title).should('be.visible')
        cy.getByDataTest('details-panel')
            .contains(description)
            .should('not.exist')

        deleteMap(renamedTitle)
    })

    it.only('save existing as new map', () => {
        cy.visit('/', EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        openMap(MAP_TITLE)

        FacLayer.openDialog('Facilities')
            .selectTab('Organisation Units')
            .selectOu('Bo')
            .selectOuLevel('Facility')
            .addToMap()

        FacLayer.validateDialogClosed(true)

        cy.contains('Facilities')
            .parents('[data-test=layercard]')
            .should('be.visible')

        cy.intercept({ method: 'POST', url: 'maps' }, (req) => {
            expect(req.body.mapViews).to.have.length(2)
            expect(req.body).not.to.have.property('subscribers')
            req.continue()
        }).as('saveAsNewMap')

        cy.intercept({ method: 'POST', url: /dataStatistics/ }).as(
            'postDataStatistics'
        )

        saveAsNewMap(SAVEAS_MAP_TITLE)

        cy.wait('@saveAsNewMap').its('response.statusCode').should('eq', 201)
        cy.wait('@postDataStatistics')
            .its('response.statusCode')
            .should('eq', 201)
    })

    it.only('save changes to existing map', () => {
        cy.visit('/', EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        openMap(SAVEAS_MAP_TITLE)

        ThemLayer.validateCardTitle('VCCT post-test counselling rate')
        OULayer.openDialog('Org units')
            .selectOu('Sierra Leone')
            .selectOuLevel('Chiefdom')
            .addToMap()

        cy.contains('Facilities')
            .parents('[data-test=layercard]')
            .should('be.visible')

        cy.contains('Organisation units')
            .parents('[data-test=layercard]')
            .should('be.visible')

        // subscribe to the Map
        cy.getByDataTest(
            'dhis2-analytics-interpretationsanddetailstoggler'
        ).click()
        cy.intercept('POST', /\/api\/\d+\/maps\/\w+\/subscriber/, (req) => {
            req.continue((res) => {
                expect([200, 201]).to.include(res.statusCode)
            })
        }).as('post-subscriber')
        cy.get('button').contains('Subscribe').should('be.visible')
        cy.get('button').contains('Subscribe').click()
        cy.wait('@post-subscriber')
        cy.get('button').contains('Unsubscribe').should('be.visible')
        cy.getByDataTest(
            'dhis2-analytics-interpretationsanddetailstoggler'
        ).click()
        cy.contains('About this map').should('not.exist')

        cy.intercept(
            {
                method: 'PUT',
                url: /\/maps\//,
            },
            (req) => {
                expect(req.body.mapViews).to.have.length(3)
                req.continue()
            }
        ).as('saveTheExistingMap')

        cy.intercept('GET', /\/maps\/[^/]+(\?.*)?$/).as('getMapAfterSave')

        saveExistingMap()
        cy.wait('@saveTheExistingMap')
            .its('response.statusCode')
            .should('eq', 200)

        cy.wait('@getMapAfterSave').its('response.statusCode').should('eq', 200)
        // check user is still subscribed
        cy.getByDataTest(
            'dhis2-analytics-interpretationsanddetailstoggler'
        ).click()
        cy.contains('About this map').should('be.visible')
        cy.get('button').contains('Unsubscribe').should('be.visible')
        cy.getByDataTest(
            'dhis2-analytics-interpretationsanddetailstoggler'
        ).click()
        cy.contains('About this map').should('not.exist')
    })

    it('save changes to existing map fails', () => {
        cy.visit('/', EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        openMap(MAP_TITLE)

        cy.intercept(
            {
                method: 'PUT',
                url: /\/maps\//,
            },
            { statusCode: 409 }
        ).as('saveFails')

        saveExistingMap()

        cy.wait('@saveFails').its('response.statusCode').should('eq', 409)

        cy.getByDataTest('dhis2-uicore-alertbar')
            .contains('Failed to save map')
            .should('be.visible')
    })

    it('save as new map fails', () => {
        cy.visit('/', EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        openMap(MAP_TITLE)

        cy.intercept(
            {
                method: 'POST',
                url: /\/maps/,
            },
            { statusCode: 409 }
        ).as('saveAsFails')

        saveAsNewMap('Map name')
        cy.wait('@saveAsFails').its('response.statusCode').should('eq', 409)
        cy.getByDataTest('dhis2-uicore-alertbar')
            .contains('Failed to save map')
            .should('be.visible')
    })

    it('deletes MAP_TITLE map', () => {
        cy.visit('/', EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        openMap(MAP_TITLE)
        cy.intercept({
            method: 'DELETE',
            url: /\/maps/,
        }).as('deleteMap')

        cy.getByDataTest('layercard').should('not.contain', 'Loading layer...')

        deleteMap()

        cy.wait('@deleteMap').its('response.statusCode').should('eq', 200)

        cy.getByDataTest('layercard').should('not.exist')
        cy.getByDataTest('basemapcard', EXTENDED_TIMEOUT).should('be.visible')
    })

    it('deletes SAVEAS_MAP_TITLE map', () => {
        cy.visit('/', EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        openMap(SAVEAS_MAP_TITLE)

        cy.intercept({
            method: 'DELETE',
            url: /\/maps/,
        }).as('deleteMap')

        deleteMap()

        cy.wait('@deleteMap').its('response.statusCode').should('eq', 200)

        cy.getByDataTest('layercard').should('not.exist')
        cy.getByDataTest('basemapcard', EXTENDED_TIMEOUT).should('be.visible')
    })
})
