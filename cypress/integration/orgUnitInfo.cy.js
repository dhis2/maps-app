import { CURRENT_YEAR, EXTENDED_TIMEOUT } from '../support/util.js'

describe('OrgUnitInfo', () => {
    it('opens the panel for an OrgUnit', () => {
        cy.visit('/#/ZBjCfSaLSqD', EXTENDED_TIMEOUT)
        cy.get('canvas').should('be.visible')

        cy.wait(3000) // eslint-disable-line cypress/no-unnecessary-waiting
        cy.get('#dhis2-map-container')
            .findByDataTest('dhis2-uicore-componentcover', EXTENDED_TIMEOUT)
            .should('not.exist')
        cy.get('.dhis2-map').click(350, 350) //Click somewhere on the map

        cy.get('.maplibregl-popup').contains('View profile').click()

        // check the Org Unit Profile panel
        cy.getByDataTest('org-unit-profile').contains(
            'Organisation unit profile'
        )

        // // TODO - find a way to ensure that "Bombali" is the orgunit that was clicked on
        // // cy.getByDataTest('org-unit-info').find('h3').contains('Bombali')

        cy.getByDataTest('org-unit-data')
            .findByDataTest('button-previous-year')
            .click()

        cy.getByDataTest('org-unit-data')
            .findByDataTest('dhis2-uicore-circularloader')
            .should('not.exist')

        cy.getByDataTest('year-select').contains(CURRENT_YEAR - 1)

        cy.getByDataTest('org-unit-data-table').contains('Expected pregnancies')
    })
})
