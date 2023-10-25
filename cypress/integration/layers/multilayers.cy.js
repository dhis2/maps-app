import { getMaps } from '../../elements/map_canvas.js'
// import {
//     DRILL_UP,
//     DRILL_DOWN,
//     VIEW_PROFILE,
//     expectContextMenuOptions,
// } from '../../elements/map_context_menu.js'
import { OrgUnitLayer } from '../../elements/orgunit_layer.js'
import { ThematicLayer } from '../../elements/thematic_layer.js'
// import { CURRENT_YEAR } from '../../support/util.js'

const INDICATOR_NAME = 'ANC 1 Coverage'

describe('Multiple Layers', () => {
    beforeEach(() => {
        cy.visit('/')
    })

    const TLayer = new ThematicLayer()
    const OULayer = new OrgUnitLayer()

    it('adds a thematic layer and an orgunit layer and changes the sorting', () => {
        TLayer.openDialog('Thematic')
            .selectIndicatorGroup('ANC')
            .selectIndicator(INDICATOR_NAME)
            .selectTab('Period')
            .selectPeriodType('Yearly')
            .selectTab('Org Units')
            .selectOu('Sierra Leone')
            .selectOuLevel('District')
            .addToMap()

        TLayer.validateDialogClosed(true)

        TLayer.validateCardTitle(INDICATOR_NAME)

        getMaps().should('have.length', 1)

        OULayer.openDialog('Org units')
            .selectOu('Sierra Leone')
            .selectOuLevel('District')
            .addToMap()

        OULayer.validateDialogClosed(true)

        OULayer.validateCardTitle('Organisation units')
        OULayer.validateCardItems(['District'])

        cy.getByDataTest('sortable-layers-list')
            .children()
            .should('have.length', 2)

        // confirm the order of the cards
        cy.getByDataTest('sortable-layers-list')
            .children()
            .first()
            .should('contain', 'Organisation units')

        cy.getByDataTest('sortable-layers-list')
            .children()
            .last()
            .should('contain', INDICATOR_NAME)

        // TODO - add a test for drag/drop reordering of the layers
    })
})
