import { getMaps } from '../../elements/map_canvas.js';
import {
    DRILL_UP,
    DRILL_DOWN,
    VIEW_PROFILE,
    expectContextMenuOptions,
} from '../../elements/map_context_menu.js';
import { ThematicLayer } from '../../elements/thematic_layer';
import { CURRENT_YEAR } from '../../support/util';

const INDICATOR_NAME = 'VCCT post-test counselling rate';

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
            .selectIndicator(INDICATOR_NAME)
            .selectTab('Period')
            .selectPeriodType('Yearly')
            .addToMap();

        Layer.validateDialogClosed(true);

        Layer.validateCardTitle(INDICATOR_NAME);
        // TODO: test this in a way that is not dependent on the date
        // Layer.validateCardItems([
        //     '70.2 - 76.72 (1)',
        //     '76.72 - 83.24 (1)',
        //     '83.24 - 89.76 (2)',
        //     '89.76 - 96.28 (3)',
        //     '96.28 - 102.8 (4)',
        // ]);

        getMaps().should('have.length', 1);
    });

    it('adds a thematic layer for OU Bombali', () => {
        Layer.openDialog('Thematic')
            .selectIndicatorGroup('HIV')
            .selectIndicator(INDICATOR_NAME)
            .selectTab('Period')
            .selectPeriodType('Yearly')
            .selectTab('Org Units')
            .selectOu('Bombali')
            .selectOu('Bo')
            .addToMap();

        Layer.validateDialogClosed(true);

        Layer.validateCardTitle(INDICATOR_NAME);
        // TODO: test this in a way that is not dependent on the date
        // Layer.validateCardItems([
        //     '80.9 - 83.04 (1)',
        //     '83.04 - 85.18 (0)',
        //     '85.18 - 87.32 (0)',
        //     '87.32 - 89.46 (0)',
        //     '89.46 - 91.6 (1)',
        // ]);

        getMaps().should('have.length', 1);
    });

    it('adds a thematic layer with start and end date', () => {
        Layer.openDialog('Thematic')
            .selectIndicatorGroup('HIV')
            .selectIndicator(INDICATOR_NAME)
            .selectTab('Period')
            .selectPeriodType('Start/end dates')
            .typeStartDate(`${CURRENT_YEAR}-02-01`)
            .typeEndDate(`${CURRENT_YEAR}-11-30`)
            .addToMap();

        Layer.validateDialogClosed(true);

        Layer.validateCardTitle(INDICATOR_NAME).validateCardPeriod(
            `Feb 1, ${CURRENT_YEAR} - Nov 30, ${CURRENT_YEAR}`
        );

        getMaps().should('have.length', 1);
    });

    it('adds a thematic layer with split view period', () => {
        Layer.openDialog('Thematic')
            .selectIndicatorGroup('HIV')
            .selectIndicator(INDICATOR_NAME)
            .selectTab('Period');

        cy.getByDataTest('relative-period-select-content').click();
        cy.contains('Last 3 months').click();

        cy.get('[type="radio"]').should('have.length', 3);
        cy.get('[type="radio"]').check('SPLIT_BY_PERIOD');

        cy.getByDataTest('dhis2-uicore-modalactions')
            .contains('Add layer')
            .click();

        Layer.validateDialogClosed(true);

        Layer.validateCardTitle(INDICATOR_NAME);

        // check for 3 maps
        getMaps().should('have.length', 3);

        // wait to make sure the maps are loaded
        cy.wait(2000); // eslint-disable-line cypress/no-unnecessary-waiting

        expectContextMenuOptions([
            { name: DRILL_UP, disabled: true },
            { name: DRILL_DOWN },
            { name: VIEW_PROFILE },
        ]);
    });
});
