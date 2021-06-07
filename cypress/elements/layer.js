export class Layer {
    openDialog(layer) {
        cy.get('button')
            .contains('Add layer')
            .click();
        cy.get(`[data-test="addlayeritem-${layer}"]`).click();

        return this;
    }

    selectTab(tab) {
        cy.get('[data-test="dhis2-uicore-tabbar-tabs"]')
            .find('button')
            .contains(tab)
            .click();

        return this;
    }

    addToMap() {
        cy.get('[data-test="dhis2-uicore-modalactions"]')
            .contains('Add layer')
            .click();
    }

    validateDialogClosed(closed) {
        if (closed) {
            cy.get('[data-test="dhis2-uicore-card"]').should('not.exist');
        } else {
            cy.get('[data-test="dhis2-uicore-card"]').should('be.visible');
        }
    }

    validateCard(title, items) {
        cy.get('[data-test="layercard"]')
            .contains(title)
            .should('be.visible');

        items.forEach(item => {
            cy.get('[data-test="layercard"]')
                .find('[data-test="layerlegend-item"]')
                .contains(item)
                .should('be.visible');
        });
    }
}
