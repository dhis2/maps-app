import { EventLayer } from '../elements/event_layer.js'
import {
    MENU_HEIGHT,
    IFRAME_HEADER_HEIGHT,
    GLOBAL_HEADER_HEIGHT,
    assertMapPosition,
} from '../elements/map_canvas.js'
import { ThematicLayer } from '../elements/thematic_layer.js'
import { CURRENT_YEAR, EXTENDED_TIMEOUT } from '../support/util.js'

Cypress.on('uncaught:exception', (err) => {
    if (
        err.message.includes(
            'ResizeObserver loop completed with undelivered notifications.'
        )
    ) {
        return false
    }
})

const map = {
    id: 'eDlFx0jTtV9',
    name: 'ANC: LLITN Cov Chiefdom this year',
    downloadFileNamePrefix: 'ANC LLITN Cov Chiefdom this year',
    cardTitle: 'ANC LLITN coverage',
}

const checkTableCell = ({ row = 0, column = 0, expectedContent }) => {
    cy.getByDataTest('bottom-panel')
        .findByDataTest('dhis2-uicore-tablebody')
        .find('tr')
        .eq(row)
        .find('td')
        .eq(column)
        .should('contain', expectedContent)
}

describe('data table', () => {
    it('opens data table and filters and sorts', () => {
        const viewportHeight = Cypress.config('viewportHeight')
        const expectedBottoms1 = [viewportHeight]
        const expectedHeights1 = [
            GLOBAL_HEADER_HEIGHT,
            IFRAME_HEADER_HEIGHT,
        ].map((h) => viewportHeight - h - MENU_HEIGHT)

        cy.visit(`/#/${map.id}`, EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        //check that the map resizes properly
        assertMapPosition(expectedBottoms1, expectedHeights1)

        cy.getByDataTest('moremenubutton').first().click()

        cy.getByDataTest('more-menu')
            .find('li')
            .not('.disabled')
            .should('have.length', 6)

        cy.getByDataTest('more-menu')
            .find('li')
            .contains('Show data table')
            .click()

        //check that the bottom panel is present
        cy.getByDataTest('bottom-panel').should('be.visible')

        //check that the map resizes properly
        cy.getByDataTest('bottom-panel')
            .invoke('height')
            .then((height) => {
                const expectedBottoms2 = [viewportHeight - height]
                const expectedHeights2 = [
                    GLOBAL_HEADER_HEIGHT,
                    IFRAME_HEADER_HEIGHT,
                ].map((h) => viewportHeight - h - MENU_HEIGHT - height)
                assertMapPosition(expectedBottoms2, expectedHeights2)
            })

        // check number of columns
        cy.getByDataTest('bottom-panel')
            .findByDataTest('dhis2-uicore-datatablecellhead')
            .should('have.length', 10)

        // Filter by name
        cy.getByDataTest('data-table-column-filter-input-Name')
            .find('input')
            .type('bar')

        // check that the filter returned the correct number of rows
        cy.getByDataTest('bottom-panel')
            .findByDataTest('dhis2-uicore-tablebody')
            .findByDataTest('dhis2-uicore-datatablerow')
            .should('have.length', 7)

        // confirm that the sort order is initially ascending by Name
        checkTableCell({ row: 0, column: 1, expectedContent: 'Bargbe' })
        checkTableCell({ row: 6, column: 1, expectedContent: 'Upper Bambara' })

        // Sort by name
        cy.get('button[title="Sort by Name"]').click()

        // confirm that the rows are sorted by Name descending
        checkTableCell({ row: 0, column: 1, expectedContent: 'Upper Bambara' })
        checkTableCell({ row: 6, column: 1, expectedContent: 'Bargbe' })

        // filter by Value (numeric)
        cy.getByDataTest('data-table-column-filter-input-Value')
            .find('input')
            .type('>26')

        // check that the (combined) filter returned the correct number of rows
        cy.getByDataTest('bottom-panel')
            .findByDataTest('dhis2-uicore-tablebody')
            .findByDataTest('dhis2-uicore-datatablerow')
            .should('have.length', 5)

        // Sort by value
        cy.get('button[title="Sort by Value"]').click()

        // check that the rows are sorted by Value ascending
        checkTableCell({ row: 0, column: 3, expectedContent: '35' })
        checkTableCell({ row: 4, column: 3, expectedContent: '76' })

        // click on a row
        cy.getByDataTest('bottom-panel')
            .findByDataTest('dhis2-uicore-tablebody')
            .findByDataTest('dhis2-uicore-datatablerow')
            .first()
            .click()

        // check that the org unit profile drawer is opened
        cy.getByDataTest('org-unit-profile').should('be.visible')

        // close the datatable
        cy.getByDataTest('moremenubutton').first().click()
        cy.getByDataTest('more-menu')
            .find('li')
            .contains('Hide data table')
            .click()

        //check that the bottom panel is closed
        cy.getByDataTest('bottom-panel').should('not.exist')

        //check that the map resizes properly
        assertMapPosition(expectedBottoms1, expectedHeights1)
    })

    it('opens the data table for an Event layer', () => {
        cy.visit('/', EXTENDED_TIMEOUT)

        const Layer = new EventLayer()

        Layer.openDialog('Events')
            .selectProgram('Inpatient morbidity and mortality')
            .validateStage('Inpatient morbidity and mortality')
            .selectTab('Period')
            .selectPeriodType({ periodType: 'Start/end dates' })
            .typeStartDate(`${CURRENT_YEAR - 1}-01-01`)
            .typeEndDate(`${CURRENT_YEAR - 1}-01-03`)
            .addToMap()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle('Inpatient morbidity and mortality')

        cy.getByDataTest('moremenubutton').first().click()

        cy.getByDataTest('more-menu')
            .find('li')
            .contains('Show data table')
            .not('disabled')
            .click()

        cy.getByDataTest('bottom-panel').should('be.visible')

        // check number of columns
        cy.getByDataTest('bottom-panel')
            .findByDataTest('dhis2-uicore-datatablecellhead')
            .should('have.length', 10)

        cy.getByDataTest('bottom-panel')
            .findByDataTest('dhis2-uicore-datatablecellhead')
            .contains('Age in years', { matchCase: false })
            .should('be.visible')

        // filter by Org unit
        const ouName = 'Moyowa'
        cy.getByDataTest('data-table-column-filter-input-Org unit')
            .find('input')
            .type(ouName)

        // check that all the rows have Org unit Moyowa
        checkTableCell({ row: 0, column: 1, expectedContent: ouName })
        checkTableCell({ row: 2, column: 1, expectedContent: ouName })

        cy.getByDataTest('bottom-panel')
            .findByDataTest('dhis2-uicore-tablebody')
            .findByDataTest('dhis2-uicore-datatablerow')
            .should('have.length', 3)

        // filter by Mode of Discharge
        cy.getByDataTest('data-table-column-filter-input-Mode of Discharge')
            .find('input')
            .type('Absconded')

        cy.getByDataTest('bottom-panel')
            .findByDataTest('dhis2-uicore-tablebody')
            .findByDataTest('dhis2-uicore-datatablerow')
            .should('have.length', 1)

        cy.getByDataTest('data-table-column-filter-input-Mode of Discharge')
            .find('input')
            .clear()

        cy.getByDataTest('bottom-panel')
            .findByDataTest('dhis2-uicore-tablebody')
            .findByDataTest('dhis2-uicore-datatablerow')
            .should('have.length', 3)

        // filter by Age in years (numeric)
        cy.getByDataTest('data-table-column-filter-input-Age in years')
            .find('input')
            .type('<51')

        // check that the filter returned the correct number of rows
        cy.getByDataTest('bottom-panel')
            .findByDataTest('dhis2-uicore-tablebody')
            .findByDataTest('dhis2-uicore-datatablerow')
            .should('have.length', 2)

        // Sort by Age in years
        cy.get('button[title="Sort by Age in years"]').click()

        // confirm that the rows are sorted by Age in years descending
        checkTableCell({ row: 0, column: 7, expectedContent: '32' })
        checkTableCell({ row: 1, column: 7, expectedContent: '6' })

        // click on a row
        cy.getByDataTest('bottom-panel')
            .findByDataTest('dhis2-uicore-tablebody')
            .findByDataTest('dhis2-uicore-datatablerow')
            .first()
            .click()

        // check that the org unit profile drawer is NOT opened
        cy.getByDataTest('org-unit-profile').should('not.exist')
    })

    it('places undefined data at the end when sorting', () => {
        cy.visit('/')

        const Layer = new ThematicLayer()

        const INDICATOR_NAME = 'Measles Coverage <1y'

        Layer.openDialog('Thematic')
            .selectIndicatorGroup('Immunization')
            .selectIndicator(INDICATOR_NAME)
            .selectTab('Period')
            .selectPeriodType({
                periodType: 'MONTHLY',
                periodDimension: 'fixed',
                n: 3, // April
                y: CURRENT_YEAR,
            })
            .selectTab('Org Units')
            .unselectOu('Sierra Leone')
            .selectOu('Bonthe')
            .unselectOuLevel('District')
            .selectOuLevel('Facility')
            .selectTab('Style')
            .selectIncludeNoDataOU()
            .addToMap()

        Layer.validateDialogClosed(true)
        Layer.validateCardTitle(INDICATOR_NAME)

        // Open the data table
        cy.getByDataTest('moremenubutton').first().click()
        cy.getByDataTest('more-menu')
            .find('li')
            .contains('Show data table')
            .click()

        // Check that the bottom panel is present
        cy.getByDataTest('bottom-panel').should('be.visible')

        // Confirm that the sort order is initially ascending by Name
        checkTableCell({ row: 0, column: 1, expectedContent: 'Bendu CHC' })

        cy.get('button[title="Sort by Value"]').click()

        // Check that first row has Gbamgbama CHC with value 117.98
        checkTableCell({ row: 0, column: 1, expectedContent: 'Gbamgbama CHC' })
        checkTableCell({ row: 0, column: 3, expectedContent: '117.98' })

        // Check that row 5 has Tihun CHC with value 28.63
        checkTableCell({ row: 5, column: 1, expectedContent: 'Tihun CHC' })
        checkTableCell({ row: 5, column: 3, expectedContent: '28.63' })

        // Check that row 6 has no value (undefined)
        checkTableCell({ row: 6, column: 3, expectedContent: '' })

        // Sort ascending by Value
        cy.get('button[title="Sort by Value"]').click()

        checkTableCell({ row: 0, column: 1, expectedContent: 'Tihun CHC' })
        checkTableCell({ row: 0, column: 3, expectedContent: '28.63' })

        checkTableCell({ row: 5, column: 1, expectedContent: 'Gbamgbama CHC' })
        checkTableCell({ row: 5, column: 3, expectedContent: '117.98' })

        checkTableCell({ row: 6, column: 3, expectedContent: '' })

        // Sort by index and scroll to the top
        cy.get('button[title="Sort by Index"]').click()
        cy.get('[data-test-id="virtuoso-scroller"]').scrollTo('top')

        checkTableCell({ row: 0, column: 0, expectedContent: '28' })

        // Check that row 0 range value is empty
        checkTableCell({ row: 0, column: 5, expectedContent: '' })

        // Sort by range, which is a string
        cy.get('button[title="Sort by Range"]').click()

        // Check that row 0 range value has value '0-40'
        checkTableCell({ row: 0, column: 5, expectedContent: '0 - 40' })

        // Check that row 5 range value has value '90 - 120'
        checkTableCell({ row: 5, column: 5, expectedContent: '90 - 120' })

        // Check that row 6 range value is empty
        checkTableCell({ row: 6, column: 5, expectedContent: '' })
    })
})
