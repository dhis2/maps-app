import { getMaps } from '../../elements/map_canvas.js'
import {
    DRILL_UP,
    DRILL_DOWN,
    VIEW_PROFILE,
    expectContextMenuOptions,
} from '../../elements/map_context_menu.js'
import { ThematicLayer } from '../../elements/thematic_layer.js'
import {
    CURRENT_YEAR,
    getApiBaseUrl,
    EXTENDED_TIMEOUT,
    POPUP_WAIT,
} from '../../support/util.js'

const HIV_INDICATOR_GROUP = 'HIV'
const HIV_INDICATOR_NAME = 'VCCT post-test counselling rate'

const ANC_INDICATOR_GROUP = 'ANC'
const ANC_INDICATOR_NAME = 'ANC 1 Coverage'

const ANC_DATAELEMENT_GROUP = 'ANC'
const ANC_DATAELEMENT_NAME = 'ANC 1st visit'

context('Thematic Layers', () => {
    beforeEach(() => {
        cy.visit('/')
    })

    const Layer = new ThematicLayer()

    it('shows error in layer edit modal if no indicator group selected', () => {
        Layer.openDialog('Thematic').addToMap()

        Layer.validateDialogClosed(false)

        cy.contains('Indicator group is required').should('be.visible')
    })

    it('shows error in layer edit modal if no indicator selected', () => {
        Layer.openDialog('Thematic')
            .selectIndicatorGroup(HIV_INDICATOR_GROUP)
            .addToMap()

        Layer.validateDialogClosed(false)
        cy.contains('Indicator is required').should('be.visible')
    })

    it('shows error in layer edit modal if no period selected', () => {
        Layer.openDialog('Thematic')
            .selectIndicatorGroup(HIV_INDICATOR_GROUP)
            .selectIndicator(HIV_INDICATOR_NAME)
            .selectTab('Period')
            .removeAllPeriods()
            .addToMap()

        Layer.validateDialogClosed(false)
        cy.contains('Period is required').should('be.visible')

        Layer.selectTab('Period').selectStartEndDates()
        cy.contains('Period is required').should('not.exist')

        Layer.selectTab('Period').typeEndDate().addToMap()

        Layer.validateDialogClosed(false)
        cy.contains('End date is invalid').should('be.visible')

        Layer.selectTab('Period').typeEndDate('2')
        cy.press(Cypress.Keyboard.Keys.TAB)

        cy.contains('End date is invalid').should('not.exist')
    })

    it('adds a thematic layer', () => {
        Layer.openDialog('Thematic')
            .selectIndicatorGroup(HIV_INDICATOR_GROUP)
            .selectIndicator(HIV_INDICATOR_NAME)
            .selectTab('Period')
            .selectPeriodType({ periodType: 'YEARLY' })
            .selectTab('Org Units')
            .selectOu('Sierra Leone')
            .addToMap()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle(HIV_INDICATOR_NAME)
        // TODO: test this in a way that is not dependent on the date
        // Layer.validateCardItems([
        //     '70.2 - 76.72 (1)',
        //     '76.72 - 83.24 (1)',
        //     '83.24 - 89.76 (2)',
        //     '89.76 - 96.28 (3)',
        //     '96.28 - 102.8 (4)',
        // ]);

        getMaps().should('have.length', 1)
    })

    it('adds a thematic layer for OU Bombali', () => {
        Layer.openDialog('Thematic')
            .selectIndicatorGroup(HIV_INDICATOR_GROUP)
            .selectIndicator(HIV_INDICATOR_NAME)
            .selectTab('Period')
            .selectPeriodType({ periodType: 'YEARLY' })
            .selectTab('Org Units')
            .selectOu('Bombali')
            .selectOu('Bo')
            .addToMap()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle(HIV_INDICATOR_NAME)
        getMaps().should('have.length', 1)
    })

    it('adds user sub-units and a Chiefdom OU', () => {
        Layer.openDialog('Thematic')
            .selectItemType('Data element')
            .selectDataElementGroup(ANC_DATAELEMENT_GROUP)
            .selectDataElement(ANC_DATAELEMENT_NAME)
            .selectTab('Org Units')
            .unselectOuLevel('District')

        cy.getByDataTest('dhis2-uicore-checkbox').eq(1).click()

        Layer.openOu('Tonkolili').selectOu('Gbonkonlenken').addToMap()

        getMaps().click('center')

        cy.wait(POPUP_WAIT)
        cy.get('#dhis2-map-container')
            .findByDataTest('dhis2-uicore-componentcover', EXTENDED_TIMEOUT)
            .should('not.exist')

        getMaps().click('center')
        Layer.validatePopupContents(['Gbonkonlenken'])

        getMaps().click(500, 500)
        Layer.validatePopupContents(['Bo'])
    })

    it('adds a thematic layer with start and end date', () => {
        Layer.openDialog('Thematic')
            .selectIndicatorGroup(HIV_INDICATOR_GROUP)
            .selectIndicator(HIV_INDICATOR_NAME)
            .selectTab('Period')
            .selectStartEndDates()
            .typeStartDate(`${CURRENT_YEAR}-02-01`)
            .typeEndDate(`${CURRENT_YEAR}-11-30`)
            .selectTab('Org Units')
            .selectOu('Sierra Leone')
            .addToMap()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle(HIV_INDICATOR_NAME).validateCardPeriod(
            `Feb 1, ${CURRENT_YEAR} - Nov 30, ${CURRENT_YEAR}`
        )

        getMaps().should('have.length', 1)
    })

    it('opens a thematic layer popup with data and nodata', () => {
        Layer.openDialog('Thematic')
            .selectIndicatorGroup('Stock')
            .selectIndicator('BCG Stock PHU')
            .selectTab('Period')
            .selectStartEndDates()
            .typeStartDate(`${CURRENT_YEAR}-11-01`)
            .typeEndDate(`${CURRENT_YEAR}-11-30`)
            .selectTab('Style')
            .selectIncludeNoDataOU()
            .selectTab('Org Units')
            .unselectOuLevel('District')
            .selectOuLevel('Facility')
            .openOu('Western Area')
            .openOu('Rural Western Area')

        // Value: 0
        Layer.selectOu('Tokeh MCHP').addToMap()

        Layer.validateDialogClosed(true)

        cy.wait(POPUP_WAIT)
        cy.get('#dhis2-map-container')
            .findByDataTest('dhis2-uicore-componentcover', EXTENDED_TIMEOUT)
            .should('not.exist')
        getMaps().click('center') //Click in the middle of the map
        Layer.validatePopupContents(['Value: 0'])

        // Value: No data
        cy.getByDataTest('layer-edit-button').click()
        Layer.selectTab('Org Units')
            .unselectOu('Tokeh MCHP')
            .selectOu('Lakka Hospital')
            .updateMap()

        Layer.validateDialogClosed(true)

        cy.wait(POPUP_WAIT)
        cy.get('#dhis2-map-container')
            .findByDataTest('dhis2-uicore-componentcover', EXTENDED_TIMEOUT)
            .should('not.exist')
        getMaps().click('center') //Click in the middle of the map
        Layer.validatePopupContents(['Value: No data'])
    })

    it('adds a thematic layer with multiple periods', () => {
        const getNumericValue = (text) =>
            parseFloat(text.replace('Value: ', ''))

        Layer.openDialog('Thematic')
            .selectItemType('Data element')
            .selectDataElementGroup(ANC_DATAELEMENT_GROUP)
            .selectDataElement(ANC_DATAELEMENT_NAME)
            .selectTab('Period')
            .selectPeriodType({
                periodType: 'MONTHLY',
                periodDimension: 'fixed',
                n: 2,
                y: '2024',
            })
            .selectPeriodType({
                periodType: 'MONTHLY',
                periodDimension: 'fixed',
                n: 7,
                removeAll: false,
            })
            .addToMap()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle(ANC_DATAELEMENT_NAME)
        Layer.validateCardTitle(
            `March ${CURRENT_YEAR - 1}, September ${CURRENT_YEAR - 1}`
        )

        cy.wait(POPUP_WAIT)
        getMaps().click('center')

        Layer.validatePopupContents(['Tonkolili'])
        cy.get('.maplibregl-popup')
            .contains('Value:')
            .invoke('text')
            .then((step1Text) => {
                const val1 = getNumericValue(step1Text)
                cy.wrap(val1).as('val1') // Store as alias
            })

        cy.getByDataTest('layer-edit-button').click()
        Layer.selectTab('Period').selectPeriodType({
            periodType: 'MONTHLY',
            periodDimension: 'fixed',
            n: 2,
            y: '2024',
        })
        cy.getByDataTest('layeredit-addbtn').click()

        Layer.validateCardTitle(`March ${CURRENT_YEAR - 1}`)

        cy.wait(POPUP_WAIT)
        getMaps().click('center')

        Layer.validatePopupContents(['Tonkolili'])
        cy.get('.maplibregl-popup')
            .contains('Value:')
            .invoke('text')
            .then((step2Text) => {
                const val2 = getNumericValue(step2Text)
                cy.wrap(val2).as('val2') // Store as alias
            })

        cy.getByDataTest('layer-edit-button').click()
        Layer.selectTab('Period').selectPeriodType({
            periodType: 'MONTHLY',
            periodDimension: 'fixed',
            n: 8,
            y: '2024',
        })
        cy.getByDataTest('layeredit-addbtn').click()

        Layer.validateCardTitle(`September ${CURRENT_YEAR - 1}`)

        cy.wait(POPUP_WAIT)
        getMaps().click('center')

        Layer.validatePopupContents(['Tonkolili'])
        cy.get('.maplibregl-popup')
            .contains('Value:')
            .invoke('text')
            .then((step3Text) => {
                const val3 = getNumericValue(step3Text)
                cy.wrap(val3).as('val3') // Store as alias
            })

        cy.get('@val1').then((val1) => {
            cy.get('@val2').then((val2) => {
                cy.get('@val3').then((val3) => {
                    expect(val1).to.equal(val2 + val3)
                })
            })
        })
    })

    it('available rendering strategies depend on selected periods', () => {
        Layer.openDialog('Thematic').selectTab('Period').removeAllPeriods()
        cy.get('input[value="SINGLE"]').should('not.be.disabled')
        cy.get('input[value="TIMELINE"]').should('be.disabled')
        cy.get('div').contains('Timeline').realHover()
        cy.contains('Select at least 2 periods or 1 multi-period.').should(
            'be.visible'
        )
        cy.get('input[value="SPLIT_BY_PERIOD"]').should('be.disabled')
        cy.get('div').contains('Split').realHover()
        cy.contains('Select at least 2 periods or 1 multi-period.').should(
            'be.visible'
        )

        Layer.selectTab('Period').selectPeriodType({
            periodType: 'QUARTERLY',
            periodDimension: 'relative',
            n: 2,
            removeAll: false,
        })
        cy.get('input[value="SINGLE"]').should('not.be.disabled')
        cy.get('input[value="TIMELINE"]').should('not.be.disabled')
        cy.get('div').contains('Timeline').realHover()
        cy.contains('Select at least 2 periods or 1 multi-period.').should(
            'not.exist'
        )
        cy.get('input[value="SPLIT_BY_PERIOD"]').should('not.be.disabled')
        cy.get('div').contains('Split').realHover()
        cy.contains('Select at least 2 periods or 1 multi-period.').should(
            'not.exist'
        )

        Layer.selectTab('Period').selectPeriodType({
            periodType: 'DAILY',
            periodDimension: 'relative',
            n: 4,
            removeAll: false,
        })
        cy.get('input[value="SINGLE"]').should('not.be.disabled')
        cy.get('input[value="TIMELINE"]').should('not.be.disabled')
        cy.get('input[value="SPLIT_BY_PERIOD"]').should('be.disabled')
        cy.get('div').contains('Split').realHover()
        cy.contains(
            'Only up to a total of 12 periods (including those in multi-periods) can be selected.'
        ).should('be.visible')
    })

    it('adds a thematic layer with timeline period', () => {
        Layer.openDialog('Thematic')
            .selectIndicatorGroup(ANC_INDICATOR_GROUP)
            .selectIndicator(ANC_INDICATOR_NAME)
            .selectTab('Period')
            .selectPeriodType({
                periodType: 'QUARTERLY',
                periodDimension: 'relative',
                n: 2,
            })
            .selectPeriodType({
                periodType: 'YEARLY',
                periodDimension: 'fixed',
                n: 8,
                removeAll: false,
            })

        cy.get('[type="radio"]').should('have.length', 3)
        cy.get('[type="radio"]').check('TIMELINE')

        cy.getByDataTest('dhis2-uicore-modalactions')
            .contains('Add layer')
            .click()

        Layer.validateDialogClosed(true)

        // check that the first timeline period is shown in blue
        cy.get('.dhis2-map-period').should('be.visible')
        cy.get('svg.dhis2-map-timeline').find('rect').should('have.length', 5)
        cy.get('svg.dhis2-map-timeline')
            .find('rect')
            .first()
            .should('have.css', 'fill', 'rgb(20, 124, 215)')
            .and('have.css', 'fill-opacity', '1')

        cy.get('svg.dhis2-map-timeline')
            .find('rect')
            .last()
            .should('have.css', 'fill', 'rgb(255, 255, 255)')
            .and('have.css', 'fill-opacity', '0.8')

        cy.get('.play-icon').click()
        cy.get('.pause-icon').should('be.visible')
        cy.wait((5 - 1) * 1500)

        // check that the last timeline period is shown in blue
        cy.get('svg.dhis2-map-timeline')
            .find('rect')
            .first()
            .should('have.css', 'fill', 'rgb(255, 255, 255)')
            .and('have.css', 'fill-opacity', '0.8')

        cy.get('svg.dhis2-map-timeline')
            .find('rect')
            .last()
            .should('have.css', 'fill', 'rgb(20, 124, 215)')
            .and('have.css', 'fill-opacity', '1')
        cy.get('.play-icon').should('be.visible')

        Layer.openDialog('Thematic').selectTab('Period')

        cy.get('input[value="SINGLE"]').should('not.be.disabled')
        cy.get('input[value="TIMELINE"]').should('be.disabled')
        cy.get('div').contains('Timeline').realHover()
        cy.contains('Remove the existing timeline to add a new one.').should(
            'be.visible'
        )
        cy.get('input[value="SPLIT_BY_PERIOD"]').should('be.disabled')
        cy.get('div').contains('Split').realHover()
        cy.contains(
            'Remove all existing layers to add a split map view.'
        ).should('be.visible')
    })

    it('adds a thematic layer with split view period', () => {
        Layer.openDialog('Thematic')
            .selectIndicatorGroup(ANC_INDICATOR_GROUP)
            .selectIndicator(ANC_INDICATOR_NAME)
            .selectTab('Org Units')
            .selectOu('Sierra Leone')
            .selectTab('Period')
            .selectPeriodType({
                periodType: 'MONTHLY',
                periodDimension: 'relative',
                n: 2,
            })

        cy.get('[type="radio"]').should('have.length', 3)
        cy.get('[type="radio"]').check('SPLIT_BY_PERIOD')

        cy.getByDataTest('dhis2-uicore-modalactions')
            .contains('Add layer')
            .click()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle(ANC_INDICATOR_NAME)

        // check for 3 maps
        getMaps().should('have.length', 3)

        // wait to make sure the maps are loaded
        cy.wait(2000) // eslint-disable-line cypress/no-unnecessary-waiting

        expectContextMenuOptions([
            { name: DRILL_UP, disabled: true },
            { name: DRILL_DOWN },
            { name: VIEW_PROFILE },
        ])
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

    it('adds a thematic layer for data element', () => {
        Layer.openDialog('Thematic')
            .selectItemType('Data element')
            .selectDataElementGroup(ANC_DATAELEMENT_GROUP)
            .selectDataElement(ANC_DATAELEMENT_NAME)
            .addToMap()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle(ANC_DATAELEMENT_NAME)
        cy.getByDataTest(`card-ANC1stvisit`)
            .findByDataTest('layerlegend-item')
            .should('have.length', 5)

        getMaps().should('have.length', 1)
    })

    it('handles an error in the layer configuration', () => {
        cy.visit('/')

        Layer.openDialog('Thematic')
            .selectIndicatorGroup(HIV_INDICATOR_GROUP)
            .selectIndicator(HIV_INDICATOR_NAME)
            .selectTab('Period')
            .selectPeriodType({ periodType: 'YEARLY' })
            .selectTab('Org Units')
            .selectOu('Bo')
            .unselectOuLevel('District')
            .selectOuLevel('National')
            .addToMap()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle(HIV_INDICATOR_NAME)

        // check that loading completes and the layer card is present
        cy.getByDataTest('map-loading-mask').should('not.exist')

        cy.getByDataTest('layercard')
            .contains(HIV_INDICATOR_NAME)
            .should('be.visible')

        // check that an error is displayed in the layer card
        cy.getByDataTest('load-error-noticebox').should('be.visible')
        cy.getByDataTest('load-error-noticebox')
            .find('h6')
            .contains('Failed to load layer')
            .should('be.visible')
        cy.getByDataTest('dhis2-uicore-noticebox-content-message')
            .contains(
                'Organisation unit or organisation unit level is not valid'
            )
            .should('be.visible')

        // edit the layer to make it valid
        cy.getByDataTest('layer-edit-button').click()
        Layer.selectTab('Org Units')
            .unselectOuLevel('National')
            .selectOuLevel('Chiefdom')
            .updateMap()

        // confirm that the map is valid now
        cy.getByDataTest('layerlegend-item').should('have.length', 5)
    })

    it('adds a thematic layer with a filter', () => {
        Layer.openDialog('Thematic')
            .selectIndicatorGroup('ANC')
            .selectIndicator('ANC 1 Coverage')
            .selectTab('Filter')
            .addFilterDimensions('Facility Type', ['Hospital', 'Clinic'])
            .addToMap()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle('ANC 1 Coverage')

        Layer.validateLayerFilters({
            type: 'Facility Type',
            items: ['Hospital', 'Clinic'],
        })

        getMaps().should('have.length', 1)

        // edit the filter
        cy.getByDataTest('layer-edit-button').click()

        Layer.selectTab('Filter')
        cy.getByDataTest('dhis2-uicore-multiselect')
            .findByDataTest('dhis2-uicore-chip')
            .should('have.length', 2)

        Layer.removeFilterDimensions(['Clinic']).updateMap()

        Layer.validateLayerFilters({
            type: 'Facility Type',
            items: ['Hospital'],
            nonItems: ['Clinic'],
        })
    })
})
