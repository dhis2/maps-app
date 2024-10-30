import { TeLayer } from '../../elements/te_layer.js'
import { EXTENDED_TIMEOUT } from '../../support/util.js'

describe('Tracked Entity Layers', () => {
    beforeEach(() => {
        cy.visit('/', EXTENDED_TIMEOUT)
    })

    const Layer = new TeLayer()

    it('adds a tracked entity layer', () => {
        Layer.openDialog('Tracked entities')
            .selectTab('Data')
            .selectTeType('Malaria Entity')
            .selectTeProgram(
                'Malaria case diagnosis, treatment and investigation'
            )
            .selectTab('Org Units')
            .selectOu('Bombali')
            .selectOu('Bo')
            .addToMap()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle(
            'Malaria case diagnosis, treatment and investigation'
        )
        Layer.validateCardItems(['Malaria Entity'])
    })

    it('opens a tracked entity layer popup', () => {
        Layer.openDialog('Tracked entities')
            .selectTab('Data')
            .selectTeType('Focus area')
            .selectTeProgram('Malaria focus investigation')
            .selectTab('Period')
            .typeStartDate('2018-01-01')
            .selectTab('Org Units')

        cy.getByDataTest('org-unit-tree-node')
            .contains('Bo')
            .parents('[data-test="org-unit-tree-node"]')
            .first()
            .within(() => {
                cy.getByDataTest('org-unit-tree-node-toggle').click()
            })

        cy.getByDataTest('org-unit-tree-node')
            .contains('Badjia')
            .parents('[data-test="org-unit-tree-node"]')
            .first()
            .within(() => {
                cy.getByDataTest('org-unit-tree-node-toggle').click()
            })

        cy.getByDataTest('org-unit-tree-node').contains('Njandama MCHP').click()

        cy.getByDataTest('layeredit-addbtn').click()

        Layer.validateDialogClosed(true)

        cy.wait(5000) // eslint-disable-line cypress/no-unnecessary-waiting
        cy.get('#dhis2-map-container')
            .findByDataTest('dhis2-uicore-componentcover', EXTENDED_TIMEOUT)
            .should('not.exist')
        cy.get('.dhis2-map').click(350, 350) //Click somewhere on the map

        cy.get('.maplibregl-popup')
            .contains('Organisation unit')
            .should('be.visible')
        cy.get('.maplibregl-popup')
            .contains('Last updated')
            .should('be.visible')

        cy.get('.maplibregl-popup')
            .contains('System Focus ID')
            .should('be.visible')
        cy.get('.maplibregl-popup').contains('WQQ003161').should('be.visible')

        Layer.validateCardTitle('Malaria focus investigation')
        Layer.validateCardItems(['Focus area'])
    })
})
