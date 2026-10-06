import { EXTENDED_TIMEOUT, getApiBaseUrl } from '../support/util.js'

// Not real files: both are served by cy.intercept so the host page is
// same-origin with plugin.html, which getPlugin needs to read the iframe
// document. pluginHost.html loads post-robot from POST_ROBOT_URL.
const HOST_URL = '/plugin-host.html'
const POST_ROBOT_URL = '/plugin-host/post-robot.min.js'
const PLUGIN_IFRAME = '#plugin-iframe'

// Requests to the DHIS2 API, mirroring how the dashboard app loads its items
// ----------------------------------------------------------------------------

// Same fields the dashboard app requests for its items (getFavoriteFields and
// getMapFields)
const DIMENSION_FIELDS =
    'dimension,legendSet[id],filter,programStage,items[dimensionItem~rename(id),displayName~rename(name),dimensionItemType],dimensionType,program[id],optionSet[id],valueType'
const AXES_FIELDS = ['columns', 'rows', 'filters']
    .map((axis) => `${axis}[${DIMENSION_FIELDS}]`)
    .join(',')
const FAVORITE_FIELDS = [
    'id',
    'displayName~rename(name)',
    'type',
    'displayDescription~rename(description)',
    AXES_FIELDS,
    '*',
    '!attributeDimensions',
    '!attributeValues',
    '!category',
    '!categoryDimensions',
    '!categoryOptionGroupSetDimensions',
    '!columnDimensions',
    '!dataDimensionItems',
    '!dataElementDimensions',
    '!dataElementGroupSetDimensions',
    '!filterDimensions',
    '!itemOrganisationUnitGroups',
    '!lastUpdatedBy',
    '!organisationUnitGroupSetDimensions',
    '!organisationUnitLevels',
    '!organisationUnits',
    '!programIndicatorDimensions',
    '!relativePeriods',
    '!reportParams',
    '!rowDimensions',
    '!translations',
    '!userOrganisationUnit',
    '!userOrganisationUnitChildren',
    '!userOrganisationUnitGrandChildren',
].join(',')
const MAP_VIEW_FIELDS = [
    FAVORITE_FIELDS,
    'program[id,displayName~rename(name)]',
    'programStage[id,displayName~rename(name)]',
    'trackedEntityType[id,displayName~rename(name)]',
].join(',')
const MAP_FIELDS = `id,displayName~rename(name),user,longitude,latitude,zoom,basemap,basemaps,mapViews[${MAP_VIEW_FIELDS}]`

export const fetchMapVisualization = (mapId) =>
    cy
        .request(`${getApiBaseUrl()}/api/maps/${mapId}?fields=${MAP_FIELDS}`)
        .its('body')

// A chart shown with "View as map" on a dashboard is sent without its id and
// without mapViews (getVisualizationConfig in the dashboard app)
export const fetchChartAsMapVisualization = (visualizationId) =>
    cy
        .request(
            `${getApiBaseUrl()}/api/visualizations/${visualizationId}?fields=${FAVORITE_FIELDS}`
        )
        .its('body')
        .then((visualization) => ({ ...visualization, id: undefined }))

// Mirrors the dashboard app's getFilteredVisualization: filters only apply to
// thematic and event layers, replacing the items of a matching dimension or
// adding the dimension as a filter when it is not used by the layer.
export const applyDashboardFilters = (visualization, filters) => ({
    ...visualization,
    mapViews: visualization.mapViews.map((mapView) => {
        if (!/thematic|event/.test(mapView.layer)) {
            return mapView
        }

        const rows = mapView.rows.map((obj) => ({ ...obj }))
        const columns = mapView.columns.map((obj) => ({ ...obj }))
        const mapViewFilters = mapView.filters.map((obj) => ({ ...obj }))

        Object.entries(filters).forEach(([dimension, items]) => {
            const matches = [...rows, ...columns, ...mapViewFilters].filter(
                (obj) => obj.dimension === dimension
            )

            if (matches.length) {
                matches.forEach((obj) => (obj.items = items))
            } else {
                mapViewFilters.push({ dimension, items })
            }
        })

        return { ...mapView, rows, columns, filters: mapViewFilters }
    }),
})

// Host page standing in for the dashboard app
// -------------------------------------------

const getPluginProps = (visualization, extraProps = {}) => ({
    isVisualizationLoaded: true,
    forDashboard: true,
    displayProperty: 'name',
    visualization,
    cacheId: `cypress-${visualization.id ?? 'item'}`,
    isParentCached: false,
    ...extraProps,
})

export const visitPlugin = (visualization, extraProps) => {
    // post-robot is a transitive dependency (via the app shell), served from
    // the same copy the plugin bundles so both ends share its protocol
    cy.readFile('node_modules/post-robot/dist/post-robot.min.js').then(
        (script) => {
            cy.intercept('GET', POST_ROBOT_URL, {
                body: script,
                headers: { 'content-type': 'application/javascript' },
            })
        }
    )
    cy.intercept('GET', HOST_URL, { fixture: 'pluginHost.html' })

    cy.visit(HOST_URL, {
        onBeforeLoad: (win) => {
            win.pluginProps = getPluginProps(visualization, extraProps)
        },
    })
}

export const sendPluginProps = (visualization, extraProps) =>
    cy
        .window()
        .then((win) =>
            win.sendPluginProps(getPluginProps(visualization, extraProps))
        )

export const resizePlugin = (width, height) =>
    cy
        .get(PLUGIN_IFRAME)
        .invoke('css', { width: `${width}px`, height: `${height}px` })

// Elements inside the plugin iframe. The plugin components have no data-test
// attributes (unlike the app's), so class names and labels are used instead.
// ----------------------------------------------------------------------------

// Kept as a pure query chain so Cypress re-queries the iframe document after
// it navigates from about:blank to plugin.html
export const getPlugin = () =>
    cy
        .get(PLUGIN_IFRAME, EXTENDED_TIMEOUT)
        .its('0.contentDocument.body', EXTENDED_TIMEOUT)

export const waitForPluginMap = () =>
    getPlugin()
        .find('.dhis2-map.dhis2-map-rendered', EXTENDED_TIMEOUT)
        .should('be.visible')

// The center of the map hits an org unit of the thematic test maps
export const rightClickPluginMapCenter = () =>
    getPlugin()
        .find('.dhis2-map canvas')
        .then(($canvas) =>
            cy
                .wrap($canvas)
                .rightclick($canvas.width() / 2, $canvas.height() / 2)
        )

export const getPluginContextMenuItems = (options) =>
    getPlugin().find('[data-test="dhis2-uicore-menuitem"]', options)

export const clickPluginContextMenuItem = (label) =>
    getPluginContextMenuItems(EXTENDED_TIMEOUT).contains(label).click()

export const getPluginLegend = () =>
    getPlugin().find('.dhis2-map-legend', EXTENDED_TIMEOUT)

// The legend only opens on hover; does nothing if it is already open
export const openPluginLegend = () => {
    getPluginLegend().then(($legend) => {
        const $button = $legend.find('.dhis2-map-legend-button')
        if ($button.length) {
            cy.wrap($button).trigger('mouseover')
        }
    })
    return getPluginLegend().find('.dhis2-map-legend-content')
}

export const getLegendVisibilityButton = () =>
    openPluginLegend().find('.dhis2-map-legend-visibility-btn')

// A loaded layer has a legend title and no alerts (load errors and warnings
// are shown as legend alerts)
export const expectPluginLayerLegend = (title) => {
    openPluginLegend()
        .find('.dhis2-map-legend-title-text')
        .should(title ? 'contain' : 'not.be.empty', title)
    getPluginLegend().find('.dhis2-map-legend-alert').should('not.exist')
}

// Basemap attributions are only rendered for visible basemaps
export const expectPluginAttribution = (text, isShown) =>
    getPlugin()
        .find('.dhis2-map')
        .should(($map) => {
            const shownLinks = $map
                .find('.maplibregl-ctrl-attrib a')
                .filter(
                    (_, link) =>
                        link.textContent.includes(text) &&
                        link.offsetParent !== null
                )
            expect(shownLinks.length > 0).to.equal(isShown)
        })
