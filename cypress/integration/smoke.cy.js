import { ThematicLayer } from '../elements/thematic_layer.js'
import { EXTENDED_TIMEOUT } from '../support/util.js'

context('Smoke Test', () => {
    it('loads', () => {
        cy.visit('/', EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')
        cy.title().should('equal', 'Maps | DHIS2')
    })

    it('loads with map id', () => {
        cy.intercept({ method: 'POST', url: /dataStatistics/ }).as(
            'postDataStatistics'
        )
        cy.visit('/?id=ytkZY3ChM6J', EXTENDED_TIMEOUT) //ANC: 3rd visit coverage last year by district

        cy.wait('@postDataStatistics')
            .its('response.statusCode')
            .should('eq', 201)

        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        const Layer = new ThematicLayer()
        Layer.validateCardTitle('ANC 3 Coverage')
    })

    it('loads currentAnalyticalObject', () => {
        cy.intercept('**/userDataStore/analytics/settings', {
            fixture: 'analyticalObject.json',
        })

        cy.visit('/?currentAnalyticalObject=true', EXTENDED_TIMEOUT)
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible')

        cy.contains('button', 'Proceed').click()

        const Layer = new ThematicLayer()
        Layer.validateCardTitle('ANC 1 Coverage')
        cy.get('canvas.maplibregl-canvas').should('be.visible')
    })

    it('loads with map id and interpretationid lowercase', () => {
        cy.intercept({ method: 'POST', url: /dataStatistics/ }).as(
            'postDataStatistics'
        )
        cy.visit(
            '/?id=ZBjCfSaLSqD&interpretationid=yKqhXZdeJ6a',
            EXTENDED_TIMEOUT
        ) //ANC: LLITN coverage district and facility

        cy.wait('@postDataStatistics')
            .its('response.statusCode')
            .should('eq', 201)

        cy.getByDataTest('interpretation-modal')
            .find('h1')
            .contains(
                'Viewing interpretation: ANC: LLITN coverage district and facility'
            )
            .should('be.visible')

        cy.getByDataTest('interpretation-modal')
            .find('canvas')
            .should('be.visible')

        cy.getByDataTest('interpretation-modal')
            .contains(
                'Koinadugu has a very high LLITN coverage despite low density of facilities providing nets.'
            )
            .should('be.visible')
    })

    it('loads with map id and interpretationId uppercase', () => {
        cy.intercept({ method: 'POST', url: /dataStatistics/ }).as(
            'postDataStatistics'
        )
        cy.visit(
            '/?id=ZBjCfSaLSqD&interpretationId=yKqhXZdeJ6a',
            EXTENDED_TIMEOUT
        ) //ANC: LLITN coverage district and facility

        cy.wait('@postDataStatistics')
            .its('response.statusCode')
            .should('eq', 201)

        cy.getByDataTest('interpretation-modal')
            .find('h1')
            .contains(
                'Viewing interpretation: ANC: LLITN coverage district and facility'
            )
    })
})
