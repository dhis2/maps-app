import { Layer } from './layer.js'

export class ThematicLayer extends Layer {
    selectItemType(itemType) {
        cy.getByDataTest('thematic-layer-value-type-select').click()
        cy.contains(itemType).click()

        return this
    }
    selectIndicatorGroup(indicatorGroup) {
        cy.get('[data-test="indicatorgroupselect"]').click()
        cy.contains(indicatorGroup).click()

        return this
    }

    selectIndicator(indicator) {
        cy.get('[data-test="indicatorselect"]').click()
        cy.contains(indicator).click()

        return this
    }

    selectDataElementGroup(dataElementGroup) {
        cy.getByDataTest('dataelementgroupselect').click()
        cy.getByDataTest('dhis2-uicore-singleselectoption')
            .contains(dataElementGroup)
            .click()

        return this
    }

    selectDataElement(dataElement) {
        cy.getByDataTest('dataelementselect').click()
        cy.getByDataTest('dhis2-uicore-singleselectoption')
            .contains(dataElement)
            .click()

        return this
    }

    selectDataElementOperand(dataElementOperand) {
        cy.getByDataTest('dataelementoperandselect').click()
        cy.getByDataTest('dhis2-uicore-singleselectoption')
            .contains(dataElementOperand)
            .click()

        return this
    }

    selectPeriodType(periodType) {
        cy.get('[data-test="periodtypeselect"]').click()
        cy.contains(periodType).click()

        return this
    }
}
