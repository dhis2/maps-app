import { EventLayer } from '../../elements/event_layer.js'
import { getMaps } from '../../elements/map_canvas.js'
import {
    CURRENT_YEAR,
    EXTENDED_TIMEOUT,
    POPUP_WAIT,
} from '../../support/util.js'

const programE2E = {
    name: 'E2E program',
    stage: 'Stage 1 - Repeatable',
    de: 'E2E - Yes/no',
    options: ['Yes', 'No', 'Other'],
}

const programIP = {
    name: 'Inpatient morbidity and mortality',
    stage: 'Inpatient morbidity and mortality',
    startDate: `${CURRENT_YEAR - 5}-00-00`,
    endDate: `${CURRENT_YEAR}-11-30`,
    periodText: `Jan 1, ${CURRENT_YEAR - 5} - Nov 30, ${CURRENT_YEAR}`,
    ous: ['Bombali', 'Bo'],
    ousAlt: ['Western Area', 'Rural Western Area', 'Sussex MCHP'],
}

const programGeowR = {
    name: 'E2E - GeoProgram - Points (with reg)',
    stage: 'E2E - Geo - Stage - Point',
    coordinates: [
        { name: 'Event location', coords: '-11.499252 8.178188' },
        { name: 'Enrollment location', coords: '-11.634007 8.011976' },
        { name: 'Tracked entity location', coords: '-11.529636 8.040193' },
        {
            name: 'E2E - Geo - DE - Coordinate',
            coords: '-11.602850 8.077288',
        },
        {
            name: 'E2E - Geo - TEA - Coordinate',
            coords: '-11.499982 8.049881',
        },
    ],
    startDate: `2025-01-01`,
    endDate: `2025-03-31`,
    ous: ['Bo', 'Bargbe'],
    filters: { item: 'E2E - Geo - DE - ID', value: '#C' },
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

        cy.getByDataTest('style-by-data-item-select').click()

        cy.getByDataTest('dhis2-uicore-singleselectoption')
            .contains(programE2E.de)
            .click()

        Layer.addToMap()

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
        function testCoordinate(coordinates, reOpenDialog = true) {
            if (reOpenDialog) {
                cy.getByDataTest('layer-edit-button').click()
            }

            // Change coordinate
            Layer.selectTab('Data').selectCoordinate(coordinates.name)

            if (reOpenDialog) {
                Layer.updateMap()
            } else {
                Layer.addToMap()
            }

            Layer.validateDialogClosed(true)

            // Wait for map to load
            cy.wait(POPUP_WAIT)
            cy.get('#dhis2-map-container')
                .findByDataTest('dhis2-uicore-componentcover', EXTENDED_TIMEOUT)
                .should('not.exist')

            // Check popup
            getMaps().click('center') // Click in the middle of the map
            Layer.validatePopupContents([coordinates.name, coordinates.coords])

            // Check legend
            Layer.validateCardTitle(programGeowR.stage)
            Layer.validateCardContents([
                'Coordinate field',
                `${coordinates.name}`,
            ])
        }

        // Event layer config

        Layer.openDialog('Events')
            .selectProgram(programGeowR.name)
            .selectStage(programGeowR.stage)

        Layer.selectTab('Period')
            .selectPeriodType({ periodType: 'Start/end dates' })
            .typeStartDate(programGeowR.startDate)
            .typeEndDate(programGeowR.endDate)

        Layer.selectTab('Org Units')
            .unselectOu('Sierra Leone')
            .openOu(programGeowR.ous[0])
            .selectOu(programGeowR.ous[1])

        Layer.selectTab('Filter')
        cy.contains('Add filter').click()
        cy.getByDataTest('dhis2-uicore-select-input').last().click()
        cy.contains(programGeowR.filters.item).click()
        cy.getByDataTest('dhis2-uiwidgets-inputfield-content')
            .find('input')
            .type(programGeowR.filters.value)

        Layer.selectTab('Style').selectViewAllEvents()

        // Test different coordinates
        testCoordinate(programGeowR.coordinates[3], false) // Geo - DataElement - Coordinate
        testCoordinate(programGeowR.coordinates[4]) // Geo - TrackedEntityAttribute - Coordinate
        testCoordinate(programGeowR.coordinates[2]) // Tracked entity location
        testCoordinate(programGeowR.coordinates[1]) // Enrollment location
        testCoordinate(programGeowR.coordinates[0]) // Event location
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
            .unselectOu('Sierra Leone')
            .openOu(programIP.ousAlt[0])
            .openOu(programIP.ousAlt[1])
            .selectOu(programIP.ousAlt[2])
            .addToMap()

        cy.wait(POPUP_WAIT)
        cy.get('#dhis2-map-container')
            .findByDataTest('dhis2-uicore-componentcover', EXTENDED_TIMEOUT)
            .should('not.exist')

        getMaps().click('center')
        Layer.validatePopupContents([
            'Event location',
            '-13.188339 8.405215',
            'Organisation unit',
            'Event time',
            'Age in years',
            'Mode of Discharge',
        ])

        Layer.validateCardTitle(programIP.name)
        Layer.validateCardItems(['Event'])
    })
})
