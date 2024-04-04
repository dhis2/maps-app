import { getMaps } from './map_canvas.js';

export const DRILL_UP = 'context-menu-drill-up';
export const DRILL_DOWN = 'context-menu-drill-down';
export const VIEW_PROFILE = 'context-menu-view-profile';
export const SHOW_LONG_LAT = 'context-menu-show-long-lat';

const ALL_OPTIONS = [DRILL_UP, DRILL_DOWN, VIEW_PROFILE, SHOW_LONG_LAT];

export const expectContextMenuOptions = availableOptions => {
    getMaps()
        .first()
        .then($el => {
            const xpos = $el.width() / 2;
            const ypos = $el.height() / 2;

            // right clicking on the center of the map should hit an OU
            getMaps()
                .first()
                .rightclick(xpos, ypos);

            // menu has correct number of items
            cy.getByDataTest('context-menu')
                .find('li')
                .should('have.length', availableOptions.length);

            const unavailableOptions = ALL_OPTIONS.filter(
                opt => !availableOptions.map(opt => opt.name).includes(opt)
            );

            unavailableOptions.forEach(name =>
                cy.getByDataTest(name).should('not.exist')
            );

            availableOptions.forEach(option => {
                // check the menu items
                cy.getByDataTest(option.name).should('be.visible');
                if (option.disabled) {
                    cy.getByDataTest(option.name).should(
                        'have.class',
                        'disabled'
                    );
                } else {
                    cy.getByDataTest(option.name).should(
                        'not.have.class',
                        'disabled'
                    );
                }
            });
        });
};
