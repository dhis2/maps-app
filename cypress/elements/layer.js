export class Layer {
    openDialog(layer) {
        const dataTest = `addlayeritem-${layer
            .toLowerCase()
            .replace(/\s/g, '_')}`

        cy.getByDataTest('add-layer-button').click()

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
            cy.get('body').click(0, 0)
        }

        return this
    }

    typeEndDate(dateString) {
        cy.getByDataTest('calendar-clear-button').eq(1).click()

        if (dateString) {
            cy.getByDataTest('end-date-input-content')
                .find('input')
                .type(dateString)
            cy.get('body').click(0, 0)
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

    validateCardTitle(title) {
        cy.getByDataTest('layercard')
            .contains(title, { timeout: 50000 })
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
}
