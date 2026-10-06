import {
    applyDashboardFilters,
    clickPluginContextMenuItem,
    expectPluginAttribution,
    expectPluginLayerLegend,
    fetchChartAsMapVisualization,
    fetchMapVisualization,
    getLegendVisibilityButton,
    getPlugin,
    getPluginContextMenuItems,
    openPluginLegend,
    resizePlugin,
    rightClickPluginMapCenter,
    sendPluginProps,
    visitPlugin,
    waitForPluginMap,
} from '../elements/plugin.js'
import { EXTENDED_TIMEOUT } from '../support/util.js'

// ANC: 1st visit coverage (%) by district last year
const THEMATIC_MAP_ID = 'zDP78aJU8nX'
// ANC: LLITN Cov chiefdom this year
const CHIEFDOM_MAP_ID = 'eDlFx0jTtV9'
// Malaria: Cases Sierra Leone 2015-2016 clustered
const EVENT_MAP_ID = 'RZUmy4ty0gX'
// Health Facilities by Type with Radius SL
const FACILITY_MAP_ID = 'y3jLMnZTV6i'
// Boundaries: Districts and Chiefdoms
const ORG_UNIT_MAP_ID = 'bjaqzAFrDOS'
// EE: Nighttime lights 2013 EE
const EARTH_ENGINE_MAP_ID = 'zTjKU6imnuF'
// Immunization: Coverage and facility distribution
const FACILITY_AND_THEMATIC_MAP_ID = 'qBoKF1jLJ1u'
// ANC: ANC 3 coverage by districts last 12 months (column chart)
const CHART_ID = 'DeRrc1gTMjn'
// Dark basemap (external map layer)
const EXTERNAL_BASEMAP_ID = 'LOw2p0kPwua'
const UNKNOWN_BASEMAP_ID = 'unknoWNvSQd'

const SIERRA_LEONE_ID = 'ImspTQPwCqd'
const BO_DISTRICT_ID = 'O6uvpzGd5pu'

// The saved periods of the test maps (THIS_YEAR or a fixed year) don't have
// data on every instance or at every time of year, so the maps sent to the
// plugin are pinned to this period instead
const PINNED_PERIOD = { id: 'LAST_YEAR', name: 'Last year' }

const SYSTEM_SETTINGS_ENDPOINT = { method: 'GET', url: /systemSettings\?/ }
// Each layer load also sends a metadata-only (skipData=true) request; only the
// data request is waited on so each load matches one interception
const ANALYTICS_DATA_ENDPOINT = {
    method: 'GET',
    url: /\/analytics\?.*skipMeta=true/,
}
const EVENTS_ENDPOINT = /\/analytics\/events\//
const GEO_FEATURES_ENDPOINT = /\/geoFeatures\?/

const BASEMAP_REQUESTS = {
    osmLight: /tiles\.openfreemap\.org\/styles\/positron/,
    osmDark: /tiles\.openfreemap\.org\/styles\/dark/,
    openStreetMap: /tile\.openstreetmap\.org\//,
    externalDark: /cartodb-basemaps-\w\.global\.ssl\.fastly\.net\/dark_all\//,
}

const pinPeriod = (visualization) =>
    applyDashboardFilters(visualization, { pe: [PINNED_PERIOD] })

const visitPluginAndWaitForData = (visualization) => {
    cy.intercept(ANALYTICS_DATA_ENDPOINT).as('analytics')
    visitPlugin(visualization)
    cy.wait('@analytics', EXTENDED_TIMEOUT)
    waitForPluginMap()
}

const decodedUrl = (interception) =>
    decodeURIComponent(interception.request.url)

const expectAnalyticsDimension = (alias, dimension, itemIds) =>
    cy.wait(alias, EXTENDED_TIMEOUT).then((interception) => {
        const url = decodedUrl(interception)
        itemIds.forEach((id) =>
            expect(url).to.match(new RegExp(`${dimension}:[^&]*${id}`))
        )
    })

// Thematic legends are titled with the layer's data item name
const getDataItemName = (visualization) =>
    visualization.mapViews[0].columns.find((obj) => obj.dimension === 'dx')
        .items[0].name

const interceptBasemap = (basemap) =>
    cy.intercept(BASEMAP_REQUESTS[basemap]).as(basemap)

const setDefaultBasemapSetting = (keyDefaultBaseMap) =>
    cy.intercept(SYSTEM_SETTINGS_ENDPOINT, (req) => {
        delete req.headers['if-none-match']
        req.continue((res) => {
            if (keyDefaultBaseMap === undefined) {
                delete res.body.keyDefaultBaseMap
            } else {
                res.body.keyDefaultBaseMap = keyDefaultBaseMap
            }
            res.send({ body: res.body })
        })
    })

const withBasemap = (visualization, basemapProps) => {
    // eslint-disable-next-line no-unused-vars
    const { basemap, basemaps, ...rest } = visualization
    return { ...rest, ...basemapProps }
}

describe('Dashboard plugin', () => {
    let thematicMap
    let chiefdomMap

    before(() => {
        fetchMapVisualization(THEMATIC_MAP_ID).then((visualization) => {
            thematicMap = pinPeriod(visualization)
        })
        fetchMapVisualization(CHIEFDOM_MAP_ID).then((visualization) => {
            chiefdomMap = pinPeriod(visualization)
        })
    })

    describe('rendering', () => {
        it('renders a thematic map from dashboard props', () => {
            visitPlugin(thematicMap)
            waitForPluginMap()
            expectPluginLayerLegend(getDataItemName(thematicMap))
        })

        it('loads a map from its id when the dashboard sends no map views', () => {
            cy.intercept(
                { method: 'GET', url: new RegExp(`/maps/${THEMATIC_MAP_ID}`) },
                (req) => {
                    delete req.headers['if-none-match']
                    req.continue((res) => {
                        res.send({ body: { ...res.body, ...thematicMap } })
                    })
                }
            ).as('getMap')
            visitPlugin({ id: THEMATIC_MAP_ID })

            cy.wait('@getMap', EXTENDED_TIMEOUT)
            waitForPluginMap()
            expectPluginLayerLegend(getDataItemName(thematicMap))
        })

        it('shows a chart as a thematic map ("View as map")', () => {
            cy.intercept(ANALYTICS_DATA_ENDPOINT).as('analytics')
            fetchChartAsMapVisualization(CHART_ID).then((chart) => {
                const dataItem = chart.columns
                    .concat(chart.rows, chart.filters)
                    .find((obj) => obj.dimension === 'dx').items[0]

                visitPlugin(chart)
                expectAnalyticsDimension('@analytics', 'dx', [dataItem.id])
                waitForPluginMap()
                expectPluginLayerLegend(dataItem.name)
            })
        })

        const layerTypes = [
            {
                title: 'renders an event layer',
                mapId: EVENT_MAP_ID,
                request: EVENTS_ENDPOINT,
            },
            {
                title: 'renders a facility layer',
                mapId: FACILITY_MAP_ID,
                request: GEO_FEATURES_ENDPOINT,
            },
            {
                title: 'renders an org unit layer',
                mapId: ORG_UNIT_MAP_ID,
                request: GEO_FEATURES_ENDPOINT,
            },
            {
                title: 'renders an Earth Engine layer',
                mapId: EARTH_ENGINE_MAP_ID,
                request: /earthengine\.googleapis\.com/,
            },
        ]

        layerTypes.forEach(({ title, mapId, request }) => {
            it(title, () => {
                cy.intercept(request).as('layerRequest')
                fetchMapVisualization(mapId).then((visualization) => {
                    visitPlugin(visualization)
                })

                cy.wait('@layerRequest', EXTENDED_TIMEOUT)
                waitForPluginMap()
                expectPluginLayerLegend()
            })
        })
    })

    describe('layer errors', () => {
        it('shows an alert in the legend when a layer fails to load', () => {
            cy.intercept(ANALYTICS_DATA_ENDPOINT, {
                statusCode: 500,
                body: { message: 'Analytics failed' },
            })
            visitPlugin(thematicMap)

            waitForPluginMap()
            openPluginLegend()
                .find('.dhis2-map-legend-alert')
                .should('contain', 'Failed to load layer')
        })

        it('shows an alert in the legend when a layer has no data', () => {
            cy.intercept(ANALYTICS_DATA_ENDPOINT, (req) => {
                req.continue((res) => {
                    res.body.rows = []
                    res.send({ body: res.body })
                })
            })
            visitPlugin(thematicMap)

            waitForPluginMap()
            openPluginLegend()
                .find('.dhis2-map-legend-alert')
                .should('contain', 'No data found')
        })
    })

    // The plugin has no Redux store (see PluginWrapper.jsx), so these cover
    // map interactions that the app wires through Redux
    describe('interactions', () => {
        it('drills down from the context menu', () => {
            visitPluginAndWaitForData(thematicMap)

            // From a district to its chiefdoms (level 3)
            rightClickPluginMapCenter()
            clickPluginContextMenuItem('Drill down one level')
            expectAnalyticsDimension('@analytics', 'ou', ['LEVEL-3'])
            waitForPluginMap()
        })

        it('drills up from the context menu', () => {
            visitPluginAndWaitForData(chiefdomMap)

            // From a chiefdom to the districts (level 2)
            rightClickPluginMapCenter()
            clickPluginContextMenuItem('Drill up one level')
            expectAnalyticsDimension('@analytics', 'ou', ['LEVEL-2'])
            waitForPluginMap()
        })

        it('hides and shows a layer from the legend and keeps it interactive', () => {
            visitPlugin(thematicMap)
            waitForPluginMap()

            getLegendVisibilityButton()
                .should('have.attr', 'title', 'Hide layer')
                .click()
            getLegendVisibilityButton()
                .should('have.attr', 'title', 'Show layer')
                .click()
            getLegendVisibilityButton().should(
                'have.attr',
                'title',
                'Hide layer'
            )

            rightClickPluginMapCenter()
            getPluginContextMenuItems(EXTENDED_TIMEOUT).should(
                'contain',
                'Drill down one level'
            )
        })

        // TODO: unskip when maps-gl Layer.setVisibility resets the map's cached
        // interactive layer ids (Map.getEventFeature), which are cached without
        // the layer by any map event while it is hidden
        it.skip('keeps a layer interactive after a map event while hidden', () => {
            visitPlugin(thematicMap)
            waitForPluginMap()

            getLegendVisibilityButton().click()
            rightClickPluginMapCenter()
            getPluginContextMenuItems().should('not.exist')

            getLegendVisibilityButton().click()
            rightClickPluginMapCenter()
            getPluginContextMenuItems(EXTENDED_TIMEOUT).should(
                'contain',
                'Drill down one level'
            )
        })

        it('resizes the map with its dashboard item without reloading data', () => {
            visitPluginAndWaitForData(thematicMap)

            resizePlugin(500, 300)
            getPlugin()
                .find('.dhis2-map canvas')
                .should(($canvas) => {
                    expect($canvas.width()).to.be.closeTo(500, 2)
                    expect($canvas.height()).to.be.closeTo(300, 2)
                })
            waitForPluginMap()
            cy.get('@analytics.all').should('have.length', 1)
        })
    })

    describe('visualization updates', () => {
        it('updates the map when the dashboard sends a new visualization', () => {
            visitPluginAndWaitForData(thematicMap)

            // Wait for the new map's data so the previous map isn't asserted on
            sendPluginProps(chiefdomMap)
            expectAnalyticsDimension('@analytics', 'ou', ['LEVEL-3'])
            waitForPluginMap()
            expectPluginLayerLegend(getDataItemName(chiefdomMap))
        })

        // TODO: unskip when didViewsChange (src/util/pluginHelper.js) compares
        // the number of map views, layer types and data items
        describe.skip('changes not detected by didViewsChange', () => {
            it('updates the map when the new visualization has more layers', () => {
                visitPluginAndWaitForData(thematicMap)

                // Same first layer, so the change is only in the added layer
                sendPluginProps({
                    ...thematicMap,
                    mapViews: [
                        thematicMap.mapViews[0],
                        { ...chiefdomMap.mapViews[0], id: 'secondLayer1' },
                    ],
                })
                cy.wait(['@analytics', '@analytics'], EXTENDED_TIMEOUT)
                waitForPluginMap()
                openPluginLegend()
                    .find('.dhis2-map-legend-title-text')
                    .should('have.length', 2)
            })

            it('updates the map when only the data item changes', () => {
                visitPluginAndWaitForData(thematicMap)

                const chiefdomDataItem = chiefdomMap.mapViews[0].columns[0]
                sendPluginProps({
                    ...thematicMap,
                    mapViews: [
                        {
                            ...thematicMap.mapViews[0],
                            columns: [chiefdomDataItem],
                        },
                    ],
                })
                expectAnalyticsDimension('@analytics', 'dx', [
                    chiefdomDataItem.items[0].id,
                ])
                waitForPluginMap()
            })
        })
    })

    describe('basemaps', () => {
        // VERSION-TOGGLE: https://dhis2.atlassian.net/browse/DHIS2-20417
        // Maps only have the basemaps array from 2.43, earlier versions send
        // the legacy basemap string covered below
        it(['>=43'], 'uses the id from the basemaps array', () => {
            interceptBasemap('openStreetMap')
            visitPlugin(
                withBasemap(thematicMap, {
                    basemaps: [{ id: 'openStreetMap' }],
                })
            )
            waitForPluginMap()
            cy.wait('@openStreetMap', EXTENDED_TIMEOUT)
        })

        it('uses a legacy external basemap string', () => {
            interceptBasemap('externalDark')
            visitPlugin(
                withBasemap(thematicMap, { basemap: EXTERNAL_BASEMAP_ID })
            )
            waitForPluginMap()
            cy.wait('@externalDark', EXTENDED_TIMEOUT)
        })

        it('uses the fallback basemap when no basemap and no system default are set', () => {
            setDefaultBasemapSetting(undefined)
            interceptBasemap('osmLight')
            visitPlugin(withBasemap(thematicMap, {}))
            waitForPluginMap()
            cy.wait('@osmLight', EXTENDED_TIMEOUT)
            expectPluginAttribution('OpenFreeMap', true)
        })

        it('uses the system default basemap when the basemap is unknown', () => {
            setDefaultBasemapSetting(EXTERNAL_BASEMAP_ID)
            interceptBasemap('externalDark')
            visitPlugin(
                withBasemap(thematicMap, { basemap: UNKNOWN_BASEMAP_ID })
            )
            waitForPluginMap()
            cy.wait('@externalDark', EXTENDED_TIMEOUT)
        })

        it('uses the fallback basemap when the basemap and system default are both invalid', () => {
            setDefaultBasemapSetting('noexist')
            interceptBasemap('osmLight')
            visitPlugin(
                withBasemap(thematicMap, { basemap: UNKNOWN_BASEMAP_ID })
            )
            waitForPluginMap()
            cy.wait('@osmLight', EXTENDED_TIMEOUT)
        })

        it('uses the fallback basemap when external map layers fail to load', () => {
            setDefaultBasemapSetting(undefined)
            cy.intercept(/externalMapLayers/, { statusCode: 409 }).as(
                'externalMapLayers'
            )
            interceptBasemap('osmLight')
            visitPlugin(
                withBasemap(thematicMap, { basemap: EXTERNAL_BASEMAP_ID })
            )
            cy.wait('@externalMapLayers', EXTENDED_TIMEOUT)
            waitForPluginMap()
            cy.wait('@osmLight', EXTENDED_TIMEOUT)
        })

        it('uses an internal basemap when external map layers fail to load', () => {
            // External map layers are only requested when the basemap or the
            // system default basemap is an external one
            setDefaultBasemapSetting(EXTERNAL_BASEMAP_ID)
            cy.intercept(/externalMapLayers/, { statusCode: 409 }).as(
                'externalMapLayers'
            )
            interceptBasemap('osmDark')
            visitPlugin(withBasemap(thematicMap, { basemap: 'osmDark' }))
            cy.wait('@externalMapLayers', EXTENDED_TIMEOUT)
            waitForPluginMap()
            cy.wait('@osmDark', EXTENDED_TIMEOUT)
        })

        // A hidden vector basemap still loads its tiles, so these check the
        // attribution instead
        it('hides the default basemap when the legacy basemap is none', () => {
            setDefaultBasemapSetting(undefined)
            interceptBasemap('osmLight')
            visitPlugin(withBasemap(thematicMap, { basemap: 'none' }))
            cy.wait('@osmLight', EXTENDED_TIMEOUT)
            waitForPluginMap()
            expectPluginAttribution('OpenFreeMap', false)
        })

        // VERSION-TOGGLE: https://dhis2.atlassian.net/browse/DHIS2-20417
        it(
            ['>=43'],
            'hides the basemap when it is hidden in the basemaps array',
            () => {
                visitPlugin(
                    withBasemap(thematicMap, {
                        basemaps: [{ id: 'openStreetMap', hidden: true }],
                    })
                )
                waitForPluginMap()
                expectPluginAttribution('OpenStreetMap', false)
            }
        )
    })

    describe('dashboard filters', () => {
        const periodFilter = {
            pe: [{ id: 'LAST_12_MONTHS', name: 'Last 12 months' }],
        }
        const orgUnitFilter = { ou: [{ id: BO_DISTRICT_ID, name: 'Bo' }] }

        it('applies a period filter sent after the item mounted', () => {
            visitPluginAndWaitForData(thematicMap)

            sendPluginProps(applyDashboardFilters(thematicMap, periodFilter))
            expectAnalyticsDimension('@analytics', 'pe', ['LAST_12_MONTHS'])
            waitForPluginMap()
        })

        it('applies an org unit filter sent after the item mounted', () => {
            visitPluginAndWaitForData(thematicMap)

            sendPluginProps(applyDashboardFilters(thematicMap, orgUnitFilter))
            expectAnalyticsDimension('@analytics', 'ou', [BO_DISTRICT_ID])
            waitForPluginMap()
        })

        it('applies filters that are active when the item mounts', () => {
            cy.intercept(ANALYTICS_DATA_ENDPOINT).as('analytics')
            visitPlugin(
                applyDashboardFilters(thematicMap, {
                    ...periodFilter,
                    ...orgUnitFilter,
                })
            )
            cy.wait('@analytics', EXTENDED_TIMEOUT).then((interception) => {
                const url = decodedUrl(interception)
                expect(url).to.match(/pe:[^&]*LAST_12_MONTHS/)
                expect(url).to.match(new RegExp(`ou:[^&]*${BO_DISTRICT_ID}`))
                expect(url).not.to.match(
                    new RegExp(`pe:[^&]*${PINNED_PERIOD.id}`)
                )
            })
            waitForPluginMap()
        })

        it("restores the map's own period when filters are cleared", () => {
            visitPluginAndWaitForData(
                applyDashboardFilters(thematicMap, periodFilter)
            )

            sendPluginProps(thematicMap)
            expectAnalyticsDimension('@analytics', 'pe', [PINNED_PERIOD.id])
            waitForPluginMap()
        })

        it('applies a period filter to event layers', () => {
            cy.intercept(EVENTS_ENDPOINT).as('events')
            fetchMapVisualization(EVENT_MAP_ID).then((eventMap) => {
                visitPlugin(applyDashboardFilters(eventMap, periodFilter))
            })

            expectAnalyticsDimension('@events', 'pe', ['LAST_12_MONTHS'])
            waitForPluginMap()
        })

        it('does not apply dashboard filters to facility layers', () => {
            cy.intercept(ANALYTICS_DATA_ENDPOINT).as('analytics')
            cy.intercept(GEO_FEATURES_ENDPOINT).as('geoFeatures')
            fetchMapVisualization(FACILITY_AND_THEMATIC_MAP_ID).then(
                (mixedMap) => {
                    visitPlugin(
                        applyDashboardFilters(mixedMap, {
                            ...periodFilter,
                            ...orgUnitFilter,
                        })
                    )
                }
            )

            expectAnalyticsDimension('@analytics', 'ou', [BO_DISTRICT_ID])
            waitForPluginMap()

            // The facility layer keeps its saved org units: all facilities
            // (level 4) in Sierra Leone
            cy.get('@geoFeatures.all').should((interceptions) => {
                const urls = interceptions.map(decodedUrl)
                expect(
                    urls.some(
                        (url) =>
                            url.includes(SIERRA_LEONE_ID) &&
                            url.includes('LEVEL-4')
                    )
                ).to.be.true
            })
        })
    })
})
