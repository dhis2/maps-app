import { EXTENDED_TIMEOUT } from '../support/util.js'

const map = {
    id: 'eDlFx0jTtV9',
    name: 'ANC: LLITN Cov Chiefdom this year',
    downloadFileNamePrefix: 'ANC LLITN Cov Chiefdom this year',
    cardTitle: 'ANC LLITN coverage',
    cardSelector: 'card-ANCLLITNcoverage',
}

describe('ui', () => {
    it('collapses and expands the Layers Panel', () => {
        cy.visit(`/#/${map.id}`, EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        // check that Layers Panel is visible
        cy.getByDataTest('add-layer-button').should('be.visible')
        cy.getByDataTest('layers-panel').should('be.visible')
        cy.getByDataTest(map.cardSelector).should('be.visible')

        // collapse Layers Panel
        cy.getByDataTest('layers-toggle-button').click()

        // check that Layers Panel is not visible
        cy.getByDataTest('add-layer-button').should('be.visible') // this button is always visible
        // should have class collapsed
        cy.getByDataTest('layers-panel').should('not.be.visible')
        cy.getByDataTest('layers-panel').should('have.css', 'width', '0px')
        cy.getByDataTest(map.cardSelector).should('not.exist')

        // expand Layers Panel
        cy.getByDataTest('layers-toggle-button').click()

        // check that Layers Panel is visible
        cy.getByDataTest('add-layer-button').should('be.visible')
        cy.getByDataTest('layers-panel').should('be.visible')
        cy.getByDataTest(map.cardSelector).should('be.visible')
    })
})
