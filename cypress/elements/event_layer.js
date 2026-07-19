import { EXTENDED_TIMEOUT } from '../support/util.js'
import { Layer } from './layer.js'

export class EventLayer extends Layer {
    selectProgram(program) {
        cy.get('[data-test="programselect"]', EXTENDED_TIMEOUT).click()
        cy.contains(program, EXTENDED_TIMEOUT).scrollIntoView()
        cy.contains(program, EXTENDED_TIMEOUT).click()

        return this
    }

    selectStage(stage) {
        cy.get('[data-test="programstageselect"]', EXTENDED_TIMEOUT).click()
        cy.contains(stage, EXTENDED_TIMEOUT).click()

        return this
    }

    selectCoordinate(coordinate) {
        cy.getByDataTest('coordinatefield-content', EXTENDED_TIMEOUT).should(
            ($el) => expect($el.text().trim().length).to.be.greaterThan(0)
        )

        cy.getByDataTest('coordinatefield-content').then(($element) => {
            // Check if the coordinate is already selected by looking at the text content
            if ($element.text().trim() !== coordinate) {
                cy.log('Select the coordinate')
                cy.getByDataTest('coordinatefield-content').click()
                cy.getByDataTest('dhis2-uicore-popper')
                    .containsExact(coordinate)
                    .click()
            } else {
                cy.log('Coordinate already selected, no action needed')
            }
        })

        return this
    }

    validateStage(stage) {
        cy.get('[data-test="programstageselect"]', EXTENDED_TIMEOUT)
            .contains(stage)
            .should('be.visible')

        return this
    }

    selectViewAllEvents() {
        // Group events by default or View all events
        cy.get('[src="images/nocluster.png"]').click()

        return this
    }

    selectIncludeUnclassifiedEvents() {
        cy.contains('Include unclassified events').click()

        return this
    }

    selectIncludeNoDataEvents() {
        cy.contains('Include events with no data').click()

        return this
    }
}
