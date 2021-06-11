import { ThematicLayer } from '../../elements/thematic_layer';

context('Thematic Layers', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    const Layer = new ThematicLayer();

    it('shows error if no indicator group selected', () => {
        Layer.openDialog('Thematic').addToMap();

        Layer.validateDialogClosed(false);

        cy.contains('Indicator group is required').should('be.visible');
    });

    it('shows error if no indicator selected', () => {
        Layer.openDialog('Thematic')
            .selectIndicatorGroup('HIV')
            .addToMap();

        Layer.validateDialogClosed(false);
        cy.contains('Indicator is required').should('be.visible');
    });

    it('adds a thematic layer', () => {
        Layer.openDialog('Thematic')
            .selectIndicatorGroup('HIV')
            .selectIndicator('VCCT post-test counselling rate')
            .addToMap();

        Layer.validateDialogClosed(true);

        // TODO: use visual snapshot testing to check the rendering of the map

        Layer.validateCardTitle('VCCT post-test counselling rate');
        Layer.validateCardItems([
            '80.4 - 84.88 (1)',
            '84.88 - 89.36 (2)',
            '89.36 - 93.84 (3)',
            '93.84 - 98.32 (1)',
            '98.32 - 102.8 (3)',
        ]);
    });
});
