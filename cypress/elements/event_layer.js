import { Layer } from './layer.js'

export class EventLayer extends Layer {
    selectProgram(program) {
        cy.get('[data-test="programselect"]').click()
        cy.contains(program).scrollIntoView()
        cy.contains(program).click()

        return this
    }

    selectStage(stage) {
        cy.get('[data-test="programstageselect"]').click()
        cy.contains(stage).click()

        return this
    }

    selectCoordinate(coordinate) {
        cy.get('[data-test="coordinatefield"]').click()
        cy.contains(coordinate).click()

        return this
    }

    validateStage(stage) {
        cy.get('[data-test="programstageselect"]')
            .contains(stage)
            .should('be.visible')

        return this
    }

    selectPeriodType({ periodType } = {}) {
        if (!periodType) {
            throw new Error("The 'periodType' parameter is required.")
        }

        cy.getByDataTest('relative-period-select-content').click()
        cy.contains(periodType).click()

        return this
    }

    selectViewAllEvents() {
        // Group events by default or View all events
        cy.get('[src="images/nocluster.png"]').click()

        return this
    }
}
