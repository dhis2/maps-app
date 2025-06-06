import { Analytics } from '@dhis2/analytics'
import React from 'react'
import { EVENT_COLOR, EVENT_RADIUS } from '../../../constants/layers.js'
import { getContrastColor } from '../../../util/colors.js'
import { loadEventCoordinateFieldName } from '../../../util/coordinatesName.js'
import {
    getAnalyticsRequest,
    EVENT_PROGRAM_STAGE_DATA_ELEMENTS_QUERY,
    EVENT_PROGRAM_ATTRIBUTES_QUERY,
} from '../../../util/event.js'
import { filterData } from '../../../util/filter.js'
import { formatCount } from '../../../util/numbers.js'
import { OPTION_SET_QUERY } from '../../../util/requests.js'
import EventPopup from './EventPopup.js'
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
            eventCoordinateField,
            eventPointColor,
            eventPointRadius,
            nameProperty,
            program,
            programStage,
            serverCluster,
            areaRadius,
            styleDataItem,
            legend,
            dataFilters,
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
        let eventRequest

        // Default props = no cluster
        const config = {
            type: 'events',
            id,
            index,
            opacity,
            isVisible,
            data: filteredData,
            fillColor,
            strokeColor,
            countColor,
            radius,
            onClick: this.onEventClick.bind(this),
        }

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

                    callback(params.tileId, this.toGeoJson(clusterData))
                }
            } else {
                config.clusterPane = id

                if (styleDataItem && legend) {
                    config.type = 'donutCluster'
                    config.groups = legend.items
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

        // Fit map to layer bounds once (when first created)
        this.fitBoundsOnce()
    }

    render() {
        const { styleDataItem, nameProperty } = this.props
        const { popup, displayItems, eventCoordinateFieldName } = this.state

        return popup && displayItems ? (
            <EventPopup
                {...popup}
                styleDataItem={styleDataItem}
                nameProperty={nameProperty}
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
    toGeoJson(data) {
        const header = {}
        const features = []

        // Convert headers to object for easier lookup
        data.headers.forEach((h, i) => (header[h.name] = i))

        if (Array.isArray(data.rows)) {
            data.rows.forEach((row) => {
                const extent = row[header.extent].match(/([-\d.]+)/g)
                const count = parseInt(row[header.count], 10)
                const clusterId = ++this.clusterCount

                features.push({
                    type: 'Feature',
                    id: clusterId,
                    geometry: JSON.parse(row[header.center]),
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

            for (const d of filteredProgramStageItems) {
                await this.loadOptionSet(d, engine)
            }
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

                    for (const d of filteredProgramItems) {
                        await this.loadOptionSet(d, engine)
                    }
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
