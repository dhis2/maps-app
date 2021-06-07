import { Layer } from './layer';

export class ThematicLayer extends Layer {
    selectIndicatorGroup(indicatorGroup) {
        cy.get('[data-test="indicatorgroupselect"]').click();
        cy.contains(indicatorGroup).click();

        return this;
    }

    selectIndicator(indicator) {
        cy.get('[data-test="indicatorselect"]').click();
        cy.contains(indicator).click();

        return this;
    }

    selectPeriodType(periodType) {
        cy.get('[data-test="periodtypeselect"]').click();
        cy.contains(periodType).click();

        return this;
    }
}
