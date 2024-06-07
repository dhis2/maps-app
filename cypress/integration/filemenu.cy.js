import { FacilityLayer } from '../elements/facility_layer';
import { ThematicLayer } from '../elements/thematic_layer';
import { OrgUnitLayer } from '../elements/orgunit_layer';
import {
    openMap,
    saveAsNewMap,
    saveNewMap,
    saveExistingMap,
    deleteMap,
} from '../elements/file_menu';

import { EXTENDED_TIMEOUT } from '../support/util';

const MAP_TITLE = 'test ' + new Date().toUTCString().slice(-24, -4);
const SAVEAS_MAP_TITLE = `${MAP_TITLE}-2`;

describe('File menu', () => {
    const FacLayer = new FacilityLayer();
    const ThemLayer = new ThematicLayer();
    const OULayer = new OrgUnitLayer();

    it('saves a new map', () => {
        cy.visit('/', EXTENDED_TIMEOUT);
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible');

        cy.intercept({ method: 'GET', url: /\/indicators/ }).as(
            'fetchIndicators'
        );

        ThemLayer.openDialog('Thematic').selectIndicatorGroup('HIV');

        cy.wait('@fetchIndicators');
        ThemLayer.selectIndicator('VCCT post-test counselling rate').addToMap();

        cy.intercept({ method: 'POST', url: 'maps' }, req => {
            expect(req.body.mapViews).to.have.length(1);
            req.continue();
        }).as('saveMap');

        cy.intercept({ method: 'POST', url: /dataStatistics/ }).as(
            'postDataStatistics'
        );

        saveNewMap(MAP_TITLE);

        cy.wait('@saveMap')
            .its('response.statusCode')
            .should('eq', 201);

        cy.wait('@postDataStatistics')
            .its('response.statusCode')
            .should('eq', 201);
    });

    it.skip('save existing as new map', () => {
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

        cy.intercept({ method: 'POST', url: /dataStatistics/ }).as(
            'postDataStatistics'
        );

        saveAsNewMap(SAVEAS_MAP_TITLE);

        cy.wait('@saveAsNewMap')
            .its('response.statusCode')
            .should('eq', 201);

        cy.wait('@postDataStatistics')
            .its('response.statusCode')
            .should('eq', 201);
    });

    it.skip('save changes to existing map', () => {
        cy.visit('/', EXTENDED_TIMEOUT);
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible');

        openMap(SAVEAS_MAP_TITLE);

        ThemLayer.validateCardTitle('VCCT post-test counselling rate');
        OULayer.openDialog('Org units')
            .selectOu('Sierra Leone')
            .selectOuLevel('Chiefdom')
            .addToMap();

        cy.contains('Facilities')
            .parents('[data-test=layercard]')
            .should('be.visible');

        cy.contains('Organisation units')
            .parents('[data-test=layercard]')
            .should('be.visible');

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

    it.skip('save changes to existing map fails', () => {
        cy.visit('/', EXTENDED_TIMEOUT);
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible');

        openMap(MAP_TITLE);

        cy.intercept(
            {
                method: 'PUT',
                url: /\/maps\//,
            },
            { statusCode: 409 }
        ).as('saveFails');

        saveExistingMap();

        cy.wait('@saveFails')
            .its('response.statusCode')
            .should('eq', 409);

        cy.getByDataTest('dhis2-uicore-alertbar')
            .contains('Failed to save map')
            .should('be.visible');
    });

    it.skip('save as new map fails', () => {
        cy.visit('/', EXTENDED_TIMEOUT);
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible');

        openMap(MAP_TITLE);

        cy.intercept(
            {
                method: 'POST',
                url: /\/maps/,
            },
            { statusCode: 409 }
        ).as('saveAsFails');

        saveAsNewMap('Map name');
        cy.wait('@saveAsFails')
            .its('response.statusCode')
            .should('eq', 409);
        cy.getByDataTest('dhis2-uicore-alertbar')
            .contains('Failed to save map')
            .should('be.visible');
    });

    it('deletes MAP_TITLE map', () => {
        cy.visit('/', EXTENDED_TIMEOUT);
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible');

        openMap(MAP_TITLE);
        cy.intercept({
            method: 'DELETE',
            url: /\/maps/,
        }).as('deleteMap');

        cy.getByDataTest('layercard').should('not.contain', 'Loading layer...')

        deleteMap();

        cy.wait('@deleteMap')
            .its('response.statusCode')
            .should('eq', 200);

        cy.getByDataTest('layercard').should('not.exist');
        cy.getByDataTest('basemapcard', EXTENDED_TIMEOUT).should('be.visible');
    });

    it.skip('deletes SAVEAS_MAP_TITLE map', () => {
        cy.visit('/', EXTENDED_TIMEOUT);
        cy.get('canvas', EXTENDED_TIMEOUT).should('be.visible');

        openMap(SAVEAS_MAP_TITLE);

        cy.intercept({
            method: 'DELETE',
            url: /\/maps/,
        }).as('deleteMap');

        deleteMap();

        cy.wait('@deleteMap')
            .its('response.statusCode')
            .should('eq', 200);

        cy.getByDataTest('layercard').should('not.exist');
        cy.getByDataTest('basemapcard', EXTENDED_TIMEOUT).should('be.visible');
    });
});
