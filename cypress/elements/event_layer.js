import { Layer } from './layer';

export class EventLayer extends Layer {
    selectProgram(program) {
        cy.get('[data-test="programselect"]').click();
        cy.contains(program).click();

        return this;
    }
}
