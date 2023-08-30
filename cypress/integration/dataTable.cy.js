import { EXTENDED_TIMEOUT } from '../support/util.js'

const map = {
    id: 'eDlFx0jTtV9',
    name: 'ANC: LLITN Cov Chiefdom this year',
    downloadFileNamePrefix: 'ANC LLITN Cov Chiefdom this year',
    cardTitle: 'ANC LLITN coverage',
}

// const openMoreMenuWithOptions = (numOptions) => {
//     cy.get('[data-test="moremenubutton"]').first().click()

//     cy.get('[data-test="more-menu"]')
//         .find('li')
//         .not('.disabled')
//         .should('have.length', numOptions)

//     cy.get('[data-test="more-menu"]')
//         .find('li')
//         .contains('Show data table')
//         .click()

//     //check that the bottom panel is present
//     cy.getByDataTest('bottom-panel').should('be.visible')

//     // option switched to "Hide data table"

// }

describe('data table', () => {
    it('opens data table', () => {
        cy.visit(`/?id=${map.id}`, EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        cy.get('[data-test="moremenubutton"]').first().click()

        cy.get('[data-test="more-menu"]')
            .find('li')
            .not('.disabled')
            .should('have.length', 6)

        cy.get('[data-test="more-menu"]')
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
