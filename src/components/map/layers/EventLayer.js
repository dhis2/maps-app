import { D2Shim } from '@dhis2/app-runtime-adapter-d2'
import React from 'react'
import { EVENT_COLOR, EVENT_RADIUS } from '../../../constants/layers.js'
import { getContrastColor } from '../../../util/colors.js'
import { getAnalyticsRequest } from '../../../util/event.js'
import { filterData } from '../../../util/filter.js'
import { formatCount } from '../../../util/numbers.js'
import { UserSettingsCtx } from '../../UserSettingsProvider.js'
import EventPopup from './EventPopup.js'
import Layer from './Layer.js'

class EventLayer extends Layer {
    clusterCount = 0

    state = {
        popup: null,
        dataElements: null,
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
            eventClustering,
            eventPointColor,
            eventPointRadius,
            program,
            programStage,
            serverCluster,
            areaRadius,
            styleDataItem,
            legend,
            dataFilters,
            d2,
        } = this.props

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

        // Data elements to display in event popup
        this.displayElements = {}

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
                            d2,
                            nameProperty:
                                d2.currentUser.settings
                                    .keyAnalysisDisplayProperty,
                        }))

                    eventRequest = eventRequest
                        .withBbox(params.bbox)
                        .withClusterSize(params.clusterSize)
                        .withIncludeClusterPoints(params.includeClusterPoints)

                    const clusterData = await d2.analytics.events.getCluster(
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
            this.loadDisplayElements()
        }

        // Create and add event layer based on config object
        this.layer = map.createLayer(config)

        map.addLayer(this.layer)

        // Fit map to layer bounds once (when first created)
        this.fitBoundsOnce()
    }

    render() {
        const { styleDataItem } = this.props
        const { popup, displayElements, eventCoordinateFieldName } = this.state

        return popup && displayElements ? (
            <EventPopup
                {...popup}
                styleDataItem={styleDataItem}
                displayElements={displayElements}
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

    // Loads the data elements for a program stage to display in popup
    async loadDisplayElements() {
        const { programStage, eventCoordinateField, settings, d2 } = this.props

        const data = await d2.models.programStage.get(programStage.id, {
            fields: `programStageDataElements[displayInReports,dataElement[id,${settings.nameProperty}~rename(name),optionSet,valueType]]`,
            paging: false,
        })
        const { programStageDataElements } = data
        let displayElements = []
        let eventCoordinateFieldName

        if (Array.isArray(programStageDataElements)) {
            displayElements = programStageDataElements
                .filter((d) => d.displayInReports)
                .map((d) => d.dataElement)

            for (const d of displayElements) {
                await this.loadOptionSet(d)
            }

            if (eventCoordinateField) {
                const coordElement = programStageDataElements.find(
                    (d) => d.dataElement.id === eventCoordinateField
                )

                if (coordElement) {
                    eventCoordinateFieldName = coordElement.dataElement.name
                }
            }
        }

        this.setState({ displayElements, eventCoordinateFieldName })
    }

    // Loads an option set for an data element to get option names
    async loadOptionSet(dataElement) {
        const { optionSet } = dataElement

        if (!optionSet || !optionSet.id) {
            return dataElement
        }

        if (optionSet && optionSet.id) {
            const fullOptionSet = await this.props.d2.models.optionSets.get(
                optionSet.id,
                {
                    fields: 'id,displayName~rename(name),options[code,displayName~rename(name)]',
                    paging: false,
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

const EventLayerWithUserSettingsAndD2 = (props) => (
    <D2Shim>
        {({ d2 }) => {
            return (
                <UserSettingsCtx.Consumer>
                    {(settings) => (
                        <EventLayer settings={settings} d2={d2} {...props} />
                    )}
                </UserSettingsCtx.Consumer>
            )
        }}
    </D2Shim>
)

export default EventLayerWithUserSettingsAndD2
