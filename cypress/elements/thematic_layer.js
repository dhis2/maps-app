import { EXTENDED_TIMEOUT } from '../support/util.js'
import { Layer } from './layer.js'

export class ThematicLayer extends Layer {
    selectItemType(itemType) {
        cy.intercept(
            'GET',
            /\/(indicatorGroups|dataElementGroups|dataSets|programs)\b/
        ).as('fetchGroups')
        this._groupsFetchPending = true

        cy.getByDataTest(
            'data-dimension-left-header-data-types-select-field-content'
        ).click()
        cy.contains(itemType).click()
        return this
    }
    selectGroup(group) {
        if (this._groupsFetchPending) {
            cy.wait('@fetchGroups', EXTENDED_TIMEOUT)
            this._groupsFetchPending = false
        }

        cy.getByDataTest(
            'data-dimension-left-header-groups-select-field-content'
        ).click()

        cy.intercept(
            'GET',
            /\/(indicators|dataElements|dataElementOperands|dataSets|dataItems)\b/
        ).as('fetchItems')

        cy.getByDataTest('dhis2-uicore-select-menu-menuwrapper')
            .contains(group)
            .click()

        cy.wait('@fetchItems', EXTENDED_TIMEOUT)

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
        cy.getByDataTest('data-dimension-transfer-pickedoptions')
            .contains(dataItem)
            .should('exist')
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

    selectChoropleth() {
        cy.contains('Choropleth').click()

        return this
    }

    selectBubbleMap() {
        cy.contains('Bubble map').click()

        return this
    }

    selectIncludeUnclassifiedOU() {
        cy.contains('Include unclassified org units').click()

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

        cy.getByDataTest('dimension-select-field')
            .should('not.be.disabled')
            .click()
        cy.get('input[placeholder="Filter dimensions"]')
            .should('be.visible')
            .type(dimensionName)

        cy.get('li').contains(dimensionName).should('be.visible').click()

        cy.getByDataTest('dimension-items-select-field')
            .should('not.be.disabled')
            .click()

        dimensionItemNames.forEach((name) => {
            cy.getByDataTest('dhis2-uicore-checkbox')
                .contains(name)
                .should('be.visible')
                .click()
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
