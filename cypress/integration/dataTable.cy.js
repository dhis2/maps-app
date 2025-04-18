import { EventLayer } from '../elements/event_layer.js'
import {
    MENU_HEIGHT,
    IFRAME_HEADER_HEIGHT,
    GLOBAL_HEADER_HEIGHT,
    assertMapPosition,
} from '../elements/map_canvas.js'
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
        cy.getByDataTest('bottom-panel')
            .findByDataTest('dhis2-uicore-tablebody')
            .find('tr')
            .first()
            .find('td')
            .eq(1)
            .should('contain', 'Bargbe')

        cy.getByDataTest('bottom-panel')
            .findByDataTest('dhis2-uicore-tablebody')
            .find('tr')
            .last()
            .find('td')
            .eq(1)
            .should('contain', 'Upper Bambara')

        // Sort by name
        cy.get('button[title="Sort by Name"]').click()

        // confirm that the rows are sorted by Name descending
        cy.getByDataTest('bottom-panel')
            .findByDataTest('dhis2-uicore-tablebody')
            .find('tr')
            .first()
            .find('td')
            .eq(1)
            .should('contain', 'Upper Bambara')

        cy.getByDataTest('bottom-panel')
            .findByDataTest('dhis2-uicore-tablebody')
            .find('tr')
            .last()
            .find('td')
            .eq(1)
            .should('contain', 'Bargbe')

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
        cy.getByDataTest('bottom-panel')
            .findByDataTest('dhis2-uicore-tablebody')
            .find('tr')
            .first()
            .find('td')
            .eq(3)
            .should('contain', '35')

        cy.getByDataTest('bottom-panel')
            .findByDataTest('dhis2-uicore-tablebody')
            .find('tr')
            .last()
            .find('td')
            .eq(3)
            .should('contain', '76')

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

        cy.getByDataTest('bottom-panel')
            .findByDataTest('dhis2-uicore-tablebody')
            .find('tr')
            .first()
            .find('td')
            .eq(1)
            .should('contain', ouName)

        cy.getByDataTest('bottom-panel')
            .findByDataTest('dhis2-uicore-tablebody')
            .find('tr')
            .last()
            .find('td')
            .eq(1)
            .should('contain', ouName)

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
        cy.getByDataTest('bottom-panel')
            .findByDataTest('dhis2-uicore-tablebody')
            .find('tr')
            .first()
            .find('td')
            .eq(7)
            .should('contain', '32')

        cy.getByDataTest('bottom-panel')
            .findByDataTest('dhis2-uicore-tablebody')
            .find('tr')
            .last()
            .find('td')
            .eq(7)
            .should('contain', '6')

        // click on a row
        cy.getByDataTest('bottom-panel')
            .findByDataTest('dhis2-uicore-tablebody')
            .findByDataTest('dhis2-uicore-datatablerow')
            .first()
            .click()

        // check that the org unit profile drawer is NOT opened
        cy.getByDataTest('org-unit-profile').should('not.exist')
    })
})
