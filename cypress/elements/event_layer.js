import { Layer } from './layer';

export class EventLayer extends Layer {
    selectProgram(program) {
        cy.get('[data-test="programselect"]').click();
        cy.contains(program).click();

        return this;
    }

    selectStage(stage) {
        cy.get('[data-test="programstageselect"]').click();
        cy.contains(stage).click();

        return this;
    }

    validateStage(stage) {
        cy.get('[data-test="programstageselect"]')
            .contains(stage)
            .should('be.visible');

        return this;
    }
}
