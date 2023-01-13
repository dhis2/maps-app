// import { ThematicLayer } from '../elements/thematic_layer.js'
import { EXTENDED_TIMEOUT } from '../support/util.js'

context('OrgUnitInfo', () => {
    it('opens the panel for an OrgUnit', () => {
        cy.visit('/?id=ZBjCfSaLSqD', EXTENDED_TIMEOUT)
        cy.wait(5000) // eslint-disable-line cypress/no-unnecessary-waiting
        cy.get('canvas').should('be.visible')
        cy.get('.dhis2-map').click(300, 100) //Bombali
        cy.contains('View profile').click()

        // check the Org Unit Profile panel
        cy.getByDataTest('org-unit-profile').contains(
            'Organisation unit profile'
        )
        cy.getByDataTest('org-unit-info').find('h3').contains('Bombali')

        cy.getByDataTest('org-unit-data')
            .findByDataTest('button-previous-year')
            .click()

        cy.getByDataTest('org-unit-data')
            .findByDataTest('dhis2-uicore-circularloader')
            .should('not.exist')

        cy.getByDataTest('year-select').contains('2022')

        cy.getByDataTest('org-unit-data-table').contains('Expected pregnancies')
    })
})
