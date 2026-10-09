import { Layer } from './layer.js'

export class TeLayer extends Layer {
    selectTeType(type) {
        cy.getByDataTest('tetypeselect').click()
        cy.contains(type).click()

        return this
    }

    selectTeProgram(program) {
        cy.getByDataTest('programselect').contains('No program').click()

        cy.contains(program).click()

        return this
    }

    selectStage(stage) {
        cy.getByDataTest('programstageselect').click()
        cy.contains(stage).click()

        return this
    }

    checkFollowUp() {
        cy.contains('label', 'Follow up').click()

        return this
    }

    showRelationships() {
        cy.contains('label', 'Display Tracked Entity relationships').click()

        return this
    }

    selectRelationshipType(type) {
        cy.contains('[data-test="select-field-container"]', 'Relationship type')
            .find('[data-test="dhis2-uicore-select-input"]')
            .click()
        cy.getByDataTest('dhis2-uicore-singleselectoption')
            .contains(type)
            .click()

        return this
    }

    selectOuMode(mode) {
        cy.contains('[data-test="select-field-container"]', 'Selection mode')
            .find('[data-test="dhis2-uicore-select-input"]')
            .click()
        cy.getByDataTest('dhis2-uicore-singleselectoption')
            .contains(mode)
            .click()

        return this
    }

    validateStage(stage) {
        cy.getByDataTest('programstageselect')
            .contains(stage)
            .should('be.visible')

        return this
    }
}
