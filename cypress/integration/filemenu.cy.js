import { FacilityLayer } from '../elements/facility_layer';
import { ThematicLayer } from '../elements/thematic_layer';
import { OrgUnitLayer } from '../elements/orgunit_layer';
import {
    openMap,
    saveAsNewMap,
    saveNewMap,
    saveExistingMap,
} from '../elements/file_menu';

import { EXTENDED_TIMEOUT } from '../support/util';

const MAP_TITLE = 'test saveas ' + new Date().toUTCString().slice(-12, -4);
const SAVEAS_MAP_TITLE = `${MAP_TITLE}-2`;

describe('File menu', () => {
    const FacLayer = new FacilityLayer();
    const ThemLayer = new ThematicLayer();
    const OULayer = new OrgUnitLayer();

    it('saves a new map', () => {
        cy.visit('/', EXTENDED_TIMEOUT);
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible');

        ThemLayer.openDialog('Thematic')
            .selectIndicatorGroup('HIV')
            .selectIndicator('VCCT post-test counselling rate')
            .addToMap();

        cy.intercept({ method: 'POST', url: 'maps' }, req => {
            expect(req.body.mapViews).to.have.length(1);
            req.continue();
        }).as('saveMap');

        saveNewMap(MAP_TITLE);

        cy.wait('@saveMap')
            .its('response.statusCode')
            .should('eq', 201);
    });

    it('save existing as new map', () => {
        cy.visit('/', EXTENDED_TIMEOUT);
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible');

        openMap(MAP_TITLE);

        FacLayer.openDialog('Facilities')
            .selectTab('Organisation Units')
            .selectOu('Bo')
            .selectOuLevel('Facility')
            .addToMap();

        FacLayer.validateDialogClosed(true);

        cy.contains('Facilities')
            .parents('[data-test=layercard]')
            .should('be.visible');

        cy.intercept({ method: 'POST', url: 'maps' }, req => {
            expect(req.body.mapViews).to.have.length(2);
            req.continue();
        }).as('saveAsNewMap');

        saveAsNewMap(SAVEAS_MAP_TITLE);

        cy.wait('@saveAsNewMap')
            .its('response.statusCode')
            .should('eq', 201);
    });

    it('save changes to existing map', () => {
        cy.visit('/', EXTENDED_TIMEOUT);
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible');

        openMap(SAVEAS_MAP_TITLE);

        OULayer.openDialog('Org units')
            .selectOu('Sierra Leone')
            .selectOuLevel('Chiefdom')
            .addToMap();

        cy.intercept(
            {
                method: 'PUT',
                url: /\/maps\//,
            },
            req => {
                expect(req.body.mapViews).to.have.length(3);
                req.continue();
            }
        ).as('saveTheExistingMap');

        saveExistingMap();
        cy.wait('@saveTheExistingMap')
            .its('response.statusCode')
            .should('eq', 204);
    });
});
