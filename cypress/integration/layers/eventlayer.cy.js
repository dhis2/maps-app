import { EventLayer } from '../../elements/event_layer.js'
import { CURRENT_YEAR, EXTENDED_TIMEOUT } from '../../support/util.js'

context('Event Layers', () => {
    beforeEach(() => {
        cy.visit('/', EXTENDED_TIMEOUT)
    })

    const Layer = new EventLayer()

    it('shows error if no program selected', () => {
        Layer.openDialog('Events').addToMap()

        Layer.validateDialogClosed(false)

        cy.contains('Program is required').should('be.visible')
    })

    it('adds an event layer', () => {
        Layer.openDialog('Events')
            .selectProgram('Inpatient morbidity and mortality')
            .validateStage('Inpatient morbidity and mortality')
            .selectTab('Org Units')
            .selectOu('Bombali')
            .selectOu('Bo')
            .addToMap()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle('Inpatient morbidity and mortality')
        Layer.validateCardItems(['Event'])
    })

    it('adds an event layer and applies style for boolean data element', () => {
        Layer.openDialog('Events')
            .selectProgram('E2E program')
            .validateStage('Stage 1 - Repeatable')
            .selectTab('Style')

        cy.getByDataTest('style-by-data-element-select').click()

        cy.getByDataTest('dhis2-uicore-singleselectoption')
            .contains('E2E - Yes/no')
            .click()

        cy.getByDataTest('dhis2-uicore-modalactions')
            .contains('Add layer')
            .click()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle('Stage 1 - Repeatable')
        Layer.validateCardItems(['Yes', 'No', 'Not set'])
    })

    it('opens an event popup', () => {
        Layer.openDialog('Events')
            .selectProgram('Inpatient morbidity and mortality')
            .validateStage('Inpatient morbidity and mortality')
            .selectTab('Period')
            .selectPeriodType('Start/end dates')
            .typeStartDate(`${CURRENT_YEAR - 5}-01-01`)
            .typeEndDate(`${CURRENT_YEAR}-11-30`)
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

        Layer.validateCardTitle('Inpatient morbidity and mortality')
        Layer.validateCardItems(['Event'])
    })
})
