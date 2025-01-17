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

    selectRelativePeriod(period) {
        cy.get('[data-test="relative-period-select"]').click()
        cy.contains(period).click()

        return this
    }

    removeAllPeriods() {
        cy.getByDataTest('period-dimension-transfer-actions-removeall').click()

        return this
    }

    selectPeriodType({
        periodType,
        periodDimension = 'fixed',
        n = 'last',
        y = '',
        removeAll = true,
    } = {}) {
        if (!periodType) {
            throw new Error("The 'periodType' parameter is required.")
        }

        // Select fixed / relative periods
        cy.getByDataTest(
            `period-dimension-${periodDimension}-periods-button`
        ).click()
        // Open dropdown for period type
        cy.getByDataTest(
            `period-dimension-${periodDimension}-period-filter${
                periodDimension === 'fixed' ? '-period-type' : ''
            }-content`
        ).click()
        // Select period type in dropdown if not active already
        cy.get(`[data-value="${periodType}"]`).then(($el) => {
            if ($el.hasClass('active')) {
                cy.get('body').click('topLeft')
            } else {
                cy.wrap($el).click()
            }
        })

        if (removeAll) {
            cy.getByDataTest(
                'period-dimension-transfer-actions-removeall'
            ).click()
        }

        if (y !== '') {
            cy.getByDataTest(
                'period-dimension-fixed-period-filter-year-content'
            )
                .get('input[type="number"]')
                .clear()
                .type(y)
        }
        if (n === 'last') {
            cy.getByDataTest('period-dimension-transfer-option-content')
                .last()
                .dblclick()
        } else {
            cy.getByDataTest('period-dimension-transfer-option-content')
                .eq(n)
                .dblclick()
        }

        return this
    }

    selectPresets() {
        cy.contains('Choose from presets').click()

        return this
    }
    selectStartEndDates() {
        cy.contains('Define start - end dates').click()

        return this
    }

    selectIncludeNoDataOU() {
        cy.contains('Include org units with no data').click()

        return this
    }
}
