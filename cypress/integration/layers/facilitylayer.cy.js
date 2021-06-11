import { FacilityLayer } from '../../elements/facility_layer';

context.skip('Facility Layers', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    const Layer = new FacilityLayer();

    it('shows error if no group selected', () => {
        Layer.openDialog('Facilities').addToMap();

        Layer.validateDialogClosed(false);

        cy.contains('Group set is required').should('be.visible');
    });

    it('shows error if no orgunit level selected', () => {
        Layer.openDialog('Facilities')
            .selectGroupSet('Facility Type')
            .addToMap();

        Layer.validateDialogClosed(false);

        cy.contains('No organisation units are selected').should('be.visible');
    });

    it('adds a facilities layer', () => {
        Layer.openDialog('Facilities')
            .selectGroupSet('Facility Type')
            .selectTab('Organisation Units')
            .selectOuLevel('District')
            .addToMap();

        Layer.validateDialogClosed(true);

        // TODO: use visual snapshot testing to check the rendering of the map

        Layer.validateCardTitle('Facilities');
        Layer.validateCardItems(['Hospital', 'Clinic', 'CHP', 'CHC', 'MCHP']);
    });
});
