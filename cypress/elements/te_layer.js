import { Layer } from './layer';

export class TeLayer extends Layer {
    selectTeType(type) {
        cy.get('[data-test="tetypeselect"]').click();
        cy.contains(type).click();

        return this;
    }

    selectTeProgram(program) {
        cy.get('[data-test="programselect"]')
            .contains('No program')
            .click();

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
