import { EXTENDED_TIMEOUT } from '../support/util.js'

const map = {
    id: 'eDlFx0jTtV9',
    name: 'ANC: LLITN Cov Chiefdom this year',
    downloadFileNamePrefix: 'ANC LLITN Cov Chiefdom this year',
    cardTitle: 'ANC LLITN coverage',
}

describe('data table', () => {
    it('opens data table', () => {
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
            .find('[role="columnheader"]')
            .should('have.length', 10)

        // try the filtering
        cy.getByDataTest('bottom-panel')
            .find('[role="columnheader"]')
            .containsExact('Name')
            .siblings('input')
            .type('Kakua')
    })
})
