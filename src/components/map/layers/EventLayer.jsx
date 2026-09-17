import { Analytics } from '@dhis2/analytics'
import i18n from '@dhis2/d2-i18n'
import { clustersDbscan } from '@turf/clusters-dbscan'
import { concave } from '@turf/concave'
import React from 'react'
import {
    EVENT_COLOR,
    EVENT_RADIUS,
    EVENT_DBSCAN_EPS_DEFAULT,
    EVENT_DBSCAN_MIN_POINTS_DEFAULT,
    EVENT_DBSCAN_CLUSTER_MIN_RADIUS,
    EVENT_DBSCAN_CLUSTER_MAX_RADIUS,
    EVENT_DBSCAN_NOISE_COLOR,
    EVENT_DBSCAN_NOISE_RADIUS,
    EVENT_DBSCAN_REVEAL_PIXEL_RADIUS,
    EVENT_DBSCAN_HULL_OPACITY_FACTOR,
    GEOJSON_LAYER,
    LABEL_TEMPLATE_NAME_ONLY,
    LABEL_TEMPLATE_TOOLTIP_ONLY,
} from '../../../constants/layers.js'
import { getClusterColor, getContrastColor } from '../../../util/colors.js'
import { loadEventCoordinateFieldName } from '../../../util/coordinatesName.js'
import {
    getAnalyticsRequest,
    EVENT_PROGRAM_STAGE_DATA_ELEMENTS_QUERY,
    EVENT_PROGRAM_ATTRIBUTES_QUERY,
} from '../../../util/event.js'
import { filterData } from '../../../util/filter.js'
import { getCentroid, CENTROID_FORMAT_GEOJSON } from '../../../util/geojson.js'
import { formatValueForDisplay } from '../../../util/helpers.js'
import { getLabelStyle } from '../../../util/labels.js'
import { sortLegendItems } from '../../../util/legend.js'
import { formatCount } from '../../../util/numbers.js'
import { OPTION_SET_QUERY } from '../../../util/requests.js'
import Popup from '../Popup.jsx'
import EventPopup from './EventPopup.jsx'
import Layer from './Layer.js'

// Equirectangular approximation, not a proper haversine/turf distance —
// plenty accurate at the local/regional scale a single DBSCAN cluster
// layer operates at, without pulling in another @turf/* dependency just
// for this one greedy-color-assignment heuristic (see setupDbscanClusters)
const approxDistanceMeters = ([lng1, lat1], [lng2, lat2]) => {
    const EARTH_RADIUS = 6371000
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const x = dLng * Math.cos(((lat1 + lat2) / 2) * (Math.PI / 180))
    return Math.sqrt(x * x + dLat * dLat) * EARTH_RADIUS
}

class EventLayer extends Layer {
    clusterCount = 0

    state = {
        popup: null,
        displayItems: null,
        eventCoordinateFieldName: null,
    }

    createLayer() {
        const {
            id,
            index,
            opacity,
            isVisible,
            bounds,
            data,
            engine,
            eventClustering,
            dbscanClustering,
            dbscanEps,
            dbscanMinPoints,
            eventCoordinateField,
            eventPointColor,
            eventPointRadius,
            nameProperty,
            program,
            programStage,
            serverCluster,
            geometryCentroid,
            areaRadius,
            styleDataItem,
            legend,
            dataFilters,
            labelDataItem,
            keyAnalysisDigitGroupSeparator,
            labels,
            labelFontColor,
            labelFontSize,
            labelFontWeight,
            labelFontStyle,
        } = this.props

        const analyticsEngine = Analytics.getAnalytics(engine)

        const filteredData = filterData(data, dataFilters)

        // Some older favorites don't have a valid color code
        const color =
            eventPointColor && eventPointColor.charAt(0) !== '#'
                ? '#' + eventPointColor
                : eventPointColor

        // Noise points (DBSCAN mode) default to a muted grey rather than the
        // sitewide near-black EVENT_COLOR, so they read as neutral against
        // clustered points' own distinct colors — but an explicit user
        // color choice still wins, same as any other event style mode
        const fillColor =
            color || (dbscanClustering ? EVENT_DBSCAN_NOISE_COLOR : EVENT_COLOR)
        const strokeColor = !styleDataItem
            ? getContrastColor(fillColor)
            : undefined
        const countColor = strokeColor
        const radius =
            eventPointRadius ||
            (dbscanClustering ? EVENT_DBSCAN_NOISE_RADIUS : EVENT_RADIUS)

        const map = this.context.map

        // Pre-compute label text into properties.name for the {name} template,
        // and tooltip text into properties.tooltip for the {tooltip} template.
        const noDataLabel = i18n.t('No data')
        const formatItemValue = (feature, dataItem) => {
            const v = feature.properties[dataItem.id]
            return (
                (v != null &&
                    v !== '' &&
                    formatValueForDisplay({
                        value: String(v),
                        valueType: dataItem.valueType,
                        options: dataItem.options,
                        keyAnalysisDigitGroupSeparator,
                    })) ||
                noDataLabel
            )
        }
        const labeledData =
            (labelDataItem || styleDataItem) && filteredData
                ? filteredData.map((f) => ({
                      ...f,
                      properties: {
                          ...f.properties,
                          ...(labelDataItem && {
                              name: formatItemValue(f, labelDataItem),
                          }),
                          ...(styleDataItem && {
                              tooltip: formatItemValue(f, styleDataItem),
                          }),
                      },
                  }))
                : filteredData

        // Default props = no cluster
        const config = {
            type: 'events',
            id,
            index,
            opacity,
            isVisible,
            data: labeledData,
            fillColor,
            strokeColor,
            countColor,
            radius,
            onClick: this.onEventClick.bind(this),
            ...(styleDataItem && { hoverLabel: LABEL_TEMPLATE_TOOLTIP_ONLY }),
            ...(labelDataItem &&
                labels && {
                    label: LABEL_TEMPLATE_NAME_ONLY,
                    labelStyle: getLabelStyle({
                        labelFontColor,
                        labelFontSize,
                        labelFontWeight,
                        labelFontStyle,
                    }),
                }),
        }

        // DBSCAN density clustering — mockup for DHIS2-21461, computed
        // client-side since it needs the full loaded point set at once
        if (dbscanClustering) {
            this.setupDbscanClusters(labeledData, {
                eps: dbscanEps || EVENT_DBSCAN_EPS_DEFAULT,
                minPoints: dbscanMinPoints || EVENT_DBSCAN_MIN_POINTS_DEFAULT,
            })
            config.data = this.renderDbscanFeatures()
            config.label = LABEL_TEMPLATE_NAME_ONLY
            config.labelStyle = getLabelStyle({
                labelFontColor,
                labelFontSize,
                labelFontWeight,
                labelFontStyle,
            })
        } else {
            this.applyClusteringConfig(config, {
                eventClustering,
                serverCluster,
                bounds,
                areaRadius,
                color,
                styleDataItem,
                legend,
                id,
                nameProperty,
                engine,
                analyticsEngine,
                geometryCentroid,
            })
        }

        if (program && programStage) {
            this.loadDisplayItems({
                engine,
                nameProperty,
                styleDataItem,
                program,
                programStage,
                eventCoordinateField,
            })
        }

        // Create and add event layer based on config object. DBSCAN mode
        // wraps it in a group alongside a separate cluster-hull layer, so
        // the hull's opacity/z-order can be controlled independently of
        // the events layer's own points (see EVENT_DBSCAN_HULL_OPACITY_FACTOR).
        if (dbscanClustering) {
            this.layer = map.createLayer({
                type: 'group',
                id,
                index,
                opacity,
                isVisible,
            })
            this.layer.addLayer({
                type: GEOJSON_LAYER,
                id: `${id}-dbscan-hulls`,
                // A plain feature array, like the main config's own data
                // below — maps-gl's Layer.setFeatures() expects that, not
                // a wrapped FeatureCollection (that shape is only what the
                // raw maplibre-gl source's own setData() takes, used in
                // updateDbscanFeatures for the *other* sub-layer)
                data: this.dbscanHulls,
                style: { opacityFactor: EVENT_DBSCAN_HULL_OPACITY_FACTOR },
                // Clicking the hull opens the same cluster popup as
                // clicking its bubble/points — hull features carry the
                // same isDbscanCluster/dbscanCount/clusterNumber, see
                // setupDbscanClusters
                onClick: this.onEventClick.bind(this),
            })
            this.layer.addLayer(config)
        } else {
            this.layer = map.createLayer(config)
        }

        map.addLayer(this.layer)
        this.setLayerVisibility()

        // Re-render (not re-cluster) on zoom: a cluster's aggregate bubble
        // can swap for its individual member points once they're spread
        // far enough apart on screen — see renderDbscanFeatures. Cluster
        // membership itself was already fixed above in setupDbscanClusters.
        if (dbscanClustering) {
            // maps-gl's Layer assigns each instance its own random id
            // internally (unrelated to the id/config we pass in), so the
            // events sub-layer's actual GeoJSON source id can only be read
            // off the real instance the group just created — LayerGroup
            // queues configs and only turns them into instances (in the
            // same order) once map.addLayer(this.layer) runs, just above.
            // Hulls were queued first, so events is the last instance.
            const eventsLayer = this.layer._layers?.at(-1)
            this.dbscanEventsLayerId = eventsLayer?.getId()

            // 'zoom' (continuous, fires through the gesture) rather than
            // 'zoomend' (fires once, only after the gesture settles) — with
            // only 'zoomend', reveal/collapse only catches up once zooming
            // stops, so a fast scroll-wheel zoom-out sails straight past
            // the actual threshold and only resolves once you stop,
            // making it feel like it needs far more zoom than it actually does
            this.onDbscanZoom = () => this.updateDbscanFeatures()
            map.getMapGL().on('zoom', this.onDbscanZoom)
        }

        // Fit map to layer bounds once (when first created)
        this.fitBoundsOnce()
    }

    async removeLayer() {
        if (this.onDbscanZoom) {
            this.context.map.getMapGL().off('zoom', this.onDbscanZoom)
            this.onDbscanZoom = null
        }
        await super.removeLayer()
    }

    // Mutates config in place: server/client/donut clustering, or a buffer.
    applyClusteringConfig(
        config,
        {
            eventClustering,
            serverCluster,
            bounds,
            areaRadius,
            color,
            styleDataItem,
            legend,
            id,
            nameProperty,
            engine,
            analyticsEngine,
            geometryCentroid,
        }
    ) {
        let eventRequest

        if (eventClustering) {
            if (serverCluster) {
                config.type = 'serverCluster'
                config.bounds = bounds

                config.load = async (params, callback) => {
                    eventRequest =
                        eventRequest ||
                        (await getAnalyticsRequest(this.props, {
                            analyticsEngine,
                            nameProperty,
                            engine,
                        }))

                    eventRequest = eventRequest
                        .withBbox(params.bbox)
                        .withClusterSize(params.clusterSize)
                        .withIncludeClusterPoints(params.includeClusterPoints)

                    const clusterData = await analyticsEngine.events.getCluster(
                        eventRequest
                    )

                    callback(
                        params.tileId,
                        this.toGeoJson(clusterData, geometryCentroid)
                    )
                }
            } else {
                config.clusterPane = id

                if (styleDataItem && legend) {
                    config.type = 'donutCluster'
                    config.groups = legend.items
                    config.sortSegments = sortLegendItems
                    config.formatCount = formatCount
                } else {
                    config.type = 'clientCluster'
                }
            }
        } else if (areaRadius) {
            config.buffer = areaRadius
            config.bufferStyle = {
                color: color || EVENT_COLOR,
                weight: 1,
                opacity: 0.2,
                fillOpacity: 0.1,
            }
        }
    }

    // DBSCAN density clustering — mockup for DHIS2-21461.
    // Runs client-side over all loaded Point features (needs the full point
    // set at once, unlike grid clustering's per-tile aggregation) and
    // groups each dense group of "core"/"edge" points into a cluster, each
    // assigned its own distinct color (cluster *identity* is the point of
    // DBSCAN, unlike grid clustering where only density/count matters).
    // Membership is computed once here and never revisited: eps is a
    // real-world distance in meters, not a pixel radius, so which points
    // belong together is a property of the data, not the current zoom —
    // recomputing it per zoom would contradict the whole premise of
    // density-based (as opposed to grid-based) clustering. "Noise" points
    // (events too sparse to join a cluster) are stored separately and
    // always render as individual events.
    setupDbscanClusters(data, { eps, minPoints }) {
        // Kept for the reveal-threshold check in shouldRevealDbscanClusters,
        // which needs the same eps every cluster was actually clustered with
        this.dbscanEps = eps

        const pointFeatures = data.filter(
            (feature) => feature.geometry?.type === 'Point'
        )

        this.dbscanNonPointFeatures = data.filter(
            (feature) => feature.geometry?.type !== 'Point'
        )

        if (!pointFeatures.length) {
            this.dbscanClusters = []
            this.dbscanNoiseFeatures = []
            this.dbscanHulls = []
            return
        }

        const clustered = clustersDbscan(
            {
                type: 'FeatureCollection',
                features: pointFeatures.map((feature) => ({
                    type: 'Feature',
                    geometry: feature.geometry,
                    properties: {},
                })),
            },
            eps,
            { units: 'meters', minPoints }
        )

        const groups = {}
        const noise = []

        clustered.features.forEach(({ properties }, index) => {
            const originalFeature = pointFeatures[index]

            if (properties.dbscan !== 'core' && properties.dbscan !== 'edge') {
                noise.push({
                    ...originalFeature,
                    properties: {
                        ...originalFeature.properties,
                        // Never leave this undefined: the {name} label
                        // template would otherwise render the literal
                        // string "undefined" for every noise point
                        name: originalFeature.properties.name ?? '',
                    },
                })
                return
            }

            const group = (groups[properties.cluster] =
                groups[properties.cluster] || [])
            group.push(originalFeature)
        })

        this.dbscanNoiseFeatures = noise
        const clusters = Object.values(groups).map((members, clusterIndex) => {
            const [lng, lat] = members
                .reduce(
                    ([sumLng, sumLat], feature) => [
                        sumLng + feature.geometry.coordinates[0],
                        sumLat + feature.geometry.coordinates[1],
                    ],
                    [0, 0]
                )
                .map((sum) => sum / members.length)
            const centroid = [lng, lat]

            return {
                id: `dbscan-cluster-${clusterIndex}`,
                // 1-based: a human-facing label (shown in the popup),
                // not the internal id string above
                clusterNumber: clusterIndex + 1,
                centroid,
                members,
                // How far this cluster's own members actually reach from
                // its centroid, in meters — used below to decide which
                // *other* clusters are close enough on the map to need a
                // different color, not just an on-screen pixel check
                // (which would depend on zoom)
                extentRadius: members.reduce(
                    (max, feature) =>
                        Math.max(
                            max,
                            approxDistanceMeters(
                                centroid,
                                feature.geometry.coordinates
                            )
                        ),
                    0
                ),
                radius: Math.min(
                    EVENT_DBSCAN_CLUSTER_MAX_RADIUS,
                    EVENT_DBSCAN_CLUSTER_MIN_RADIUS +
                        Math.sqrt(members.length) * 4
                ),
            }
        })

        // Greedy color assignment: give each cluster the first curated
        // color (see getClusterColor) not already used by any *nearby*
        // cluster processed so far, rather than a flat index%colors cycle
        // — which, with only a handful of colors, frequently landed two
        // adjacent clusters on the same color purely by coincidence of
        // their cluster index, unrelated to their actual position.
        // "Nearby" = footprints (extentRadius) overlapping plus a buffer,
        // so clusters merely close on the map, not just literally
        // touching, still get told apart.
        const neighborBuffer = eps * 3
        clusters.forEach((cluster, i) => {
            const usedByNeighbors = clusters
                .slice(0, i)
                .filter(
                    (other) =>
                        approxDistanceMeters(cluster.centroid, other.centroid) <
                        cluster.extentRadius +
                            other.extentRadius +
                            neighborBuffer
                )
                .map((other) => other.color)

            cluster.color = getClusterColor(i, usedByNeighbors)
        })

        this.dbscanClusters = clusters

        // A concave hull per cluster, showing its actual spatial extent —
        // rendered in its own layer (see the group layer built in
        // createLayer), not updated on zoom since the underlying geography
        // doesn't change. A convex hull would be simpler, but it fills in
        // concave notches of a chain-shaped cluster, visually enclosing
        // other, unrelated noise points that happen to fall in that gap —
        // maxEdge is tied to eps (the same real-world distance clusters
        // were actually built from) since a boundary edge longer than
        // that isn't really part of the cluster's own shape either — but
        // needs real slack above eps itself: two points can be in the same
        // cluster via a *chain* of eps-hops through other members while
        // sitting further than eps apart directly, and concave's Delaunay
        // triangulation drops (orphans outside the hull) any point whose
        // every edge exceeds maxEdge. Too tight and real members get
        // excluded; this is a pragmatic multiplier, not an exact bound.
        // Needs at least 3 non-collinear members to form a polygon at all;
        // clusters too small/degenerate for that just skip a hull, still
        // rendering normally otherwise.
        this.dbscanHulls = this.dbscanClusters.flatMap((cluster) => {
            if (cluster.members.length < 3) {
                return []
            }

            const hull = concave(
                {
                    type: 'FeatureCollection',
                    features: cluster.members.map((feature) => ({
                        type: 'Feature',
                        properties: {},
                        geometry: feature.geometry,
                    })),
                },
                {
                    maxEdge: (this.dbscanEps * 2.5) / 1000,
                    units: 'kilometers',
                }
            )

            if (!hull) {
                return []
            }

            // A tight maxEdge can split the hull into a MultiPolygon
            // (disconnected parts of the same cluster) — the polygon
            // layer only renders plain Polygon geometry, so each part
            // becomes its own feature, all sharing the cluster's color
            const polygons =
                hull.geometry.type === 'MultiPolygon'
                    ? hull.geometry.coordinates.map((coordinates) => ({
                          type: 'Polygon',
                          coordinates,
                      }))
                    : [hull.geometry]

            // Same identifying properties as the aggregate bubble (see
            // renderDbscanFeatures) so clicking a hull opens the same
            // cluster popup as clicking its bubble/points does
            return polygons.map((geometry) => ({
                type: 'Feature',
                geometry,
                properties: {
                    color: cluster.color,
                    isDbscanCluster: true,
                    dbscanCount: cluster.members.length,
                    clusterNumber: cluster.clusterNumber,
                },
            }))
        })
    }

    // Builds the layer's current feature set from the fixed cluster
    // membership computed in setupDbscanClusters. Every cluster renders as
    // either an aggregate bubble or its individual member points, in
    // lockstep — see shouldRevealDbscanClusters — tagged with that
    // cluster's own color so its identity stays visible even once
    // "unpacked".
    renderDbscanFeatures() {
        const mapGL = this.context.map.getMapGL()
        const reveal = this.shouldRevealDbscanClusters(mapGL)

        const clusterFeatures = (this.dbscanClusters || []).flatMap(
            (cluster) => {
                if (reveal) {
                    return cluster.members.map((feature) => ({
                        ...feature,
                        properties: {
                            ...feature.properties,
                            color: cluster.color,
                            name: feature.properties.name ?? '',
                        },
                    }))
                }

                return [
                    {
                        type: 'Feature',
                        id: cluster.id,
                        geometry: {
                            type: 'Point',
                            coordinates: cluster.centroid,
                        },
                        properties: {
                            isDbscanCluster: true,
                            dbscanCount: cluster.members.length,
                            clusterNumber: cluster.clusterNumber,
                            radius: cluster.radius,
                            color: cluster.color,
                            name: formatCount(cluster.members.length),
                        },
                    },
                ]
            }
        )

        return [
            ...(this.dbscanNonPointFeatures || []),
            ...(this.dbscanNoiseFeatures || []),
            ...clusterFeatures,
        ]
    }

    // Re-renders (not re-clusters) the DBSCAN layer after a zoom change —
    // see renderDbscanFeatures/shouldRevealDbscanClusters.
    updateDbscanFeatures() {
        if (!this.layer || !this.dbscanClusters) {
            return
        }

        const source = this.context.map
            .getMapGL()
            .getSource(this.dbscanEventsLayerId)

        if (source) {
            source.setData({
                type: 'FeatureCollection',
                features: this.renderDbscanFeatures(),
            })
        }
    }

    // One shared reveal/collapse decision for every cluster, based only on
    // the current zoom (via eps converted to on-screen pixels at the
    // map's current center), rather than each cluster's own member
    // spread — so all clusters switch between aggregate bubble and
    // individual points together, at the same zoom level, instead of
    // staggered by how spread out each one happens to be. eps is the same
    // real-world distance every cluster was actually built from, so
    // converting *that* to pixels is what makes this shared and consistent.
    shouldRevealDbscanClusters(mapGL) {
        const { lat } = mapGL.getCenter()
        const metersPerPixel =
            (156543.03392 * Math.cos((lat * Math.PI) / 180)) /
            Math.pow(2, mapGL.getZoom())
        const epsPixels = this.dbscanEps / metersPerPixel

        return epsPixels >= EVENT_DBSCAN_REVEAL_PIXEL_RADIUS
    }

    render() {
        const { styleDataItem, nameProperty, keyAnalysisDigitGroupSeparator } =
            this.props
        const { popup, displayItems, eventCoordinateFieldName } = this.state

        if (!popup) {
            return null
        }

        // DBSCAN cluster summary points aren't real events, so they can't be
        // looked up through the usual event popup's tracker/events query.
        if (popup.feature.properties.isDbscanCluster) {
            return (
                <Popup
                    coordinates={popup.coordinates}
                    onClose={this.onPopupClose}
                >
                    <table>
                        <tbody>
                            <tr>
                                <th>{i18n.t('Cluster')}</th>
                                <td>
                                    {popup.feature.properties.clusterNumber}
                                </td>
                            </tr>
                            <tr>
                                <th>{i18n.t('Events in cluster')}</th>
                                <td>{popup.feature.properties.dbscanCount}</td>
                            </tr>
                        </tbody>
                    </table>
                </Popup>
            )
        }

        return displayItems ? (
            <EventPopup
                {...popup}
                styleDataItem={styleDataItem}
                nameProperty={nameProperty}
                keyAnalysisDigitGroupSeparator={keyAnalysisDigitGroupSeparator}
                displayItems={displayItems}
                eventCoordinateFieldName={eventCoordinateFieldName}
                onClose={this.onPopupClose}
            />
        ) : null
    }

    onEventClick({ feature, coordinates }) {
        this.setState({ popup: { feature, coordinates } })
    }

    onPopupClose = () => {
        this.setState({ popup: null })
    }

    // Convert server cluster response to GeoJSON
    toGeoJson(data, geometryCentroid) {
        const header = {}
        const features = []

        // Convert headers to object for easier lookup
        data.headers.forEach((h, i) => (header[h.name] = i))

        if (Array.isArray(data.rows)) {
            data.rows.forEach((row) => {
                const extent = row[header.extent].match(/([-\d.]+)/g)
                const count = parseInt(row[header.count], 10)
                const clusterId = ++this.clusterCount
                const clusterGeometry = JSON.parse(row[header.center])

                features.push({
                    type: 'Feature',
                    id: clusterId,
                    geometry: geometryCentroid
                        ? getCentroid(clusterGeometry, CENTROID_FORMAT_GEOJSON)
                        : clusterGeometry,
                    properties: {
                        cluster: count > 1,
                        cluster_id: clusterId,
                        point_count: count,
                        point_count_abbreviated: formatCount(count),
                        bounds: [
                            [extent[0], extent[1]],
                            [extent[2], extent[3]],
                        ],
                        id: row[header.points],
                    },
                })
            })
        }

        return features
    }

    // Loads the data items for a program stage to display in popup
    async loadDisplayItems({
        engine,
        nameProperty,
        styleDataItem,
        program,
        programStage,
        eventCoordinateField,
    }) {
        const displayNameProp =
            nameProperty === 'name' ? 'displayName' : 'displayShortName'

        let displayItems = []

        const programStageResponse = await engine.query(
            EVENT_PROGRAM_STAGE_DATA_ELEMENTS_QUERY,
            {
                variables: {
                    id: programStage.id,
                    nameProperty: displayNameProp,
                },
            }
        )
        const programStageDataElements =
            programStageResponse?.programStage?.programStageDataElements

        if (Array.isArray(programStageDataElements)) {
            const filteredProgramStageItems = programStageDataElements
                .filter(
                    (d) =>
                        d.displayInReports ||
                        d.dataElement.id === styleDataItem?.id
                )
                .map((d) => d.dataElement)
            displayItems.push(...filteredProgramStageItems)

            await Promise.all(
                filteredProgramStageItems.map((d) =>
                    this.loadOptionSet(d, engine)
                )
            )
        }

        if (
            styleDataItem &&
            !displayItems.some((item) => item.id === styleDataItem.id)
        ) {
            const programResponse = await engine.query(
                EVENT_PROGRAM_ATTRIBUTES_QUERY,
                {
                    variables: {
                        id: program.id,
                        nameProperty: displayNameProp,
                    },
                }
            )
            const programTrackedEntityAttributes =
                programResponse?.program?.programTrackedEntityAttributes

            if (Array.isArray(programTrackedEntityAttributes)) {
                if (
                    styleDataItem &&
                    !displayItems.some((item) => item.id === styleDataItem.id)
                ) {
                    const filteredProgramItems = programTrackedEntityAttributes
                        .filter(
                            (d) =>
                                d.trackedEntityAttribute.id ===
                                styleDataItem?.id
                        )
                        .map((d) => d.trackedEntityAttribute)
                    displayItems.push(...filteredProgramItems)

                    await Promise.all(
                        filteredProgramItems.map((d) =>
                            this.loadOptionSet(d, engine)
                        )
                    )
                }
            }
        }

        if (styleDataItem) {
            // Put styleDataItem first in array
            displayItems = [
                ...displayItems.filter((d) => d.id === styleDataItem.id),
                ...displayItems.filter((d) => d.id !== styleDataItem.id),
            ]
        }

        const eventCoordinateFieldName = await loadEventCoordinateFieldName({
            program,
            programStage,
            eventCoordinateField,
            engine,
            displayNameProp,
        })

        this.setState({ displayItems, eventCoordinateFieldName })
    }

    // Loads an option set for an data element to get option names
    async loadOptionSet(dataElement, engine) {
        const { optionSet } = dataElement

        if (!optionSet || !optionSet.id) {
            return dataElement
        }

        if (optionSet && optionSet.id) {
            const { optionSet: fullOptionSet } = await engine.query(
                OPTION_SET_QUERY,
                {
                    variables: { id: optionSet.id },
                }
            )

            if (fullOptionSet && fullOptionSet.options) {
                dataElement.options = fullOptionSet.options.reduce(
                    (byId, option) => {
                        byId[option.code] = option.name
                        return byId
                    },
                    {}
                )
            }
        }
    }
}

export default EventLayer
