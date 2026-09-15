import { EXTENDED_TIMEOUT } from '../support/util.js'
import { Layer } from './layer.js'

// Waits for the popper's text to stabilize before clicking.
const clickStablePopperItem = (text) => {
    let lastSignature = null
    let stableCount = 0

    cy.get(
        '[data-test="dhis2-uicore-popper"]:visible',
        EXTENDED_TIMEOUT
    ).should(($popper) => {
        const signature = $popper.text()
        if (signature === lastSignature) {
            stableCount++
        } else {
            stableCount = 0
            lastSignature = signature
        }
        expect(stableCount, 'popper content settled').to.be.at.least(1)
    })

    cy.get('[data-test="dhis2-uicore-popper"]:visible')
        .containsExact(text)
        .click()
}

const MAX_SELECT_ATTEMPTS = 3

// Selects targetText, then retries the whole open+click if it didn't take -
// clickStablePopperItem() narrows the detached-click race but doesn't close it.
const selectPopperOption = (
    contentDataTest,
    targetText,
    attemptsLeft = MAX_SELECT_ATTEMPTS
) => {
    cy.getByDataTest(contentDataTest, EXTENDED_TIMEOUT).then(($element) => {
        if ($element.text().trim() === targetText) {
            return
        }

        cy.getByDataTest(contentDataTest).click()
        clickStablePopperItem(targetText)

        cy.getByDataTest(contentDataTest).then(($after) => {
            if ($after.text().trim() !== targetText) {
                expect(
                    attemptsLeft,
                    `select "${targetText}" eventually took effect`
                ).to.be.greaterThan(1)
                selectPopperOption(
                    contentDataTest,
                    targetText,
                    attemptsLeft - 1
                )
            }
        })
    })
}

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
        selectPopperOption('coordinatefield-content', coordinate)

        return this
    }

    selectFallbackCoordinate(coordinate) {
        cy.getByDataTest(
            'fallbackcoordinatefield-content',
            EXTENDED_TIMEOUT
        ).should(($el) => expect($el.text().trim().length).to.be.greaterThan(0))
        selectPopperOption('fallbackcoordinatefield-content', coordinate)

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

    selectRadius(radius) {
        cy.getByDataTest('eventdialog-styletab')
            .find('input[type="number"]')
            .as('radiusInput')

        cy.get('@radiusInput').clear()
        cy.get('@radiusInput').type(radius)
        cy.get('@radiusInput').blur()

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

    selectCountEventsWithoutCoordinates() {
        cy.getByDataTest('eventdialog-styletab')
            .contains('Count events without coordinates')
            .click()

        return this
    }

    selectLabelField(name) {
        cy.getByDataTest('eventdialog-styletab').then(($tab) => {
            if (!$tab.find('[data-test="label-field-select-content"]').length) {
                cy.wrap($tab).contains('Labels').click()
            }
        })

        selectPopperOption('label-field-select-content', name)

        return this
    }
}
