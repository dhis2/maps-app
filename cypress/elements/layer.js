export class Layer {
    openDialog(layer) {
        const dataTest = `addlayeritem-${layer
            .toLowerCase()
            .replace(/\s/g, '_')}`;

        cy.get('button')
            .contains('Add layer')
            .click();
        cy.get(`[data-test="${dataTest}"]`).click();

        return this;
    }

    selectTab(tab) {
        cy.get('[data-test="dhis2-uicore-tabbar-tabs"]')
            .find('button')
            .contains(tab)
            .click();

        return this;
    }

    typeStartDate(dateString) {
        cy.get('label')
            .contains('Start date')
            .next()
            .find('input')
            .type(dateString);

        return this;
    }

    typeEndDate(dateString) {
        cy.get('label')
            .contains('End date')
            .next()
            .find('input')
            .type(dateString);
        return this;
    }

    addToMap() {
        cy.get('[data-test="dhis2-uicore-modalactions"]')
            .contains('Add layer')
            .click();
    }

    validateDialogClosed(closed) {
        if (closed) {
            cy.get('[data-test="layeredit"]').should('not.exist');
        } else {
            cy.get('[data-test="layeredit"]').should('be.visible');
        }
    }

    validateCardTitle(title) {
        cy.get('[data-test="layercard"]')
            .contains(title)
            .should('be.visible');

        return this;
    }

    validateCardPeriod(period) {
        cy.get('[data-test="layercard"]')
            .contains(period)
            .should('be.visible');

        return this;
    }

    validateCardItems(items) {
        items.forEach(item => {
            cy.get('[data-test="layercard"]')
                .find('[data-test="layerlegend-item"]')
                .contains(item)
                .should('be.visible');
        });

        return this;
    }
}
