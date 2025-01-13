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
            .contains('Bo')
            .parents('[data-test="org-unit-tree-node"]')
            .first()
            .within(() => {
                cy.getByDataTest('org-unit-tree-node-toggle').click()
            })

        cy.getByDataTest('org-unit-tree-node')
            .contains('Badjia')
            .parents('[data-test="org-unit-tree-node"]')
            .first()
            .within(() => {
                cy.getByDataTest('org-unit-tree-node-toggle').click()
            })

        cy.getByDataTest('org-unit-tree-node').contains('Njandama MCHP').click()

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
            .contains('0.000000 0.000000')
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
