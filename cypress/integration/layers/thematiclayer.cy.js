import { getMaps } from '../../elements/map_canvas.js'
import {
    DRILL_UP,
    DRILL_DOWN,
    VIEW_PROFILE,
    expectContextMenuOptions,
} from '../../elements/map_context_menu.js'
import { ThematicLayer } from '../../elements/thematic_layer.js'
import {
    CURRENT_YEAR,
    getApiBaseUrl,
    EXTENDED_TIMEOUT,
} from '../../support/util.js'

const INDICATOR_NAME = 'VCCT post-test counselling rate'

context('Thematic Layers', () => {
    beforeEach(() => {
        cy.visit('/')
    })

    const Layer = new ThematicLayer()

    it('shows error in layer edit modal if no indicator group selected', () => {
        Layer.openDialog('Thematic').addToMap()

        Layer.validateDialogClosed(false)

        cy.contains('Indicator group is required').should('be.visible')
    })

    it('shows error in layer edit modal if no indicator selected', () => {
        Layer.openDialog('Thematic').selectIndicatorGroup('HIV').addToMap()

        Layer.validateDialogClosed(false)
        cy.contains('Indicator is required').should('be.visible')
    })

    it('adds a thematic layer', () => {
        Layer.openDialog('Thematic')
            .selectIndicatorGroup('HIV')
            .selectIndicator(INDICATOR_NAME)
            .selectTab('Period')
            .selectPeriodType('YEARLY')
            .selectTab('Org Units')
            .selectOu('Sierra Leone')
            .addToMap()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle(INDICATOR_NAME)
        // TODO: test this in a way that is not dependent on the date
        // Layer.validateCardItems([
        //     '70.2 - 76.72 (1)',
        //     '76.72 - 83.24 (1)',
        //     '83.24 - 89.76 (2)',
        //     '89.76 - 96.28 (3)',
        //     '96.28 - 102.8 (4)',
        // ]);

        getMaps().should('have.length', 1)
    })

    it('adds a thematic layer for OU Bombali', () => {
        Layer.openDialog('Thematic')
            .selectIndicatorGroup('HIV')
            .selectIndicator(INDICATOR_NAME)
            .selectTab('Period')
            .selectPeriodType('YEARLY')
            .selectTab('Org Units')
            .selectOu('Bombali')
            .selectOu('Bo')
            .addToMap()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle(INDICATOR_NAME)
        getMaps().should('have.length', 1)
    })

    it('adds a thematic layer with start and end date', () => {
        Layer.openDialog('Thematic')
            .selectIndicatorGroup('HIV')
            .selectIndicator(INDICATOR_NAME)
            .selectTab('Period')
            .selectStartEndDates()
            .typeStartDate(`${CURRENT_YEAR}-02-01`)
            .typeEndDate(`${CURRENT_YEAR}-11-30`)
            .selectTab('Org Units')
            .selectOu('Sierra Leone')
            .addToMap()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle(INDICATOR_NAME).validateCardPeriod(
            `Feb 1, ${CURRENT_YEAR} - Nov 30, ${CURRENT_YEAR}`
        )

        getMaps().should('have.length', 1)
    })

    it('opens a thematic layer popup with data and nodata', () => {
        Layer.openDialog('Thematic')
            .selectIndicatorGroup('Stock')
            .selectIndicator('BCG Stock PHU')
            .selectTab('Period')
            .selectStartEndDates()
            .typeStartDate(`${CURRENT_YEAR}-11-01`)
            .typeEndDate(`${CURRENT_YEAR}-11-30`)
            .selectTab('Style')
            .selectIncludeNoDataOU()
            .selectTab('Org Units')
            .unselectOuLevel('District')
            .selectOuLevel('Facility')

        cy.getByDataTest('org-unit-tree-node')
            .contains('Western Area')
            .parents('[data-test="org-unit-tree-node"]')
            .first()
            .within(() => {
                cy.getByDataTest('org-unit-tree-node-toggle').click()
            })

        cy.getByDataTest('org-unit-tree-node')
            .contains('Rural Western Area')
            .parents('[data-test="org-unit-tree-node"]')
            .first()
            .within(() => {
                cy.getByDataTest('org-unit-tree-node-toggle').click()
            })

        // Value: 0
        cy.getByDataTest('org-unit-tree-node').contains('Tokeh MCHP').click()

        cy.getByDataTest('layeredit-addbtn').click()

        Layer.validateDialogClosed(true)

        cy.wait(5000) // eslint-disable-line cypress/no-unnecessary-waiting
        cy.get('#dhis2-map-container')
            .findByDataTest('dhis2-uicore-componentcover', EXTENDED_TIMEOUT)
            .should('not.exist')
        cy.get('.dhis2-map').click('center') //Click in the middle of the map

        cy.get('.maplibregl-popup').contains('Value: 0').should('be.visible')

        // Value: No data
        cy.getByDataTest('layer-edit-button').click()
        Layer.selectTab('Org Units')

        cy.getByDataTest('org-unit-tree-node').contains('Tokeh MCHP').click()
        cy.getByDataTest('org-unit-tree-node')
            .contains('Lakka Hospital')
            .click()

        cy.getByDataTest('layeredit-addbtn').click()

        Layer.validateDialogClosed(true)

        cy.wait(5000) // eslint-disable-line cypress/no-unnecessary-waiting
        cy.get('#dhis2-map-container')
            .findByDataTest('dhis2-uicore-componentcover', EXTENDED_TIMEOUT)
            .should('not.exist')
        cy.get('.dhis2-map').click('center') //Click in the middle of the map

        cy.get('.maplibregl-popup')
            .contains('Value: No data')
            .should('be.visible')
    })

    it('adds a thematic layer with split view period', () => {
        Layer.openDialog('Thematic')
            .selectIndicatorGroup('ANC')
            .selectIndicator('ANC 1 Coverage')
            .selectTab('Org Units')
            .selectOu('Sierra Leone')
            .selectTab('Period')
            .selectPeriodType('MONTHLY', 'relative', 2)

        cy.get('[type="radio"]').should('have.length', 3)
        cy.get('[type="radio"]').check('SPLIT_BY_PERIOD')

        cy.getByDataTest('dhis2-uicore-modalactions')
            .contains('Add layer')
            .click()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle('ANC 1 Coverage')

        // check for 3 maps
        getMaps().should('have.length', 3)

        // wait to make sure the maps are loaded
        cy.wait(2000) // eslint-disable-line cypress/no-unnecessary-waiting

        expectContextMenuOptions([
            { name: DRILL_UP, disabled: true },
            { name: DRILL_DOWN },
            { name: VIEW_PROFILE },
        ])
    })

    // TODO - update demo database with calculations instead of creating on the fly
    it('adds a thematic layer with a calculation', () => {
        const timestamp = new Date().toUTCString().slice(-24, -4)
        const calculationName = `map calc ${timestamp}`

        // add a calculation
        cy.request('POST', `${getApiBaseUrl()}/api/expressionDimensionItems`, {
            name: calculationName,
            shortName: calculationName,
            expression: '#{fbfJHSPpUQD}/2',
        }).then((response) => {
            expect(response.status).to.eq(201)

            const calculationUid = response.body.response.uid

            // open thematic dialog
            cy.getByDataTest('add-layer-button').click()
            cy.getByDataTest('addlayeritem-thematic').click()

            // choose "Calculation" in item type
            cy.getByDataTest('thematic-layer-value-type-select').click()
            cy.contains('Calculations').click()

            // assert that the label on the Calculation select is "Calculation"
            cy.getByDataTest('calculationselect-label').contains('Calculation')

            // click to open the calculation select
            cy.getByDataTest('calculationselect').click()

            // check search box exists "Type to filter options"
            cy.getByDataTest('dhis2-uicore-popper')
                .find('input[type="text"]')
                .should('have.attr', 'placeholder', 'Type to filter options')

            // search for something that doesn't exist
            cy.getByDataTest('dhis2-uicore-popper')
                .find('input[type="text"]')
                .type('foo')

            cy.getByDataTest('dhis2-uicore-select-menu-menuwrapper')
                .contains('No options found')
                .should('be.visible')

            // try search for something that exists
            cy.getByDataTest('dhis2-uicore-popper')
                .find('input[type="text"]')
                .clear()

            cy.getByDataTest('dhis2-uicore-popper')
                .find('input[type="text"]')
                .type(calculationName)

            cy.getByDataTest('dhis2-uicore-select-menu-menuwrapper')
                .contains(calculationName)
                .should('be.visible')

            // select the calculation and close dialog
            cy.contains(calculationName).click()

            cy.getByDataTest('dhis2-uicore-modalactions')
                .contains('Add layer')
                .click()

            // check the layer card title
            cy.getByDataTest('layercard')
                .contains(calculationName, { timeout: 50000 })
                .should('be.visible')

            // check the map canvas is displayed
            cy.get('canvas.maplibregl-canvas').should('be.visible')

            // delete the calculation
            cy.request(
                'DELETE',
                `${getApiBaseUrl()}/api/expressionDimensionItems/${calculationUid}`
            )
        })
    })

    it('adds a thematic layer for data element', () => {
        const DE_NAME = 'ANC 1st visit'
        Layer.openDialog('Thematic')
            .selectItemType('Data element')
            .selectDataElementGroup('ANC')
            .selectDataElement(DE_NAME)
            .addToMap()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle(DE_NAME)
        cy.getByDataTest(`card-ANC1stvisit`)
            .findByDataTest('layerlegend-item')
            .should('have.length', 5)

        getMaps().should('have.length', 1)
    })

    it('handles an error in the layer configuration', () => {
        cy.visit('/')

        Layer.openDialog('Thematic')
            .selectIndicatorGroup('HIV')
            .selectIndicator(INDICATOR_NAME)
            .selectTab('Period')
            .selectPeriodType('YEARLY')
            .selectTab('Org Units')
            .selectOu('Bo')
            .unselectOuLevel('District')
            .selectOuLevel('National')
            .addToMap()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle(INDICATOR_NAME)

        // check that loading completes and the layer card is present
        cy.getByDataTest('map-loading-mask').should('not.exist')

        cy.getByDataTest('layercard')
            .contains(INDICATOR_NAME)
            .should('be.visible')

        // check that an error is displayed in the layer card
        cy.getByDataTest('load-error-noticebox').should('be.visible')
        cy.getByDataTest('load-error-noticebox')
            .find('h6')
            .contains('Failed to load layer')
            .should('be.visible')
        cy.getByDataTest('dhis2-uicore-noticebox-content-message')
            .contains(
                'Organisation unit or organisation unit level is not valid'
            )
            .should('be.visible')

        // edit the layer to make it valid
        cy.getByDataTest('layer-edit-button').click()
        Layer.selectTab('Org Units')
            .unselectOuLevel('National')
            .selectOuLevel('Chiefdom')
            .updateMap()

        // confirm that the map is valid now
        cy.getByDataTest('layerlegend-item').should('have.length', 5)
    })
})
