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

        // TODO: use visual snapshot testing to check the rendering of the map

        Layer.validateCardTitle('Facilities')
        Layer.validateCardItems(['Facility'])
    })
})
