import { Layer } from './layer';

export class FacilityLayer extends Layer {
    selectGroupSet(groupSet) {
        cy.get('[data-test="orgunitgroupsetselect"]').click();

        cy.contains(groupSet).click();
        cy.get('body').click(); // Close the modal menu

        return this;
    }

    selectOuLevel(level) {
        cy.get('[data-test="orgunitlevelselect"]').click();

        cy.contains(level).click();
        cy.get('body').click(); // Close the modal menu

        return this;
    }
}
