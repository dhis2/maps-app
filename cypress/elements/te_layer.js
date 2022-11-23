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

    validateStage(stage) {
        cy.getByDataTest('programstageselect')
            .contains(stage)
            .should('be.visible')

        return this
    }
}
