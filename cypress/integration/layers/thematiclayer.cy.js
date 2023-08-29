import { ThematicLayer } from '../../elements/thematic_layer.js'
import { CURRENT_YEAR, getApiBaseUrl } from '../../support/util.js'

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
            .selectTab('Org Units')
            .selectOu('Sierra Leone')
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
            .selectTab('Org Units')
            .selectOu('Sierra Leone')
            .addToMap()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle(INDICATOR_NAME).validateCardPeriod(
            `Feb 1, ${CURRENT_YEAR} - Nov 30, ${CURRENT_YEAR}`
        )
    })

    // TODO - update demo database with calculations instead of creating on the fly
    it('adds a thematic layer with a calculation', () => {
        const timestamp = new Date().toUTCString().slice(-24, -4)
        const calculationName = `map calc ${timestamp}`

        // add a calculation
        cy.request('POST', `${getApiBaseUrl()}/api/expressionDimensionItems`, {
            name: calculationName,
            shortName: calculationName,
            expression: '#{fbfJHSPpUQD}/2',
        }).then((response) => {
            expect(response.status).to.eq(201)

            const calculationUid = response.body.response.uid

            // open thematic dialog
            cy.getByDataTest('add-layer-button').click()
            cy.getByDataTest('addlayeritem-thematic').click()

            // choose "Calculation" in item type
            cy.getByDataTest('thematic-layer-value-type-select').click()
            cy.contains('Calculations').click()

            // assert that the label on the Calculation select is "Calculation"
            cy.getByDataTest('calculationselect-label').contains('Calculation')

            // click to open the calculation select
            cy.getByDataTest('calculationselect').click()

            // check search box exists "Type to filter options"
            cy.getByDataTest('dhis2-uicore-popper')
                .find('input[type="text"]')
                .should('have.attr', 'placeholder', 'Type to filter options')

            // search for something that doesn't exist
            cy.getByDataTest('dhis2-uicore-popper')
                .find('input[type="text"]')
                .type('foo')

            cy.getByDataTest('dhis2-uicore-select-menu-menuwrapper')
                .contains('No options found')
                .should('be.visible')

            // try search for something that exists
            cy.getByDataTest('dhis2-uicore-popper')
                .find('input[type="text"]')
                .clear()

            cy.getByDataTest('dhis2-uicore-popper')
                .find('input[type="text"]')
                .type(calculationName)

            cy.getByDataTest('dhis2-uicore-select-menu-menuwrapper')
                .contains(calculationName)
                .should('be.visible')

            // select the calculation and close dialog
            cy.contains(calculationName).click()

            cy.getByDataTest('dhis2-uicore-modalactions')
                .contains('Add layer')
                .click()

            // check the layer card title
            cy.getByDataTest('layercard')
                .contains(calculationName, { timeout: 50000 })
                .should('be.visible')

            // check the map canvas is displayed
            cy.get('canvas.maplibregl-canvas').should('be.visible')

            // delete the calculation
            cy.request(
                'DELETE',
                `${getApiBaseUrl()}/api/expressionDimensionItems/${calculationUid}`
            )
        })
    })
})
