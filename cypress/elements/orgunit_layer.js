import { Layer } from './layer.js'

export class OrgUnitLayer extends Layer {
    selectOuLevel(level) {
        cy.getByDataTest('org-unit-level-select').click()

        cy.contains(level).click()
        cy.get('body').click() // Close the modal menu

        return this
    }
}
