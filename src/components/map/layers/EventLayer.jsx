import { Analytics } from '@dhis2/analytics'
import i18n from '@dhis2/d2-i18n'
import { clustersDbscan } from '@turf/clusters-dbscan'
import React from 'react'
import {
    EVENT_COLOR,
    EVENT_RADIUS,
    EVENT_DBSCAN_EPS_DEFAULT,
    EVENT_DBSCAN_MIN_POINTS_DEFAULT,
    EVENT_DBSCAN_CLUSTER_COLOR,
    EVENT_DBSCAN_CLUSTER_MIN_RADIUS,
    EVENT_DBSCAN_CLUSTER_MAX_RADIUS,
    LABEL_TEMPLATE_NAME_ONLY,
    LABEL_TEMPLATE_TOOLTIP_ONLY,
} from '../../../constants/layers.js'
import { getContrastColor } from '../../../util/colors.js'
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

        const fillColor = color || EVENT_COLOR
        const strokeColor = !styleDataItem
            ? getContrastColor(fillColor)
            : undefined
        const countColor = strokeColor
        const radius = eventPointRadius || EVENT_RADIUS

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
            config.data = this.buildDbscanFeatures(labeledData, {
                eps: dbscanEps || EVENT_DBSCAN_EPS_DEFAULT,
                minPoints: dbscanMinPoints || EVENT_DBSCAN_MIN_POINTS_DEFAULT,
            })
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

        // Create and add event layer based on config object
        this.layer = map.createLayer(config)

        map.addLayer(this.layer)
        this.setLayerVisibility()

        // Fit map to layer bounds once (when first created)
        this.fitBoundsOnce()
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
    // replaces each dense group of "core"/"edge" points with one synthetic
    // summary feature, sized and labeled by member count. "Noise" points
    // (events too sparse to join a cluster) pass through unchanged, so they
    // keep rendering — and remain clickable — as regular individual events.
    buildDbscanFeatures(data, { eps, minPoints }) {
        const pointFeatures = data.filter(
            (feature) => feature.geometry?.type === 'Point'
        )

        if (!pointFeatures.length) {
            return data
        }

        const nonPointFeatures = data.filter(
            (feature) => feature.geometry?.type !== 'Point'
        )

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

        const clusterGroups = {}
        const output = [...nonPointFeatures]

        clustered.features.forEach(({ properties }, index) => {
            const originalFeature = pointFeatures[index]

            if (properties.dbscan !== 'core' && properties.dbscan !== 'edge') {
                output.push(originalFeature)
                return
            }

            const group = (clusterGroups[properties.cluster] =
                clusterGroups[properties.cluster] || [])
            group.push(originalFeature)
        })

        Object.values(clusterGroups).forEach((members, clusterIndex) => {
            const [lng, lat] = members
                .reduce(
                    ([sumLng, sumLat], feature) => [
                        sumLng + feature.geometry.coordinates[0],
                        sumLat + feature.geometry.coordinates[1],
                    ],
                    [0, 0]
                )
                .map((sum) => sum / members.length)

            output.push({
                type: 'Feature',
                id: `dbscan-cluster-${clusterIndex}`,
                geometry: { type: 'Point', coordinates: [lng, lat] },
                properties: {
                    isDbscanCluster: true,
                    dbscanCount: members.length,
                    radius: Math.min(
                        EVENT_DBSCAN_CLUSTER_MAX_RADIUS,
                        EVENT_DBSCAN_CLUSTER_MIN_RADIUS +
                            Math.sqrt(members.length) * 4
                    ),
                    color: EVENT_DBSCAN_CLUSTER_COLOR,
                    name: formatCount(members.length),
                },
            })
        })

        return output
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
                <Popup coordinates={popup.coordinates} onClose={this.onPopupClose}>
                    <table>
                        <tbody>
                            <tr>
                                <th>{i18n.t('Events in cluster')}</th>
                                <td>
                                    {popup.feature.properties.dbscanCount}
                                </td>
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
