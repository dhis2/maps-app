// Exhaustive check of Event layer coordinateField/fallbackCoordinateField
// resolution, using test data from the test-data-event-layer-coordinates
// tool in dhis2/maps-tools.
//
// Prerequisites: run that tool's index.js and runAnalytics.js against the
// target instance, with --fixturesRepo=<path to this checkout> (see its
// README) - this writes cypress/fixtures/eventCoordinateFallbackScenarios.json
// and eventCoordinateFallbackFieldIds.json, which this spec reads directly (a
// missing/stale fixture fails cy.fixture() with a clear error). Also point
// cypress.env.json / the app dev server at the same instance.
//
// For each program (event-only and tracker), cycles through every main
// coordinate field crossed with every fallback option CoordinateField.jsx
// offers for it. Each combo is checked two ways against an expectation
// computed here from the fixtures (same resolution rule - main field
// first, then fallback - verify.js uses): the legend's "events without
// coordinates" count, and - more strongly - the data table's exact set of
// scenario codes with no Point geometry. The count alone could pass by
// coincidence if the wrong events resolved; the exact-set check can't.
//
// Slow (30-60+ min), so it's marked "include": false in
// cypress/support/cypressFiles.json. Run directly:
//   yarn cypress run --spec cypress/integration/layers/eventCoordinateFallbackScenarios.cy.js

import { EventLayer } from '../../elements/event_layer.js'
import { EXTENDED_TIMEOUT } from '../../support/util.js'

Cypress.on('uncaught:exception', (err) => {
    if (
        err.message.includes(
            'ResizeObserver loop completed with undelivered notifications.'
        )
    ) {
        return false
    }
})

const LABELS = {
    EVENT_LOCATION: 'Event location',
    ORG_UNIT_LOCATION: 'Organisation unit location',
    ENROLLMENT_LOCATION: 'Enrollment location',
    TRACKED_ENTITY_LOCATION: 'Tracked entity location',
    CUSTOM_COORDINATE_DE: 'Maps Test Coordinate DE',
    CUSTOM_ORGUNIT_DE: 'Maps Test OrgUnit DE',
    CUSTOM_COORDINATE_TEA: 'Maps Test Coordinate TEA',
    CUSTOM_ORGUNIT_TEA: 'Maps Test OrgUnit TEA',
    CASCADING: 'Cascading',
}
const NONE_LABEL = 'None'
const SCENARIO_CODE_COLUMN = 'Maps Test Scenario Code DE'

// The default org unit selection and relative period don't cover the test
// data's org units/dates, so both need to be set explicitly. The wide fixed
// range mirrors verify.js's own START_DATE/END_DATE, so it keeps working
// regardless of which day the data was imported.
const TEST_ORG_UNITS = [
    'Maps Test OU (with geometry)',
    'Maps Test OU (no geometry)',
]
const PERIOD_START_DATE = '2020-01-01'
const PERIOD_END_DATE = '2030-12-31'

const EVENT_PROGRAM_MAIN_FIELDS = [
    'EVENT_LOCATION',
    'ORG_UNIT_LOCATION',
    'CUSTOM_COORDINATE_DE',
    'CUSTOM_ORGUNIT_DE',
]
const TRACKER_PROGRAM_MAIN_FIELDS = [
    'EVENT_LOCATION',
    'ORG_UNIT_LOCATION',
    'ENROLLMENT_LOCATION',
    'TRACKED_ENTITY_LOCATION',
    'CUSTOM_COORDINATE_DE',
    'CUSTOM_ORGUNIT_DE',
    'CUSTOM_COORDINATE_TEA',
    'CUSTOM_ORGUNIT_TEA',
]

// Custom ORGANISATION_UNIT-type fields need 2.44+ as a fallback (see
// src/util/versionToggle.js). Duplicated here rather than imported, since
// app source can't be required into this browser-run spec.
//
// A separate, unrelated gate (CoordinateField.jsx) controls whether such a
// field appears as a MAIN field at all: 2.40.8+, 2.41.4+, or 2.42+. Not
// modeled here - assumed satisfied by whatever instance this runs against.
// If it isn't, selectCoordinate()/selectPopperOption() fail loudly (option
// not found) rather than passing incorrectly.
const ORG_UNIT_TYPE_FIELDS = ['CUSTOM_ORGUNIT_DE', 'CUSTOM_ORGUNIT_TEA']

const getServerMinorVersion = () => {
    const v = String(Cypress.env('dhis2InstanceVersion') || '')
    if (v.toLowerCase() === 'dev') {
        return Infinity
    }
    const match = v.match(/(\d+)\.(\d+)/)
    return match ? parseInt(match[2], 10) : parseInt(v, 10)
}

const supportsOrgUnitFallback = getServerMinorVersion() >= 44

// Builds every {mainField, fallbackField} combo the app's CoordinateField.jsx
// would offer for this field set: for each main field, fallback options are
// none, cascading, and every other field (minus org-unit-type fields when
// unsupported) - mirrors verify.js's buildFullTestCases().
const buildCombos = (mainFields) =>
    mainFields.flatMap((mainField) => {
        const otherFields = mainFields.filter(
            (field) =>
                field !== mainField &&
                (supportsOrgUnitFallback ||
                    !ORG_UNIT_TYPE_FIELDS.includes(field))
        )
        return [null, 'CASCADING', ...otherFields].map((fallbackField) => ({
            mainField,
            fallbackField,
        }))
    })

const labelOf = (fieldKey) => (fieldKey ? LABELS[fieldKey] : NONE_LABEL)

const comboTitle = (combo) =>
    `main=${labelOf(combo.mainField)} fallback=${labelOf(combo.fallbackField)}`

// Loaded once in the outer before() below, from cypress/fixtures/ - see
// maps-tools' test-data-event-layer-coordinates/idMap.js and fieldIds.js,
// which write those fixtures directly (this spec never reads that tool's
// own files).
let scenarios
let fieldIds

const PROGRAM_NAMES = {
    event: 'Maps Test Coordinates (Event)',
    tracker: 'Maps Test Coordinates (Tracker)',
}

const CASCADING_ID = 'cascading'
const CASCADE_WITH_TEI = [
    'psigeometry',
    'pigeometry',
    'teigeometry',
    'ougeometry',
]
const CASCADE_WITHOUT_TEI = ['psigeometry', 'ougeometry']

// Mirrors resolve.js's cascade order and resolution rule (main field first,
// then the fallback) - kept in sync manually since this spec intentionally
// doesn't import that script.
const resolveExpectedField = ({ points, hasTei, mainField, fallbackField }) => {
    if (points[mainField]) {
        return mainField
    }
    if (fallbackField === CASCADING_ID) {
        const chain = hasTei ? CASCADE_WITH_TEI : CASCADE_WITHOUT_TEI
        return chain.find((candidate) => points[candidate]) ?? null
    }
    if (fallbackField && points[fallbackField]) {
        return fallbackField
    }
    return null
}

// Maps the spec's semantic field keys to the real field id
// resolveExpectedField() needs: fixed strings for the built-in fields, and
// this run's generated custom DE/TEA ids (from the fieldIds fixture).
const resolveFieldId = (key) => {
    if (key === null || key === 'NONE') {
        return null
    }
    const map = {
        EVENT_LOCATION: 'psigeometry',
        ORG_UNIT_LOCATION: 'ougeometry',
        ENROLLMENT_LOCATION: 'pigeometry',
        TRACKED_ENTITY_LOCATION: 'teigeometry',
        CASCADING: CASCADING_ID,
        CUSTOM_COORDINATE_DE: fieldIds.deCoordinate,
        CUSTOM_ORGUNIT_DE: fieldIds.deOrgUnit,
        CUSTOM_COORDINATE_TEA: fieldIds.teaCoordinate,
        CUSTOM_ORGUNIT_TEA: fieldIds.teaOrgUnit,
    }
    if (!(key in map)) {
        throw new Error(`Unknown scenario field key: ${key}`)
    }
    return map[key]
}

const getScenarioEvents = (program) => {
    const programName = PROGRAM_NAMES[program]
    const events = scenarios.filter(
        (e) => e.type === 'event' && e.program === programName
    )
    if (events.length === 0) {
        throw new Error(
            `No "${programName}" events found in the scenarios fixture`
        )
    }
    return events
}

// Computes, for a program + main/fallback combo, the set of scenario codes
// expected to end up with no geometry (and the program's total event
// count) - the single source of truth both assertions below check against.
const resolveComboExpectation = ({
    program,
    hasTei,
    mainField,
    fallbackField,
}) => {
    const events = getScenarioEvents(program)
    const mainId = resolveFieldId(mainField)
    const fallbackId = resolveFieldId(fallbackField)

    const withoutCoordsCodes = new Set()
    events.forEach((event) => {
        const field = resolveExpectedField({
            points: event.points,
            hasTei,
            mainField: mainId,
            fallbackField: fallbackId,
        })
        if (field === null) {
            withoutCoordsCodes.add(event.scenarioCode)
        }
    })

    return { total: events.length, withoutCoordsCodes }
}

// Retries (like cy.get().should(cb)) rather than a one-shot read, since the
// legend text updates asynchronously after the layer reloads.
const assertEventsWithoutCoordinatesCount = (expected) => {
    cy.getByDataTest('layerlegend', EXTENDED_TIMEOUT).should(($legend) => {
        const text = $legend.text()
        let actual
        if (/all events have coordinates/i.test(text)) {
            actual = 0
        } else {
            const match = text.match(
                /([\d,. ]+)\s*events? without coordinates/i
            )
            expect(match, `"events without coordinates" text in: ${text}`).to
                .not.be.null
            actual = parseInt(match[1].replace(/\D/g, ''), 10)
        }
        expect(actual, 'events without coordinates count').to.equal(expected)
    })
}

const getColumnIndices = ($panel) => {
    const headerCells = [
        ...$panel[0].querySelectorAll(
            '[data-test="dhis2-uicore-datatablecellhead"]'
        ),
    ]
    const scenarioCodeIndex = headerCells.findIndex((cell) =>
        cell.textContent
            .toLowerCase()
            .includes(SCENARIO_CODE_COLUMN.toLowerCase())
    )
    const typeIndex = headerCells.findIndex(
        (cell) => cell.textContent.trim().toLowerCase() === 'type'
    )
    expect(scenarioCodeIndex, 'scenario code column found').to.be.at.least(0)
    expect(typeIndex, 'type column found').to.be.at.least(0)
    return { scenarioCodeIndex, typeIndex }
}

const readRenderedRows = ($panel, { scenarioCodeIndex, typeIndex }) =>
    [
        ...$panel[0].querySelectorAll(
            '[data-test="dhis2-uicore-tablebody"] [data-test="dhis2-uicore-datatablerow"]'
        ),
    ].map((row) => {
        const cells = row.querySelectorAll('td')
        return {
            scenarioCode: cells[scenarioCodeIndex]?.textContent.trim(),
            hasPoint: cells[typeIndex]?.textContent.trim() === 'Point',
        }
    })

// The table body is virtualized (react-virtuoso's TableVirtuoso): only rows
// currently scrolled into view exist in the DOM, so a single querySelectorAll
// only ever sees a handful of rows. Scrolls the panel's
// [data-testid="virtuoso-scroller"] (react-virtuoso's own stable test id)
// from top to bottom in viewport-height steps, collecting every row rendered
// along the way, keyed by scenario code so revisited rows don't double count.
const MAX_SCROLL_STEPS = 300

// Reads the scroller and its metrics within a single then() callback - if a
// DOM element is returned across a then() boundary, Cypress re-wraps it as a
// jQuery object for the next callback, and jQuery objects don't expose
// clientHeight/scrollHeight (and .scrollTop is a method, not a number).
//
// Stops once a requested scroll doesn't actually move scrollTop any further,
// rather than comparing against scrollHeight up front - react-virtuoso can
// under-report scrollHeight before it's finished measuring row heights,
// which was ending the walk after a single step.
//
// Steps by half a viewport (not a full one), and after each scroll waits for
// two consecutive reads of the rendered rows to come back identical -
// react-virtuoso mounts newly-visible rows asynchronously (a tick after the
// scroll position itself changes), so reading right after a full-viewport
// jump could land mid-render and skip whatever hadn't mounted yet.
const rowsSignature = (rows) =>
    rows
        .map(({ scenarioCode, hasPoint }) => `${scenarioCode}:${hasPoint}`)
        .join('|')

const waitForRenderedRowsToSettle = () => {
    let lastSignature = null
    let stableCount = 0

    return cy
        .getByDataTest('bottom-panel', EXTENDED_TIMEOUT)
        .should(($panel) => {
            const signature = rowsSignature(
                readRenderedRows($panel, getColumnIndices($panel))
            )
            if (signature === lastSignature) {
                stableCount++
            } else {
                stableCount = 0
                lastSignature = signature
            }
            expect(stableCount, 'rendered rows settled').to.be.at.least(1)
        })
}

const collectAllTableRows = (
    stepsLeft = MAX_SCROLL_STEPS,
    seen = new Map(),
    lastScrollTop = -1
) =>
    waitForRenderedRowsToSettle().then(($panel) => {
        const indices = getColumnIndices($panel)
        readRenderedRows($panel, indices).forEach((row) => {
            if (row.scenarioCode) {
                seen.set(row.scenarioCode, row.hasPoint)
            }
        })

        const scroller = $panel[0].querySelector(
            '[data-testid="virtuoso-scroller"]'
        )
        const scrollTop = scroller.scrollTop

        if (scrollTop === lastScrollTop || stepsLeft <= 0) {
            return seen
        }

        cy.wrap(scroller).scrollTo(0, scrollTop + scroller.clientHeight / 2, {
            ensureScrollable: false,
        })
        return cy.then(() =>
            collectAllTableRows(stepsLeft - 1, seen, scrollTop)
        )
    })

// Reads the data table (opened by checkCombo() just before this runs) and
// asserts the exact set of scenario codes with no Point geometry matches
// expectation - not just how many, so a bug that resolves the right NUMBER
// of events but the wrong ONES still fails.
const assertTableMatchesExpectation = ({ total, withoutCoordsCodes }) => {
    cy.getByDataTest('bottom-panel', EXTENDED_TIMEOUT)
        .find('[data-testid="virtuoso-scroller"]')
        .scrollTo('top', { ensureScrollable: false })

    collectAllTableRows().then((seen) => {
        expect(seen.size, 'total table rows').to.equal(total)

        const actualWithoutCoordsCodes = [...seen]
            .filter(([, hasPoint]) => !hasPoint)
            .map(([scenarioCode]) => scenarioCode)

        expect(
            actualWithoutCoordsCodes.sort(),
            'scenario codes with no point geometry'
        ).to.deep.equal([...withoutCoordsCodes].sort())
    })
}

// dhis2-uicore-layer is @dhis2/ui's generic Layer wrapper - used by
// Popover, but also by Modal (the edit dialog itself), which leaves its
// own instance in the DOM hidden (display: none) rather than unmounting it
// when closed. So an open popover has to be told apart from that hidden
// leftover by visibility, not just presence.
const VISIBLE_LAYER_SELECTOR = '[data-test="dhis2-uicore-layer"]:visible'

// Dismisses an open popover without toggling anything - re-clicking its
// trigger button doesn't work here, since the popover's own layer covers
// the whole viewport, sitting above the trigger while open. Established
// pattern (see thematic_layer.js): click the outer layer wrapper's
// topLeft corner, away from wherever the popover's own content is
// positioned. .last() targets the most recently opened one, in case a
// stray one is left over elsewhere.
const dismissPopover = () =>
    cy.get(VISIBLE_LAYER_SELECTOR).last().click('topLeft')

// If a previous combo's attempt failed mid-selection, the edit dialog can
// be left open with a stale, half-applied selection, and the field
// dropdown it was mid-click on can still be open too - layered above the
// modal, covering its Cancel button. Clears that nested popover first (a
// stray dismissPopover() click on the modal's own layer is a harmless
// no-op, since Modals don't close on an outside/backdrop click by design),
// then uses the modal's own Cancel button for a clean, predictable
// starting point rather than trying to resume whatever state it's in.
const ensureEditDialogClosed = () => {
    cy.get('body').then(($body) => {
        if ($body.find(VISIBLE_LAYER_SELECTOR).length > 0) {
            dismissPopover()
        }
    })
    cy.get('body').then(($body) => {
        if ($body.find('[data-test="layeredit"]').length > 0) {
            cy.getByDataTest('dhis2-uicore-modalactions')
                .contains('Cancel')
                .click()
        }
    })
    cy.getByDataTest('layeredit').should('not.exist')
}

// EventDataItemsProvider.jsx wraps the whole edit dialog and fires these
// two queries as soon as it mounts (see useProgramStageDataElements.js and
// useProgramTrackedEntityAttributes.js) - CoordinateField.jsx's option
// list depends on both, and doesn't stop changing until they resolve.
// Waiting on them directly (rather than polling the DOM for "it looks
// stable now") closes the race at its source instead of narrowing it.
// intercept matches against the raw request URL, so query values need
// encoding to match too - established pattern, see manageLayerSources.cy.js
// and usersettings.cy.js.
const interceptCoordinateFieldDataItems = () => {
    cy.intercept(
        'GET',
        `**/api/*/programStages/*?fields=${encodeURIComponent(
            'programStageDataElements'
        )}*`
    ).as('programStageDataElements')
    cy.intercept(
        'GET',
        `**/api/*/programs/*?fields=${encodeURIComponent(
            'trackedEntityType,programTrackedEntityAttributes'
        )}*`
    ).as('programTrackedEntityAttributes')
}

const applyCombo = (Layer, combo) => {
    ensureEditDialogClosed()
    interceptCoordinateFieldDataItems()
    cy.getByDataTest('layer-edit-button').click()
    cy.wait(
        ['@programStageDataElements', '@programTrackedEntityAttributes'],
        EXTENDED_TIMEOUT
    )
    Layer.selectTab('Data')
    Layer.selectCoordinate(labelOf(combo.mainField))
    Layer.selectFallbackCoordinate(labelOf(combo.fallbackField))
    Layer.updateMap()
    Layer.validateDialogClosed(true)
    cy.waitForMap()
}

const checkCombo = (program, hasTei, combo) => {
    const expectation = resolveComboExpectation({
        program,
        hasTei,
        mainField: combo.mainField,
        fallbackField: combo.fallbackField,
    })
    assertEventsWithoutCoordinatesCount(expectation.withoutCoordsCodes.size)

    // Opened/closed around just this check, not left open during applyCombo:
    // BottomPanel's ResizeObserver keeps reflowing the page while the table
    // is open, which was detaching the edit dialog's field popper mid-click.
    openDataTable()
    assertTableMatchesExpectation(expectation)
    closeDataTable()
}

// Maximizes the panel (BottomPanel.jsx clamps this to the available window
// height) instead of the default 300px, so far fewer scroll steps are
// needed to see every row - simulating the drag-to-resize handle itself
// isn't practical from Cypress. window.store is only exposed when
// window.Cypress is set (see src/store/index.js).
const maximizeDataTableHeight = () =>
    cy.window().its('store').invoke('dispatch', {
        type: 'DATA_TABLE_RESIZE',
        height: 10000,
    })

// Tolerates the table already being open (e.g. left open by a failed/
// retried test) instead of assuming "Show data table" is always the menu's
// current label. Then waits out DataTable.jsx's own loading cover
// (dhis2-uicore-componentcover, shown while the event layer's "extended"/
// full-geometry data is still loading) - the panel and even some rows can
// render before that finishes, which under-counted rows before this wait.
const openDataTable = () => {
    cy.getByDataTest('moremenubutton').first().click()
    cy.getByDataTest('more-menu').then(($menu) => {
        if (/hide data table/i.test($menu.text())) {
            dismissPopover()
        } else {
            cy.wrap($menu).find('li').contains('Show data table').click()
        }
    })
    cy.getByDataTest('bottom-panel', EXTENDED_TIMEOUT).should('be.visible')
    cy.getByDataTest('bottom-panel', EXTENDED_TIMEOUT)
        .find('[data-test="dhis2-uicore-componentcover"]')
        .should('not.exist')
    cy.getByDataTest('dhis2-uicore-datatablerow', EXTENDED_TIMEOUT).should(
        'have.length.greaterThan',
        0
    )
    maximizeDataTableHeight()
}

const closeDataTable = () => {
    cy.getByDataTest('moremenubutton').first().click()
    cy.getByDataTest('more-menu').then(($menu) => {
        if (/show data table/i.test($menu.text())) {
            dismissPopover()
        } else {
            cy.wrap($menu).find('li').contains('Hide data table').click()
        }
    })
    cy.getByDataTest('bottom-panel').should('not.exist')
}

describe('Event layer coordinate/fallback scenario matrix', () => {
    before(() => {
        cy.fixture('eventCoordinateFallbackScenarios.json').then((data) => {
            scenarios = data
        })
        cy.fixture('eventCoordinateFallbackFieldIds.json').then((data) => {
            fieldIds = data
        })
    })

    // testIsolation: false - the layer added in before() must stay on
    // screen across every it() below; default test isolation resets to a
    // blank page between tests and would remove it. Only supported as a
    // suite/test config override, not via Cypress.config() at runtime.
    describe(
        'Maps Test Coordinates (Event) - no registration',
        { testIsolation: false },
        () => {
            const combos = buildCombos(EVENT_PROGRAM_MAIN_FIELDS)

            before(() => {
                cy.visit('/')

                const Layer = new EventLayer()
                Layer.openDialog('Events')
                    .selectProgram('Maps Test Coordinates (Event)')
                    .validateStage('Maps Test Stage (Event)')
                    .selectTab('Period')
                    .selectStartEndDates()
                    .typeStartDate(PERIOD_START_DATE)
                    .typeEndDate(PERIOD_END_DATE)
                    .selectTab('Org Units')
                    .unselectOu('Sierra Leone')
                    .selectOu(TEST_ORG_UNITS[0])
                    .selectOu(TEST_ORG_UNITS[1])
                    .selectTab('Style')
                    .selectCountEventsWithoutCoordinates()
                    .selectLabelField('Maps Test Scenario Code DE')

                Layer.addToMap()
                Layer.validateDialogClosed(true)
                cy.waitForMap()
            })

            combos.forEach((combo) => {
                it(comboTitle(combo), () => {
                    const Layer = new EventLayer()
                    applyCombo(Layer, combo)
                    checkCombo('event', false, combo)
                })
            })
        }
    )

    // testIsolation: false - see the event program's describe() above.
    describe(
        'Maps Test Coordinates (Tracker) - with registration',
        { testIsolation: false },
        () => {
            const combos = buildCombos(TRACKER_PROGRAM_MAIN_FIELDS)

            before(() => {
                cy.visit('/')

                const Layer = new EventLayer()
                Layer.openDialog('Events')
                    .selectProgram('Maps Test Coordinates (Tracker)')
                    .validateStage('Maps Test Stage (Tracker)')
                    .selectTab('Period')
                    .selectStartEndDates()
                    .typeStartDate(PERIOD_START_DATE)
                    .typeEndDate(PERIOD_END_DATE)
                    .selectTab('Org Units')
                    .unselectOu('Sierra Leone')
                    .selectOu(TEST_ORG_UNITS[0])
                    .selectOu(TEST_ORG_UNITS[1])
                    .selectTab('Style')
                    .selectCountEventsWithoutCoordinates()
                    .selectLabelField('Maps Test Scenario Code DE')

                Layer.addToMap()
                Layer.validateDialogClosed(true)
                cy.waitForMap()
            })

            combos.forEach((combo) => {
                it(comboTitle(combo), () => {
                    const Layer = new EventLayer()
                    applyCombo(Layer, combo)
                    checkCombo('tracker', true, combo)
                })
            })
        }
    )
})
