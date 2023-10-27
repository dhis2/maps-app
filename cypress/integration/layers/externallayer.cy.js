const LABELS_OVERLAY_TITLE = 'Labels overlay'

describe('External Layer', () => {
    it('adds an external layer', () => {
        cy.visit('/')

        cy.getByDataTest('add-layer-button').click()

        const dataTest = `addlayeritem-${`${LABELS_OVERLAY_TITLE}`
            .toLowerCase()
            .replace(/\s/g, '_')}`

        cy.get(`[data-test="${dataTest}"]`).click()

        cy.getByDataTest('map-loading-mask').should('not.exist')

        cy.getByDataTest('layercard')
            .contains(LABELS_OVERLAY_TITLE)
            .should('be.visible')
    })
})
