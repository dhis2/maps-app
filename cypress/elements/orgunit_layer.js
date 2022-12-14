import { Layer } from './layer.js'

export class OrgUnitLayer extends Layer {
    selectOuLevel(level) {
        cy.get('[data-test="orgunitlevelselect"]').click()

        cy.contains(level).click()
        cy.get('body').click() // Close the modal menu

        return this
    }
}
