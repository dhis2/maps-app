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

    selectOuLevel(level) {
        cy.getByDataTest('org-unit-level-select')
            .find('span')
            .then((spans) => {
                if (spans.length === 0) {
                    cy.getByDataTest('org-unit-level-select').click()

                    cy.getByDataTest('dhis2-uicore-select-menu-menuwrapper')
                        .contains(level)
                        .click()
                    cy.get('body').click() // Close the modal menu
                }

                return this
            })
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
        cy.getByDataTest('dhis2-uicore-modalactions')
            .contains('Add layer')
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
