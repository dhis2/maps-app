import { Layer } from './layer';

export class BoundaryLayer extends Layer {
    selectOuLevel(level) {
        cy.get('[data-test="orgunitlevelselect"]').click();

        cy.contains(level).click();
        cy.get('body').click(); // Close the modal menu

        return this;
    }
}
