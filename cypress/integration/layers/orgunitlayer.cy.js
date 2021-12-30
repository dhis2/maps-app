import { OrgUnitLayer } from '../../elements/orgunit_layer';

context('Org Unit Layers', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    const Layer = new OrgUnitLayer();

    it('shows error if no orgunit selected', () => {
        Layer.openDialog('Org units').addToMap();

        Layer.validateDialogClosed(false);

        cy.contains('No organisation units are selected').should('be.visible');
    });

    it('adds a org unit layer', () => {
        Layer.openDialog('Org units')
            .selectOu('Sierra Leone')
            .selectOuLevel('District')
            .addToMap();

        Layer.validateDialogClosed(true);

        // TODO: use visual snapshot testing to check the rendering of the map

        Layer.validateCardTitle('Organisation units');
        Layer.validateCardItems(['District']);
    });
});
