import { Layer as OrgUnitLayer } from '../../elements/layer.js'

context('Org Unit Layers', () => {
    beforeEach(() => {
        cy.visit('/')
    })

    const Layer = new OrgUnitLayer()

    it('shows error if no orgunit selected', () => {
        Layer.openDialog('Org units').addToMap()

        Layer.validateDialogClosed(false)

        cy.contains('No organisation units are selected').scrollIntoView()

        cy.contains('No organisation units are selected').should('be.visible')
    })

    it('adds an org unit layer', () => {
        Layer.openDialog('Org units')
            .selectOu('Sierra Leone')
            .selectOuLevel('District')
            .addToMap()

        Layer.validateDialogClosed(true)

        // TODO: use visual snapshot testing to check the rendering of the map

        Layer.validateCardTitle('Organisation units')
        Layer.validateCardItems(['District'])
    })

    it('adds an org unit layer and changes the style', () => {
        Layer.openDialog('Org units')
            .selectOu('Sierra Leone')
            .selectOuLevel('District')
            .selectTab('Style')

        cy.getByDataTest('orgunitgroupsetselect-content').click()
        cy.getByDataTest('dhis2-uicore-select-menu-menuwrapper')
            .contains('Facility Type')
            .click()

        cy.getByDataTest('group-set-style').should('be.visible')
        cy.getByDataTest('group-set-style').children().should('have.length', 5)

        cy.getByDataTest('dhis2-uicore-modalactions')
            .contains('Add layer')
            .click()

        Layer.validateCardTitle('Organisation units')
        Layer.validateCardItems(['CHC', 'CHP', 'Clinic', 'Hospital', 'MCHP'])
    })
})
