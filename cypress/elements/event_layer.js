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
        cy.getByDataTest('coordinatefield-content')
            .should(($element) => {
                expect($element.text().trim()).to.not.equal('')
            })
            .then(($element) => {
                // Check if the coordinate is already selected by looking at the text content
                if ($element.text().trim() !== coordinate) {
                    cy.log('Select the coordinate')
                    cy.getByDataTest('coordinatefield-content').click()
                    cy.getByDataTest('dhis2-uicore-popper')
                        .should('be.visible')
                        .within(() => {
                            cy.containsExact(coordinate).click()
                        })
                } else {
                    cy.log('Coordinate already selected, no action needed')
                }
            })

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
