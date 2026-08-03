import { Layer as OrgUnitLayer } from '../../elements/layer.js'

describe('Duplicate layer', () => {
    beforeEach(() => {
        cy.visit('/')
    })

    it('duplicates a layer and inserts it below the source', () => {
        const Layer = new OrgUnitLayer()

        Layer.openDialog('Org units')
            .selectOu('Sierra Leone')
            .selectOuLevel('District')
            .addToMap()

        Layer.validateDialogClosed(true)
        Layer.validateCardTitle('Organisation units')

        cy.getByDataTest('sortable-layers-list')
            .children()
            .should('have.length', 1)

        cy.getByDataTest('moremenubutton').first().click()

        cy.getByDataTest('more-menu')
            .find('li')
            .contains('Duplicate layer')
            .click()

        cy.getByDataTest('sortable-layers-list')
            .children()
            .should('have.length', 2)

        // both cards have the same title
        cy.getByDataTest('sortable-layers-list')
            .children()
            .each(($card) => {
                cy.wrap($card).contains('Organisation units')
            })

        // the duplicate is inserted directly below (second card)
        cy.getByDataTest('sortable-layers-list')
            .children()
            .first()
            .should('contain', 'Organisation units')
    })
})
