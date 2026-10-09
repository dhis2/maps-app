import { getMaps } from '../../elements/map_canvas.js'
import { TeLayer } from '../../elements/trackedentity_layer.js'
import { EXTENDED_TIMEOUT, getDhis2Version } from '../../support/util.js'

const selectTeTypeAndProgram = (Layer, teType, program) => {
    cy.intercept('GET', /\/trackedEntityTypes\?/).as('getTrackedEntityTypes')
    Layer.openDialog('Tracked entities').selectTab('Data')
    cy.wait('@getTrackedEntityTypes', EXTENDED_TIMEOUT)
    cy.intercept('GET', /\/programs\?/).as('getPrograms')
    Layer.selectTeType(teType)
    cy.wait('@getPrograms', EXTENDED_TIMEOUT)
    Layer.selectTeProgram(program)
}

const MALARIA_ENTITY = 'Malaria Entity'
const MALARIA_CASE = {
    id: 'qDkgAbB5Jlk',
    name: 'Malaria case diagnosis, treatment and investigation',
}

const ANALYTICS_URL = '**/analytics/trackedEntities/query/**'
const TRACKER_URL = '**/tracker/trackedEntities?*'

const DATA_NOTICE = 'loaded directly from captured data'

// The analytics id column was renamed in 2.42
const getAnalyticsIdColumn = () =>
    Number(getDhis2Version().minor) >= 42
        ? 'trackedentity'
        : 'trackedentityinstanceuid'

const getParams = (url) => new URL(url).searchParams

// The e2e tracked entities were last updated in 2019
const selectMalariaCase = (Layer) => {
    selectTeTypeAndProgram(Layer, MALARIA_ENTITY, MALARIA_CASE.name)
    Layer.selectTab('Period').typeStartDate('2019-01-01').selectTab('Data')
}

// Counts the requests, to check that an API is not used
const spyOn = (url, alias) => cy.intercept('GET', url, cy.spy().as(alias))

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
            // Only the facility: all levels below are included by default
            .unselectOu('Sierra Leone')
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

    it('loads tracked entities from tracker analytics', () => {
        cy.intercept('GET', ANALYTICS_URL).as('getAnalytics')
        spyOn(TRACKER_URL, 'trackerSpy')

        selectMalariaCase(Layer)
        cy.contains(DATA_NOTICE).should('not.exist')
        Layer.addToMap()

        cy.wait('@getAnalytics', EXTENDED_TIMEOUT).then(
            ({ request, response }) => {
                const params = getParams(request.url)
                expect(response.body.rows).to.have.length.greaterThan(0)
                expect(request.url).to.include('/query/Zy2SEgA61ys')
                expect(params.get('lastUpdated')).to.match(/^2019-01-01_/)
                expect(params.get('headers')).to.equal(
                    `${getAnalyticsIdColumn()},geometry`
                )
                expect(params.get('geometryOnly')).to.equal('true')
                expect(params.get('program')).to.equal(MALARIA_CASE.id)
                expect(params.get('ouMode')).to.equal('DESCENDANTS')
                expect(params.get('pageSize')).to.equal('50000')
                expect(params.get('totalPages')).to.equal('true')
            }
        )

        Layer.validateCardTitle(MALARIA_CASE.name)
        Layer.validateCardItems([MALARIA_ENTITY])
        cy.get('@trackerSpy').should('not.have.been.called')
    })

    it('loads follow-up tracked entities from the tracker API', () => {
        cy.intercept('GET', TRACKER_URL).as('getTracker')
        spyOn(ANALYTICS_URL, 'analyticsSpy')

        selectMalariaCase(Layer)
        Layer.checkFollowUp()
        cy.contains(DATA_NOTICE).should('be.visible')
        Layer.addToMap()

        cy.wait('@getTracker', EXTENDED_TIMEOUT).then(({ request }) => {
            const params = getParams(request.url)
            expect(params.get('program')).to.equal(MALARIA_CASE.id)
            expect(params.get('followUp')).to.equal('TRUE')
            expect(params.get('orgUnitMode')).to.equal('DESCENDANTS')
            expect(params.get('paging')).to.equal('false')
        })

        Layer.validateCardTitle(MALARIA_CASE.name)
        cy.get('@analyticsSpy').should('not.have.been.called')
    })

    it('loads relationships between tracked entities from the tracker API', () => {
        cy.intercept('GET', '**/relationshipTypes?*').as('getRelationshipTypes')
        cy.intercept('GET', TRACKER_URL).as('getTracker')
        spyOn(ANALYTICS_URL, 'analyticsSpy')

        selectMalariaCase(Layer)
        Layer.selectTab('Relationships').showRelationships()
        cy.contains(DATA_NOTICE).should('be.visible')

        cy.wait('@getRelationshipTypes', EXTENDED_TIMEOUT).then(
            ({ request }) => {
                const params = getParams(request.url)
                expect(params.get('paging')).to.equal('false')
                expect(params.getAll('filter')).to.deep.equal([
                    'fromConstraint.relationshipEntity:eq:TRACKED_ENTITY_INSTANCE',
                    'toConstraint.relationshipEntity:eq:TRACKED_ENTITY_INSTANCE',
                    'fromConstraint.trackedEntityType.id:eq:Zy2SEgA61ys',
                ])
            }
        )

        Layer.selectRelationshipType('Case to Focus').addToMap()

        cy.wait('@getTracker', EXTENDED_TIMEOUT).then(({ request }) => {
            expect(getParams(request.url).get('fields')).to.include(
                'relationships'
            )
        })

        Layer.validateCardItems(['Case to Focus', 'Focus area (related)'])
        cy.get('@analyticsSpy').should('not.have.been.called')
    })

    it('loads the immediate children of the selected org units', () => {
        cy.intercept('GET', ANALYTICS_URL).as('getAnalytics')

        selectMalariaCase(Layer)
        Layer.selectTab('Org Units')
        cy.contains('Selected and all below').should('be.visible')
        Layer.selectOuMode('Immediate children').addToMap()

        cy.wait('@getAnalytics', EXTENDED_TIMEOUT).then(({ request }) => {
            expect(getParams(request.url).get('ouMode')).to.equal('CHILDREN')
        })
    })

    it('requests the immediate children from the tracker API in selected mode', () => {
        cy.intercept({
            method: 'GET',
            pathname: '**/organisationUnits',
            query: { filter: /^parent\.id:in:/ },
        }).as('getChildren')
        cy.intercept('GET', TRACKER_URL).as('getTracker')

        selectMalariaCase(Layer)
        Layer.checkFollowUp()
            .selectTab('Org Units')
            .selectOuMode('Immediate children')
            .addToMap()

        cy.wait('@getChildren', EXTENDED_TIMEOUT).then(({ request }) => {
            // The children of Sierra Leone, selected by default
            expect(getParams(request.url).get('filter')).to.equal(
                'parent.id:in:[ImspTQPwCqd]'
            )
        })
        cy.wait('@getTracker', EXTENDED_TIMEOUT).then(({ request }) => {
            const params = getParams(request.url)
            expect(params.get('orgUnitMode')).to.equal('SELECTED')
            expect(params.get('orgUnits')).to.match(/^\w{11}(,\w{11})*$/)
        })
    })

    it('warns when tracker analytics returns part of the tracked entities', () => {
        cy.intercept('GET', ANALYTICS_URL, (req) => {
            req.continue((res) => {
                res.body.metaData.pager.total = 100
            })
        }).as('getAnalytics')

        selectMalariaCase(Layer)
        Layer.addToMap()
        cy.wait('@getAnalytics', EXTENDED_TIMEOUT)

        cy.getByDataTest('dhis2-uicore-alertstack', EXTENDED_TIMEOUT)
            .contains(/Displaying first [1-9]\d* tracked entities out of 100/)
            .should('be.visible')
    })

    it('shows tracker analytics errors on the layer', () => {
        cy.intercept('GET', ANALYTICS_URL, {
            statusCode: 409,
            body: {
                httpStatus: 'Conflict',
                httpStatusCode: 409,
                status: 'ERROR',
                errorCode: 'E7144',
                message: 'Analytics table for tracked entities is missing',
            },
        }).as('getAnalytics')
        spyOn(TRACKER_URL, 'trackerSpy')

        selectMalariaCase(Layer)
        Layer.addToMap()
        cy.wait('@getAnalytics', EXTENDED_TIMEOUT)

        cy.getByDataTest('load-error-noticebox', EXTENDED_TIMEOUT)
            .contains('Analytics table for tracked entities is missing')
            .should('be.visible')
        cy.get('@trackerSpy').should('not.have.been.called')
    })

    it('warns when the tracker API reaches its limit', () => {
        cy.intercept('GET', '**/systemSettings?*', (req) => {
            delete req.headers['if-none-match']
            req.continue((res) => {
                res.body.KeyTrackedEntityMaxLimit = 1
                res.body.KeyTrackedEntityInstanceMaxLimit = 1
            })
        })
        cy.visit('/')
        cy.intercept('GET', TRACKER_URL).as('getTracker')

        selectMalariaCase(Layer)
        Layer.selectTab('Relationships')
            .showRelationships()
            .selectRelationshipType('Index case to cases')
            .addToMap()
        cy.wait('@getTracker', EXTENDED_TIMEOUT)

        cy.getByDataTest('dhis2-uicore-alertstack', EXTENDED_TIMEOUT)
            .contains('Displaying first 1 tracked entities')
            .should('be.visible')
    })

    it('keeps the tracked entities when relationships fail to load', () => {
        cy.intercept('GET', '**/relationshipTypes/*', {
            statusCode: 500,
            body: { status: 'ERROR', message: 'Server error' },
        }).as('getRelationshipType')

        selectMalariaCase(Layer)
        Layer.selectTab('Relationships')
            .showRelationships()
            .selectRelationshipType('Case to Focus')
            .addToMap()
        cy.wait('@getRelationshipType', EXTENDED_TIMEOUT)

        cy.getByDataTest('dhis2-uicore-alertstack', EXTENDED_TIMEOUT)
            .contains('Relationships could not be loaded')
            .should('be.visible')
        Layer.validateCardItems([MALARIA_ENTITY])
        cy.getByDataTest('load-error-noticebox').should('not.exist')
    })
})
