import { EXTENDED_TIMEOUT } from '../support/util.js'

export class Layer {
    openDialog(layer) {
        const dataTest = `addlayeritem-${layer
            .toLowerCase()
            .replace(/\s/g, '_')}`

        cy.getByDataTest('add-layer-button', EXTENDED_TIMEOUT).click()

        cy.get(`[data-test="${dataTest}"]`).click()

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

        cy.getByDataTest('org-unit-tree')
            .contains(ouName)
            .parents('[data-test="org-unit-tree-node"]')
            .first()
            .within(() => {
                cy.getByDataTest('org-unit-tree-node-toggle').click()
            })

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
        let found = false
        let lastError

        titlesArray.forEach((title) => {
            try {
                cy.getByDataTest('layercard')
                    .contains(title, { timeout: 50000 })
                    .should('be.visible')
                found = true
            } catch (error) {
                lastError = error
            }
        })

        if (!found) {
            throw lastError
        }

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
            cy.get('.maplibregl-popup').contains(content).should('be.visible')
        })

        return this
    }
}
