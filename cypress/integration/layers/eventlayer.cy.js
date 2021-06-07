import { EventLayer } from '../../elements/event_layer';

context('Event Layers', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    const Layer = new EventLayer();

    it('shows error if no program selected', () => {
        Layer.openDialog('Events').addToMap();

        Layer.validateDialogClosed(false);

        cy.contains('Program is required').should('be.visible');
    });

    it('adds an event layer', () => {
        Layer.openDialog('Events')
            .selectProgram('Inpatient morbidity and mortality')
            .addToMap();

        Layer.validateDialogClosed(true);

        Layer.validateCard('Inpatient morbidity and mortality', ['Event']);
    });
});
