import { EXTENDED_TIMEOUT } from '../support/util.js'

export class Layer {
    openDialog(layer) {
        const dataTest = `addlayeritem-${layer
            .toLowerCase()
            .replace(/\s/g, '_')}`

        cy.getByDataTest('add-layer-button', EXTENDED_TIMEOUT).click()

        cy.get(`[data-test="${dataTest}"]`, EXTENDED_TIMEOUT).click()

        return this
    }

    selectTab(tabName) {
        cy.getByDataTest('dhis2-uicore-tabbar-tabs')
            .find('button')
            .contains(tabName)
            .click()

        return this
    }

    selectOu(ouName) {
        cy.getByDataTest('org-unit-tree').contains(ouName).scrollIntoView()

        cy.getByDataTest('org-unit-tree').contains(ouName).click()

        return this
    }

    openOu(ouName) {
        cy.getByDataTest('org-unit-tree').contains(ouName).scrollIntoView()

        // Expanding a tree node fetches its children fresh, on demand
        cy.intercept(
            'GET',
            /\/organisationUnits\/[a-zA-Z0-9]{11}\?fields=children/
        ).as('fetchOuChildren')

        cy.getByDataTest('org-unit-tree')
            .contains(ouName)
            .parents('[data-test="org-unit-tree-node"]')
            .first()
            .within(() => {
                cy.getByDataTest('org-unit-tree-node-toggle').click()
            })

        cy.wait('@fetchOuChildren', EXTENDED_TIMEOUT)

        return this
    }

    unselectOu(ouName) {
        cy.getByDataTest('org-unit-tree').contains(ouName).scrollIntoView()

        cy.getByDataTest('org-unit-tree')
            .contains(ouName)
            .find('input')
            .uncheck()

        return this
    }

    selectOuLevel(level) {
        cy.getByDataTest('org-unit-level-select').click()

        cy.getByDataTest('dhis2-uicore-select-menu-menuwrapper')
            .contains(level)
            .find('input')
            .check()
        cy.get('body').click()

        return this
    }

    unselectOuLevel(level) {
        cy.getByDataTest('org-unit-level-select').click()

        cy.getByDataTest('dhis2-uicore-select-menu-menuwrapper')
            .contains(level)
            .find('input')
            .uncheck()

        cy.get('body').click()

        return this
    }

    typeStartDate(dateString) {
        cy.getByDataTest('calendar-clear-button').eq(0).click()

        if (dateString) {
            cy.getByDataTest('start-date-input-content')
                .find('input')
                .type(dateString)
        }

        return this
    }

    typeEndDate(dateString) {
        cy.getByDataTest('calendar-clear-button').eq(1).click()

        if (dateString) {
            cy.getByDataTest('end-date-input-content')
                .find('input')
                .type(dateString)
        }

        return this
    }

    addToMap() {
        cy.getByDataTest('dhis2-uicore-modalactions')
            .contains('Add layer')
            .click()
    }

    updateMap() {
        cy.getByDataTest('dhis2-uicore-modalactions')
            .contains('Update layer')
            .click()
    }

    validateDialogClosed(closed) {
        if (closed) {
            cy.getByDataTest('layeredit').should('not.exist')
        } else {
            cy.getByDataTest('layeredit').should('be.visible')
        }
    }

    validateCardTitle(titles) {
        const titlesArray = Array.isArray(titles) ? titles : [titles]
        const regex = new RegExp(titlesArray.join('|'))
        cy.getByDataTest('layercard')
            .contains(regex, { timeout: 50000 })
            .should('be.visible')

        return this
    }

    validateCardPeriod(period) {
        cy.getByDataTest('layercard').contains(period).should('be.visible')

        return this
    }

    validateCardItems(items) {
        items.forEach((item) => {
            cy.getByDataTest('layercard')
                .find('[data-test="layerlegend-item"]')
                .contains(item)
                .should('be.visible')
        })

        return this
    }

    validateCardContents(contents) {
        contents.forEach((content) => {
            cy.getByDataTest('layercard')
                .find('[data-test="layerlegend"]')
                .contains(content)
                .should('be.visible')
        })

        return this
    }

    validatePopupContents(contents) {
        contents.forEach((content) => {
            cy.get('.maplibregl-popup', EXTENDED_TIMEOUT)
                .contains(content)
                .should('be.visible')
        })

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
}
