import { FacilityLayer } from '../../elements/facility_layer.js'

context('Facility Layers', () => {
    beforeEach(() => {
        cy.visit('/')
    })

    const Layer = new FacilityLayer()

    it('shows error if no orgunit level selected', () => {
        Layer.openDialog('Facilities').addToMap()

        Layer.validateDialogClosed(false)

        cy.contains('No organisation units are selected').scrollIntoView()

        cy.contains('No organisation units are selected').should('be.visible')
    })

    it('adds a facilities layer', () => {
        Layer.openDialog('Facilities')
            .selectTab('Organisation Units')
            .selectOu('Bo')
            .selectOuLevel('Facility')
            .addToMap()

        Layer.validateDialogClosed(true)
        Layer.validateCardTitle('Facilities')
        Layer.validateCardItems(['Facility'])
    })

    it('adds a facilities layer and changes the style', () => {
        Layer.openDialog('Facilities')
            .selectTab('Organisation Units')
            .selectOu('Bo')
            .selectOuLevel('Facility')
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

        Layer.validateCardTitle('Facilities')
        Layer.validateCardItems(['CHC', 'CHP', 'Clinic', 'Hospital', 'MCHP'])
    })
})
