import { ThematicLayer } from '../../elements/thematic_layer.js'
import { CURRENT_YEAR } from '../../support/util.js'

const INDICATOR_NAME = 'VCCT post-test counselling rate'

context('Thematic Layers', () => {
    beforeEach(() => {
        cy.visit('/')
    })

    const Layer = new ThematicLayer()

    it('shows error if no indicator group selected', () => {
        Layer.openDialog('Thematic').addToMap()

        Layer.validateDialogClosed(false)

        cy.contains('Indicator group is required').should('be.visible')
    })

    it('shows error if no indicator selected', () => {
        Layer.openDialog('Thematic').selectIndicatorGroup('HIV').addToMap()

        Layer.validateDialogClosed(false)
        cy.contains('Indicator is required').should('be.visible')
    })

    it('adds a thematic layer', () => {
        Layer.openDialog('Thematic')
            .selectIndicatorGroup('HIV')
            .selectIndicator(INDICATOR_NAME)
            .selectTab('Period')
            .selectPeriodType('Yearly')
            .addToMap()

        Layer.validateDialogClosed(true)

        // TODO: use visual snapshot testing to check the rendering of the map

        Layer.validateCardTitle(INDICATOR_NAME)
        // TODO: test this in a way that is not dependent on the date
        // Layer.validateCardItems([
        //     '70.2 - 76.72 (1)',
        //     '76.72 - 83.24 (1)',
        //     '83.24 - 89.76 (2)',
        //     '89.76 - 96.28 (3)',
        //     '96.28 - 102.8 (4)',
        // ]);
    })

    it('adds a thematic layer for OU Bombali', () => {
        Layer.openDialog('Thematic')
            .selectIndicatorGroup('HIV')
            .selectIndicator(INDICATOR_NAME)
            .selectTab('Period')
            .selectPeriodType('Yearly')
            .selectTab('Org Units')
            .selectOu('Bombali')
            .selectOu('Bo')
            .addToMap()

        Layer.validateDialogClosed(true)

        // TODO: use visual snapshot testing to check the rendering of the map

        Layer.validateCardTitle(INDICATOR_NAME)
        // TODO: test this in a way that is not dependent on the date
        // Layer.validateCardItems([
        //     '80.9 - 83.04 (1)',
        //     '83.04 - 85.18 (0)',
        //     '85.18 - 87.32 (0)',
        //     '87.32 - 89.46 (0)',
        //     '89.46 - 91.6 (1)',
        // ]);
    })

    it('adds a thematic layer with start and end date', () => {
        Layer.openDialog('Thematic')
            .selectIndicatorGroup('HIV')
            .selectIndicator(INDICATOR_NAME)
            .selectTab('Period')
            .selectPeriodType('Start/end dates')
            .typeStartDate(`${CURRENT_YEAR}-02-01`)
            .typeEndDate(`${CURRENT_YEAR}-11-30`)
            .addToMap()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle(INDICATOR_NAME).validateCardPeriod(
            `Feb 1, ${CURRENT_YEAR} - Nov 30, ${CURRENT_YEAR}`
        )
    })
})
