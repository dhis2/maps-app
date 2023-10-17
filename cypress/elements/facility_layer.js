import { Layer } from './layer.js'

export class FacilityLayer extends Layer {
    selectGroupSet(groupSet) {
        cy.getByDataTest('org-unit-group-select').click()

        cy.contains(groupSet).click()
        cy.get('body').click() // Close the modal menu

        return this
    }

    selectOuLevel(level) {
        cy.getByDataTest('org-unit-level-select').click()

        cy.contains(level).click()
        cy.get('body').click() // Close the modal menu

        return this
    }
}
