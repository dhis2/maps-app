import { BoundaryLayer } from '../../elements/boundary_layer';

context('Boundary Layers', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    const Layer = new BoundaryLayer();

    it('shows error if no orgunit selected', () => {
        Layer.openDialog('Boundaries').addToMap();

        Layer.validateDialogClosed(false);

        cy.contains('No organisation units are selected').should('be.visible');
    });

    it('adds a boundary layer', () => {
        Layer.openDialog('Boundaries')
            .selectOuLevel('District')
            .addToMap();

        Layer.validateDialogClosed(true);

        // TODO: use visual snapshot testing to check the rendering of the map

        Layer.validateCard('Boundaries', ['District']);
    });
});
