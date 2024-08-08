import { EventLayer } from '../../elements/event_layer.js'
import { EXTENDED_TIMEOUT } from '../../support/util.js'

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
})
