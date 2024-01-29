import { EXTENDED_TIMEOUT } from '../support/util.js'

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
        cy.visit(`/#/${map.id}`, EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

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

        // check number of columns
        cy.getByDataTest('bottom-panel')
            .findByDataTest('dhis2-uicore-datatablecellhead')
            .should('have.length', 10)

        // Filter by name
        cy.getByDataTest('bottom-panel')
            .findByDataTest('dhis2-uicore-datatablecellhead')
            .containsExact('Name')
            .siblings('input')
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
        cy.getByDataTest('bottom-panel')
            .findByDataTest('dhis2-uicore-datatablecellhead')
            .containsExact('Value')
            .siblings('input')
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
    })
})
