import { EXTENDED_TIMEOUT } from '../support/util';
import { ThematicLayer } from '../elements/thematic_layer';

context('Interpretations', () => {
    it('opens the interpretations panel for a map', () => {
        cy.visit('/?id=ZBjCfSaLSqD', EXTENDED_TIMEOUT);
        const Layer = new ThematicLayer();
        Layer.validateCardTitle('ANC LLITN coverage');
        cy.get('canvas.maplibregl-canvas').should('be.visible');

        cy.get('button')
            .contains('Interpretations')
            .click();

        cy.contains('About this map').should('be.visible');

        cy.get('input').should(
            'have.attr',
            'placeholder',
            'Write an interpretation'
        );

        cy.contains(
            'p',
            'Koinadugu has a very high LLITN coverage despite low density of facilities providing nets.'
        ).should('be.visible');
    });
});
