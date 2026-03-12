import { Layer } from './layer.js'

export class ThematicLayer extends Layer {
    selectItemType(itemType) {
        cy.getByDataTest(
            'data-dimension-left-header-data-types-select-field-content'
        ).click()
        cy.contains(itemType).click()
        return this
    }
    selectGroup(group) {
        cy.getByDataTest(
            'data-dimension-left-header-groups-select-field-content'
        ).click()
        cy.getByDataTest('dhis2-uicore-select-menu-menuwrapper')
            .contains(group)
            .click()
        return this
    }
    selectSubGroup(subGroup) {
        cy.getByDataTest(
            'data-dimension-left-header-sub-group-select-field-content'
        ).click()
        cy.getByDataTest('dhis2-uicore-select-menu-menuwrapper')
            .contains(subGroup)
            .click()
        return this
    }
    selectDataItem(dataItem) {
        cy.getByDataTest('data-dimension-transfer-sourceoptions')
            .contains(dataItem)
            .click()
        cy.getByDataTest(
            'data-dimension-transfer-actions-addindividual'
        ).click()
        return this
    }

    selectIndicatorGroup(indicatorGroup) {
        return this.selectGroup(indicatorGroup)
    }
    selectIndicator(indicator) {
        return this.selectDataItem(indicator)
    }

    selectDataElementGroup(dataElementGroup) {
        return this.selectGroup(dataElementGroup)
    }
    selectDataElement(dataElement) {
        return this.selectDataItem(dataElement)
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
            }`
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
            cy.getByDataTest(
                'period-dimension-fixed-period-filter-year-content'
            )
                .get('input[type="number"]')
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

    selectChoropleth() {
        cy.contains('Choropleth').click()

        return this
    }

    selectBubbleMap() {
        cy.contains('Bubble map').click()

        return this
    }

    selectIncludeNoDataOU() {
        cy.contains('Include org units with no data').click()

        return this
    }

    addFilterDimensions(dimensionName, dimensionItemNames) {
        cy.intercept({ method: 'GET', url: /\/dimensions/ }).as(
            'fetchDimensions'
        )
        cy.get('button').contains('Add filter').click()

        cy.wait('@fetchDimensions')

        cy.getByDataTest('dimension-select-field').click()
        cy.get('input[placeholder="Filter dimensions"]').type(dimensionName)

        cy.get('li').contains(dimensionName).click()

        cy.getByDataTest('dimension-items-select-field').click()

        dimensionItemNames.forEach((name) => {
            cy.getByDataTest('dhis2-uicore-checkbox').contains(name).click()
        })

        // Confirm that the items are checked
        dimensionItemNames.forEach((name) => {
            cy.getByDataTest('dhis2-uicore-checkbox')
                .contains(name)
                .parent()
                .find('input[type="checkbox"]')
                .should('be.checked')
        })

        cy.getByDataTest('dhis2-uicore-layer').last().click('topLeft')

        return this
    }

    removeFilterDimensions(dimensionItemNames) {
        dimensionItemNames.forEach((name) => {
            cy.getByDataTest('dhis2-uicore-chip')
                .contains(name)
                .siblings('[data-test="dhis2-uicore-chip-remove"]')
                .click()
        })

        dimensionItemNames.forEach((name) => {
            cy.getByDataTest('dhis2-uicore-chip')
                .contains(name)
                .should('not.exist')
        })

        return this
    }

    validateLayerFilters = ({ type, items, nonItems }) => {
        cy.getByDataTest('layerlegend-filters')
            .contains(type)
            .should('be.visible')

        items?.forEach((item) => {
            cy.getByDataTest('layerlegend-filters')
                .contains(item)
                .should('be.visible')
        })

        nonItems?.forEach((item) => {
            cy.getByDataTest('layerlegend-filters')
                .contains(item)
                .should('not.exist')
        })

        return this
    }
}
