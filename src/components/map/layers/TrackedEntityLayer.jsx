import React from 'react'
import {
    TEI_COLOR,
    TEI_RADIUS,
    TEI_RELATIONSHIP_LINE_COLOR,
    TEI_RELATED_COLOR,
    TEI_RELATED_RADIUS,
    GEOJSON_LAYER,
} from '../../../constants/layers.js'
import {
    GEO_TYPE_POINT,
    GEO_TYPE_POLYGON,
    GEO_TYPE_LINE,
    GEO_TYPE_FEATURE,
} from '../../../util/geojson.js'
import { OPTION_SET_QUERY } from '../../../util/requests.js'
import {
    TRACKED_ENTITY_TRACKED_ENTITY_TYPE_ATTRIBUTES_QUERY,
    TRACKED_ENTITY_PROGRAM_TRACKED_ENTITY_ATTRIBUTES_QUERY,
} from '../../../util/trackedEntity.js'
import Layer from './Layer.js'
import TrackedEntityPopup from './TrackedEntityPopup.jsx'

const getCentroid = (points) => {
    const totals = points.reduce(
        (accum, point) => {
            accum[0] += point[0]
            accum[1] += point[1]
            return accum
        },
        [0, 0]
    )
    return [totals[0] / points.length, totals[1] / points.length]
}

const geomToCentroid = (geometry) => {
    switch (geometry.type) {
        case GEO_TYPE_POINT:
            return geometry.coordinates
        case GEO_TYPE_POLYGON:
            // TODO: Support multipolygon / use turf
            return getCentroid(geometry.coordinates[0])
        default:
            return null
    }
}

const makeRelationshipGeometry = ({ from, to }) => {
    const fromGeom = geomToCentroid(from.geometry)
    const toGeom = geomToCentroid(to.geometry)
    if (!fromGeom || !toGeom) {
        // console.error('Invalid relationship geometries', from, to);
        return null
    }
    return {
        type: GEO_TYPE_FEATURE,
        geometry: {
            type: GEO_TYPE_LINE,
            coordinates: [fromGeom, toGeom],
        },
        properties: {},
    }
}
const makeRelationshipLayer = (relationships, color, weight) => {
    return {
        type: GEOJSON_LAYER,
        data: relationships.map(makeRelationshipGeometry).filter((x) => !!x),
        style: {
            color,
            weight,
        },
    }
}

class TrackedEntityLayer extends Layer {
    state = {
        popup: null,
        displayAttributes: null,
        trackedEntityCoordinateFieldName: null,
    }

    createLayer() {
        const {
            id,
            index,
            opacity,
            isVisible,
            data,
            engine,
            relationships,
            secondaryData,
            eventPointColor,
            eventPointRadius,
            nameProperty,
            areaRadius,
            relatedPointColor,
            relatedPointRadius,
            relationshipLineColor,
        } = this.props

        const { map } = this.context
        const color = eventPointColor || TEI_COLOR
        const radius = eventPointRadius || TEI_RADIUS

        const config = {
            type: GEOJSON_LAYER,
            data,
            style: {
                color,
                weight: 1,
                radius,
            },
            onClick: this.onEventClick.bind(this),
        }

        if (areaRadius) {
            config.buffer = areaRadius
            config.bufferStyle = {
                color,
                weight: 1,
                opacity: 0.2,
                fillOpacity: 0.1,
            }
        }

        // Create and add layer based on config object
        const group = map.createLayer({
            type: 'group',
            id,
            index,
            opacity,
            isVisible,
        })

        this.loadDisplayAttributes(engine, nameProperty)

        if (relationships) {
            const secondaryConfig = {
                type: GEOJSON_LAYER,
                data: secondaryData,
                style: {
                    color: relatedPointColor || TEI_RELATED_COLOR,
                    weight: 1,
                    radius: relatedPointRadius || TEI_RELATED_RADIUS,
                },
                onClick: this.onEventClickSecondary.bind(this),
            }

            const relationshipConfig = makeRelationshipLayer(
                relationships,
                relationshipLineColor || TEI_RELATIONSHIP_LINE_COLOR,
                1
            )

            group.addLayer(relationshipConfig)
            group.addLayer(secondaryConfig)
        }
        group.addLayer(config)

        this.layer = group
        map.addLayer(this.layer)

        // Fit map to layer bounds once (when first created)
        this.fitBoundsOnce()
    }

    render() {
        const { program, nameProperty } = this.props
        const { popup, displayAttributes } = this.state

        return popup ? (
            <TrackedEntityPopup
                {...popup}
                program={program}
                nameProperty={nameProperty}
                displayAttributes={displayAttributes || []}
                onClose={this.onPopupClose}
            />
        ) : null
    }

    onEventClick({ feature, coordinates }) {
        this.setState({
            popup: { feature, coordinates, activeDataSource: 'primary' },
        })
    }
    onEventClickSecondary({ feature, coordinates }) {
        this.setState({
            popup: { feature, coordinates, activeDataSource: 'secondary' },
        })
    }

    async loadDisplayAttributes(engine, nameProperty) {
        const { trackedEntityType, program } = this.props
        // Get relationshipType object from loader if we want to retrieve attributes from secondary dataset

        const displayNameProp =
            nameProperty === 'name' ? 'displayName' : 'displayShortName'

        const { trackedEntityType: data } = await engine.query(
            TRACKED_ENTITY_TRACKED_ENTITY_TYPE_ATTRIBUTES_QUERY,
            {
                variables: {
                    id: trackedEntityType.id,
                    nameProperty: displayNameProp,
                },
            }
        )
        let { trackedEntityTypeAttributes: trackedEntityAttributes } = data

        if (program) {
            const { program: data } = await engine.query(
                TRACKED_ENTITY_PROGRAM_TRACKED_ENTITY_ATTRIBUTES_QUERY,
                {
                    variables: {
                        id: program.id,
                        nameProperty: displayNameProp,
                    },
                }
            )
            const { programTrackedEntityAttributes } = data

            trackedEntityAttributes = [
                ...trackedEntityAttributes,
                ...programTrackedEntityAttributes.filter(
                    (attr1) =>
                        !trackedEntityAttributes.some(
                            (attr2) =>
                                attr1.trackedEntityAttribute.id ===
                                attr2.trackedEntityAttribute.id
                        )
                ),
            ]
        }

        let displayAttributes = []
        // let trackedEntityCoordinateFieldName when we support associated geometry

        if (Array.isArray(trackedEntityAttributes)) {
            displayAttributes = trackedEntityAttributes
                .filter((a) => a.displayInList)
                .map((a) => a.trackedEntityAttribute)

            for (const a of displayAttributes) {
                await this.loadOptionSet(a, engine)
            }
        }

        this.setState({ displayAttributes })
    }

    // Loads an option set for an attribute to get option names
    async loadOptionSet(attribute, engine) {
        const { optionSet } = attribute

        if (!optionSet || !optionSet.id) {
            return attribute
        }

        if (optionSet && optionSet.id) {
            const { optionSet: fullOptionSet } = await engine.query(
                OPTION_SET_QUERY,
                {
                    variables: { id: optionSet.id },
                }
            )

            if (fullOptionSet && fullOptionSet.options) {
                attribute.options = fullOptionSet.options.reduce(
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

export default TrackedEntityLayer
