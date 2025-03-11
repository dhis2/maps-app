import { EventLayer } from '../../elements/event_layer.js'
import { CURRENT_YEAR, EXTENDED_TIMEOUT } from '../../support/util.js'

const programE2E = {
    name: 'E2E program',
    stage: 'Stage 1 - Repeatable',
    de: 'E2E - Yes/no',
    options: ['Yes', 'No', 'Not set'],
}

const programIP = {
    name: 'Inpatient morbidity and mortality',
    stage: 'Inpatient morbidity and mortality',
    startDate: `${CURRENT_YEAR - 5}-00-00`,
    endDate: `${CURRENT_YEAR}-11-30`,
    periodText: `Jan 1, ${CURRENT_YEAR - 5} - Nov 30, ${CURRENT_YEAR}`,
    ous: ['Bombali', 'Bo'],
}

const programGeowR = {
    name: 'GeoProgram - Points (with reg)',
    stage: 'Geo - Stage - Point',
    coordinates: [
        { name: 'Event location', coords: '-11.499252 8.178188' },
        { name: 'Enrollment location', coords: '-11.634007 8.011976' },
        { name: 'Tracked entity location', coords: '-11.529636 8.040193' },
        {
            name: 'Geo - DataElement - Coordinate',
            coords: '-11.602850 8.077288',
        },
        {
            name: 'Geo - TrackedEntityAttribute - Coordinate',
            coords: '-11.499982 8.049881',
        },
    ],
    startDate: `2025-01-01`,
    endDate: `2025-03-31`,
    ous: ['Bo', 'Bargbe'],
    filters: { item: 'Geo - DataElement - ID', value: '#C' },
}

context('Event Layers', () => {
    beforeEach(() => {
        cy.visit('/')
    })

    const Layer = new EventLayer()

    it('adds an event layer and applies style for boolean data element', () => {
        Layer.openDialog('Events')
            .selectProgram(programE2E.name)
            .validateStage(programE2E.stage)
            .selectTab('Style')

        cy.getByDataTest('style-by-data-element-select').click()

        cy.getByDataTest('dhis2-uicore-singleselectoption')
            .contains(programE2E.de)
            .click()

        cy.getByDataTest('dhis2-uicore-modalactions')
            .contains('Add layer')
            .click()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle(programE2E.stage)
        Layer.validateCardItems(programE2E.options)
    })

    it('shows error if no program selected', () => {
        Layer.openDialog('Events').addToMap()

        Layer.validateDialogClosed(false)

        cy.contains('Program is required').should('be.visible')
    })

    it('shows error if no endDate is specified', () => {
        Layer.openDialog('Events')
            .selectProgram(programIP.name)
            .validateStage(programIP.stage)
            .selectTab('Period')
            .selectPeriodType({ periodType: 'Start/end dates' })
            .typeEndDate()
            .addToMap()

        Layer.validateDialogClosed(false)
        cy.contains('End date is invalid').should('be.visible')

        Layer.selectTab('Period').typeEndDate('2')

        cy.contains('End date is invalid').should('not.exist')
    })

    it('adds an event layer - relative period', () => {
        Layer.openDialog('Events')
            .selectProgram(programIP.name)
            .validateStage(programIP.stage)
            .selectTab('Org Units')
            .selectOu(programIP.ous[0])
            .selectOu(programIP.ous[1])
            .addToMap()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle(programIP.name)
        Layer.validateCardItems(['Event'])
    })

    it('adds an event layer - start-end dates', () => {
        Layer.openDialog('Events')
            .selectProgram(programIP.name)
            .validateStage(programIP.stage)
            .selectTab('Period')
            .selectPeriodType({ periodType: 'Start/end dates' })
            .typeStartDate(programIP.startDate)
            .typeEndDate(programIP.endDate)
            .selectTab('Org Units')
            .selectOu(programIP.ous[0])
            .selectOu(programIP.ous[1])
            .selectTab('Style')
            .selectViewAllEvents()
            .addToMap()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle(programIP.name).validateCardPeriod(
            programIP.periodText
        )
        Layer.validateCardItems(['Event'])
    })

    it('change coordinate field', () => {
        function testCoordinate(n, open = true) {
            if (open) {
                cy.getByDataTest('layer-edit-button').click()
            }
            Layer.selectTab('Data').selectCoordinate(
                programGeowR.coordinates[n]
            )
            cy.getByDataTest('layeredit-addbtn').click()

            Layer.validateDialogClosed(true)

            cy.wait(5000) // eslint-disable-line cypress/no-unnecessary-waiting

            cy.get('#dhis2-map-container')
                .findByDataTest('dhis2-uicore-componentcover', EXTENDED_TIMEOUT)
                .should('not.exist')

            cy.get('.dhis2-map').click('center') // Click in the middle of the map

            cy.get('.maplibregl-popup')
                .contains(programGeowR.coordinates[n].name)
                .should('be.visible')
            cy.get('.maplibregl-popup')
                .contains(programGeowR.coordinates[n].coords)
                .should('be.visible')

            Layer.validateCardTitle(programGeowR.stage)
            Layer.validateCardContents([
                'Coordinate field',
                `${programGeowR.coordinates[n].name}`,
            ])
        }

        Layer.openDialog('Events')
            .selectProgram(programGeowR.name)
            .selectStage(programGeowR.stage)
            .selectTab('Period')
            .selectPeriodType({ periodType: 'Start/end dates' })
            .typeStartDate(programGeowR.startDate)
            .typeEndDate(programGeowR.endDate)
            .selectTab('Org Units')

        cy.getByDataTest('dhis2-uicore-checkbox').eq(1).click()

        cy.getByDataTest('org-unit-tree-node')
            .contains(programGeowR.ous[0])
            .parents('[data-test="org-unit-tree-node"]')
            .first()
            .within(() => {
                cy.getByDataTest('org-unit-tree-node-toggle').click()
            })

        cy.getByDataTest('org-unit-tree-node')
            .contains(programGeowR.ous[1])
            .click()

        Layer.selectTab('Filter')

        cy.contains('Add filter').click()
        cy.getByDataTest('dhis2-uicore-select-input').last().click()
        cy.contains(programGeowR.filters.item).click()
        cy.getByDataTest('dhis2-uiwidgets-inputfield-content')
            .find('input')
            .type(programGeowR.filters.value)

        Layer.selectTab('Style').selectViewAllEvents()

        testCoordinate(3, false) // Geo - DataElement - Coordinate
        testCoordinate(4) // Geo - TrackedEntityAttribute - Coordinate
        testCoordinate(2) // Tracked entity location
        testCoordinate(1) // Enrollment location
        testCoordinate(0) // Event location
    })

    it('opens an event popup', () => {
        Layer.openDialog('Events')
            .selectProgram(programIP.name)
            .validateStage(programIP.stage)
            .selectTab('Period')
            .selectPeriodType({ periodType: 'Start/end dates' })
            .typeStartDate(programIP.startDate)
            .typeEndDate(programIP.endDate)
            .selectTab('Style')
            .selectViewAllEvents()
            .selectTab('Org Units')
            .selectOu('Sierra Leone')

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

        cy.getByDataTest('org-unit-tree-node').contains('Sussex MCHP').click()

        cy.getByDataTest('layeredit-addbtn').click()

        cy.wait(5000) // eslint-disable-line cypress/no-unnecessary-waiting
        cy.get('#dhis2-map-container')
            .findByDataTest('dhis2-uicore-componentcover', EXTENDED_TIMEOUT)
            .should('not.exist')
        cy.get('.dhis2-map').click('center')

        cy.get('.maplibregl-popup')
            .contains('Event location')
            .should('be.visible')
        cy.get('.maplibregl-popup')
            .contains('-13.188339 8.405215')
            .should('be.visible')
        cy.get('.maplibregl-popup')
            .contains('Organisation unit')
            .should('be.visible')
        cy.get('.maplibregl-popup').contains('Event time').should('be.visible')

        cy.get('.maplibregl-popup')
            .contains('Age in years')
            .should('be.visible')
        cy.get('.maplibregl-popup')
            .contains('Mode of Discharge')
            .should('be.visible')

        Layer.validateCardTitle(programIP.name)
        Layer.validateCardItems(['Event'])
    })
})
