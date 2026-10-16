import { getDashboardItemProps } from '../../src/pluginHost/pluginHostHelpers.js'
import {
    FAVORITE_FIELDS,
    MAP_FIELDS,
} from '../../src/pluginHost/pluginHostQueries.js'
import { EXTENDED_TIMEOUT, getApiBaseUrl } from '../support/util.js'

export { applyDashboardFilters } from '../../src/pluginHost/pluginHostHelpers.js'

// Dev-only host page (src/pluginHost), same-origin with plugin.html
const HOST_URL = '/plugin-host.html'
const PLUGIN_IFRAME = '[data-test="plugin-host-iframe-wrap"] iframe'

// DHIS2 API requests, as the dashboard app makes them
// ---------------------------------------------------

export const fetchMapVisualization = (mapId) =>
    cy
        .request(`${getApiBaseUrl()}/api/maps/${mapId}?fields=${MAP_FIELDS}`)
        .its('body')

// "View as map" sends a chart without id and mapViews (getVisualizationConfig)
export const fetchChartAsMapVisualization = (visualizationId) =>
    cy
        .request(
            `${getApiBaseUrl()}/api/visualizations/${visualizationId}?fields=${FAVORITE_FIELDS}`
        )
        .its('body')
        .then((visualization) => ({ ...visualization, id: undefined }))

// Host page standing in for the dashboard app
// -------------------------------------------

const getPluginProps = (visualization, extraProps) => ({
    ...getDashboardItemProps(visualization),
    ...extraProps,
})

// Without props, for using the page's own controls
export const visitPluginHost = () => cy.visit(HOST_URL)

export const visitPlugin = (visualization, { extraProps, size } = {}) =>
    cy.visit(HOST_URL, {
        onBeforeLoad: (win) => {
            win.pluginProps = getPluginProps(visualization, extraProps)
            win.pluginSize = size
        },
    })

// The host registers its setters after mounting, so retry until they exist
export const sendPluginProps = (visualization, extraProps) =>
    cy
        .window()
        .its('setPluginProps')
        .then((setPluginProps) =>
            setPluginProps(getPluginProps(visualization, extraProps))
        )

export const resizePlugin = (width, height) =>
    cy
        .window()
        .its('setPluginSize')
        .then((setPluginSize) => setPluginSize({ width, height }))

// A real click: browsers only allow fullscreen after a user gesture
export const enterPluginFullscreen = () =>
    cy.get('[data-test="plugin-host-fullscreen"]').realClick()

export const exitPluginFullscreen = () =>
    cy.document().then((doc) => doc.exitFullscreen())

// Elements inside the plugin iframe
// ---------------------------------
// The plugin components have no data-test attributes, so class names and
// labels are used instead

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

export const getPluginLegendTitles = () =>
    openPluginLegend().find('.dhis2-map-legend-title-text')

export const getPluginLegendAlerts = () =>
    openPluginLegend().find('.dhis2-map-legend-alert')

// Basemap attributions are only shown for visible basemaps
export const getPluginAttribution = (text) =>
    getPlugin().find(`.maplibregl-ctrl-attrib a:visible:contains("${text}")`)
