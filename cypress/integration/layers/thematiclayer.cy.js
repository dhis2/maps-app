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
            .selectTab('Period')
            .selectPeriodType('Yearly')
            .addToMap();

        Layer.validateDialogClosed(true);

        // TODO: use visual snapshot testing to check the rendering of the map

        Layer.validateCard('VCCT post-test counselling rate', [
            '70.2 - 76.72 (1)',
            '76.72 - 83.24 (1)',
            '83.24 - 89.76 (2)',
            '89.76 - 96.28 (3)',
            '96.28 - 102.8 (4)',
        ]);
    });
});
