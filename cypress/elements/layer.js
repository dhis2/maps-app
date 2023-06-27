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

    typeStartDate(dateString) {
        cy.get('label')
            .contains('Start date')
            .next()
            .find('input')
            .type(dateString)

        return this
    }

    typeEndDate(dateString) {
        cy.get('label')
            .contains('End date')
            .next()
            .find('input')
            .type(dateString)
        return this
    }

    addToMap() {
        cy.getByDataTest('dhis2-uicore-modalactions', EXTENDED_TIMEOUT)
            .contains('Add layer')
            .click()
    }

    validateDialogClosed(closed) {
        if (closed) {
            cy.getByDataTest('layeredit', EXTENDED_TIMEOUT).should('not.exist')
        } else {
            cy.getByDataTest('layeredit', EXTENDED_TIMEOUT).should('be.visible')
        }
    }

    validateCardTitle(title) {
        cy.getByDataTest('layercard', EXTENDED_TIMEOUT)
            .contains(title, EXTENDED_TIMEOUT)
            .should('be.visible')

        return this
    }

    validateCardPeriod(period) {
        cy.getByDataTest('layercard', EXTENDED_TIMEOUT)
            .contains(period)
            .should('be.visible')

        return this
    }

    validateCardItems(items) {
        items.forEach((item) => {
            cy.getByDataTest('layercard', EXTENDED_TIMEOUT)
                .find('[data-test="layerlegend-item"]')
                .contains(item)
                .should('be.visible')
        })

        return this
    }
}
