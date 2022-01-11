import { EventLayer } from '../../elements/event_layer';
import { EXTENDED_TIMEOUT } from '../../support/util';

context('Event Layers', () => {
    beforeEach(() => {
        cy.visit('/', EXTENDED_TIMEOUT);
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
            .validateStage('Inpatient morbidity and mortality')
            .selectTab('Org Units')
            .selectOu('Bombali')
            .selectOu('Bo')
            .addToMap();

        Layer.validateDialogClosed(true);

        Layer.validateCardTitle('Inpatient morbidity and mortality');
        Layer.validateCardItems(['Event']);
    });
});
