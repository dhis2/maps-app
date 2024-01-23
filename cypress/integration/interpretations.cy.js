import { saveNewMap, deleteMap } from '../elements/file_menu.js'
import { ThematicLayer } from '../elements/thematic_layer.js'
import { EXTENDED_TIMEOUT } from '../support/util.js'

const MAP_TITLE = 'test ' + new Date().toUTCString().slice(-24, -4)
context('Interpretations', () => {
    it('opens the interpretations panel for a map', () => {
        cy.visit('/#/ZBjCfSaLSqD', EXTENDED_TIMEOUT)
        const Layer = new ThematicLayer()
        Layer.validateCardTitle('ANC LLITN coverage')
        cy.get('canvas.maplibregl-canvas').should('be.visible')

        cy.get('button').contains('Interpretations').click()

        cy.contains('About this map').should('be.visible')

        cy.getByDataTest('interpretation-form')
            .find('input[type="text"]')
            .should('have.attr', 'placeholder', 'Write an interpretation')

        cy.get('p')
            .contains(
                'Koinadugu has a very high LLITN coverage despite low density of facilities providing nets.'
            )
            .should('be.visible')
    })

    it('view interpretation after creating a map', () => {
        const Layer = new ThematicLayer()
        cy.visit('/')
        Layer.openDialog('Thematic')
            .selectIndicatorGroup('ANC')
            .selectIndicator('ANC 1 Coverage')
            .selectTab('Org Units')
            .selectOu('Sierra Leone')
            .addToMap()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle('ANC 1 Coverage')
        cy.get('canvas.maplibregl-canvas').should('be.visible')

        saveNewMap(MAP_TITLE)

        cy.get('button').contains('Interpretations').click()

        cy.getByDataTest('interpretation-form')
            .find('input[type="text"]')
            .type('My interpretation of the map')

        cy.intercept('POST', /\/interpretations\/map/).as('postInterpretation')
        cy.get('button').contains('Post interpretation').click()

        cy.wait('@postInterpretation')
            .its('response.statusCode')
            .should('eq', 201)

        // Force wait because the See interpretations component
        // isn't loaded yet
        cy.wait(1000) // eslint-disable-line cypress/no-unnecessary-waiting

        cy.get('button').contains('See interpretation').click()

        cy.getByDataTest('dhis2-uicore-modalcontent')
            .find('canvas.maplibregl-canvas')
            .should('be.visible')

        cy.url().should('include', 'interpretationId=')

        cy.get('button').contains('Hide interpretation').click()

        cy.url().should('not.include', 'interpretationId=')

        deleteMap()
    })

    it('opens and closes the interpretation panel', () => {
        cy.intercept({ method: 'POST', url: /dataStatistics/ }).as(
            'postDataStatistics'
        )
        cy.visit(
            '/#/ZBjCfSaLSqD?interpretationId=yKqhXZdeJ6a',
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

        cy.url().should('include', 'interpretationId=')

        cy.getByDataTest('interpretation-modal')
            .findByDataTest('dhis2-modal-close-button')
            .click()

        cy.getByDataTest('interpretation-modal').should('not.exist')

        cy.url().should('not.include', 'interpretationId=')

        cy.getByDataTest('interpretations-list').should('be.visible')
    })
})
