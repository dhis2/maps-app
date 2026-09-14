import { getMaps } from '../../elements/map_canvas.js'
import { TeLayer } from '../../elements/trackedentity_layer.js'
import { EXTENDED_TIMEOUT } from '../../support/util.js'

const selectTeTypeAndProgram = (Layer, teType, program) => {
    cy.intercept('GET', /\/trackedEntityTypes\?/).as('getTrackedEntityTypes')
    Layer.openDialog('Tracked entities').selectTab('Data')
    cy.wait('@getTrackedEntityTypes', EXTENDED_TIMEOUT)
    cy.intercept('GET', /\/programs\?/).as('getPrograms')
    Layer.selectTeType(teType)
    cy.wait('@getPrograms', EXTENDED_TIMEOUT)
    Layer.selectTeProgram(program)
}

describe('Tracked Entity Layers', () => {
    beforeEach(() => {
        cy.visit('/')
    })

    const Layer = new TeLayer()

    it('adds a tracked entity layer', () => {
        selectTeTypeAndProgram(
            Layer,
            'Malaria Entity',
            'Malaria case diagnosis, treatment and investigation'
        )

        Layer.selectTab('Org Units')
            .selectOu('Bombali')
            .selectOu('Bo')
            .addToMap()

        Layer.validateDialogClosed(true)

        Layer.validateCardTitle(
            'Malaria case diagnosis, treatment and investigation'
        )
        Layer.validateCardItems(['Malaria Entity'])
    })

    it('opens a tracked entity layer popup', () => {
        selectTeTypeAndProgram(
            Layer,
            'Focus area',
            'Malaria focus investigation'
        )

        Layer.selectTab('Period')
            .typeStartDate('2018-00-00')
            .selectTab('Org Units')
            .openOu('Bo')
            .openOu('Badjia')
            .selectOu('Njandama MCHP')

        cy.intercept(
            'GET',
            /\/trackedEntityTypes\/[a-zA-Z0-9]{11}\?fields=trackedEntityTypeAttributes/
        ).as('getTrackedEntityTypeAttributes')
        cy.intercept(
            'GET',
            /\/programs\/[a-zA-Z0-9]{11}\?fields=programTrackedEntityAttributes/
        ).as('getProgramTrackedEntityAttributesForPopup')

        Layer.addToMap()

        Layer.validateDialogClosed(true)

        cy.wait(
            [
                '@getTrackedEntityTypeAttributes',
                '@getProgramTrackedEntityAttributesForPopup',
            ],
            EXTENDED_TIMEOUT
        )

        cy.waitForMap()

        cy.intercept('GET', '**/tracker/trackedEntities/*').as(
            'getTrackedEntityPopupData'
        )
        getMaps().click('center') // Click somewhere on the map
        cy.wait('@getTrackedEntityPopupData', EXTENDED_TIMEOUT)

        Layer.validatePopupContents([
            'Organisation unit',
            'Last updated',
            'System Focus ID',
            'WQQ003161',
        ])

        Layer.validateCardTitle('Malaria focus investigation')
        Layer.validateCardItems(['Focus area'])
    })

    it('shows error if no tracked entity type selected', () => {
        Layer.openDialog('Tracked entities').addToMap()

        Layer.validateDialogClosed(false)

        cy.contains('Tracked Entity Type is required').should('be.visible')
    })

    it('shows error if no endDate is specified', () => {
        selectTeTypeAndProgram(
            Layer,
            'Focus area',
            'Malaria focus investigation'
        )

        Layer.selectTab('Period')
            .typeStartDate('2018-01-01')
            .typeEndDate('2')
            .addToMap()

        Layer.validateDialogClosed(false)
        cy.contains('End date is invalid').should('be.visible')

        Layer.selectTab('Period').typeEndDate('2')

        cy.contains('End date is invalid').should('not.exist')
    })
})
