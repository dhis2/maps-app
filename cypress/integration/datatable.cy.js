import { EventLayer } from '../elements/event_layer.js'
import { CURRENT_YEAR, EXTENDED_TIMEOUT } from '../support/util.js'

describe('Data table', () => {
    it('opens the data table for a Thematic layer', () => {
        cy.visit('/?id=zDP78aJU8nX', EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        cy.get('[data-test="layercard"]')
            .find('h2')
            .contains('ANC 1 Coverage', EXTENDED_TIMEOUT)

        cy.getByDataTest('moremenubutton').first().click()

        cy.getByDataTest('more-menu')
            .find('li')
            .contains('Show data table')
            .not('disabled')
            .click()

        cy.getByDataTest('bottom-panel').should('be.visible')

        cy.get('.ReactVirtualized__Table__headerRow')
            .children()
            .should('have.length', 10)

        // eslint-disable-next-line cypress/unsafe-to-chain-command
        cy.getByDataTest('filter-input-legend').clear().type('Great')

        cy.get('.ReactVirtualized__Grid__innerScrollContainer')
            .children()
            .should('have.length', 5)

        cy.getByDataTest('moremenubutton').first().click()

        cy.getByDataTest('more-menu')
            .find('li')
            .contains('Hide data table')
            .not('disabled')
            .click()

        cy.getByDataTest('bottom-panel').should('not.exist')
    })

    it('opens the data table for an Event layer', () => {
        cy.visit('/', EXTENDED_TIMEOUT)

        const Layer = new EventLayer()

        Layer.openDialog('Events')
            .selectProgram('Malaria case registration')
            .validateStage('Malaria case registration')
            .selectTab('Period')
            .selectPeriodType('Start/end dates')
            .typeStartDate(`${CURRENT_YEAR - 1}-01-01`)
            .typeEndDate(`${CURRENT_YEAR - 1}-01-15`)
            .selectTab('Org Units')
            .selectOu('Bo')
            .addToMap()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle('Malaria case registration')

        cy.getByDataTest('moremenubutton').first().click()

        cy.getByDataTest('more-menu')
            .find('li')
            .contains('Show data table')
            .not('disabled')
            .click()

        cy.getByDataTest('bottom-panel').should('be.visible')

        cy.get('.ReactVirtualized__Table__headerRow')
            .children()
            .should('have.length', 9)

        cy.get('.ReactVirtualized__Table__headerRow')
            .contains('GENDER', { matchCase: false })
            .should('be.visible')
    })
})
