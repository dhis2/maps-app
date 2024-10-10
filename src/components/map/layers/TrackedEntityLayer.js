import i18n from '@dhis2/d2-i18n'
import React from 'react'
import {
    TEI_COLOR,
    TEI_RADIUS,
    TEI_RELATIONSHIP_LINE_COLOR,
    TEI_RELATED_COLOR,
    TEI_RELATED_RADIUS,
} from '../../../constants/layers.js'
import { apiFetchWithBaseUrl } from '../../../util/api.js'
import { formatTime } from '../../../util/helpers.js'
import { BaseUrlShim } from '../../BaseUrlShim.js'
import Popup from '../Popup.js'
import Layer from './Layer.js'

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

const fetchTEI = async (id, fieldsString, baseUrl) => {
    const data = await apiFetchWithBaseUrl({
        url: `/tracker/trackedEntities/${id}?fields=${fieldsString}`,
        baseUrl,
    })
    return data
}

const geomToCentroid = (geometry) => {
    switch (geometry.type) {
        case 'Point':
            return geometry.coordinates
        case 'Polygon':
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
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: [fromGeom, toGeom],
        },
        properties: {},
    }
}
const makeRelationshipLayer = (relationships, color, weight) => {
    return {
        type: 'geoJson',
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
    }

    createLayer() {
        const {
            id,
            index,
            opacity,
            isVisible,
            data,
            relationships,
            secondaryData,
            eventPointColor,
            eventPointRadius,
            areaRadius,
            relatedPointColor,
            relatedPointRadius,
            relationshipLineColor,
        } = this.props

        const { map } = this.context
        const color = eventPointColor || TEI_COLOR
        const radius = eventPointRadius || TEI_RADIUS

        const config = {
            type: 'geoJson',
            data,
            style: {
                color,
                weight: 1,
                radius,
            },
            onClick: this.onEntityClick.bind(this),
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

        if (relationships) {
            const secondaryConfig = {
                type: 'geoJson',
                data: secondaryData,
                style: {
                    color: relatedPointColor || TEI_RELATED_COLOR,
                    weight: 1,
                    radius: relatedPointRadius || TEI_RELATED_RADIUS,
                },
                onClick: this.onEntityClick.bind(this),
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

    getPopup() {
        const { coordinates, data } = this.state.popup
        const { attributes = [], updatedAt } = data

        return (
            <Popup coordinates={coordinates} onClose={this.onPopupClose}>
                <table>
                    <tbody>
                        {attributes.map(({ name, value }) => (
                            <tr key={name}>
                                <th>{name}:</th>
                                <td>{value}</td>
                            </tr>
                        ))}
                        <tr>
                            <th>{i18n.t('Last updated')}:</th>
                            <td>{formatTime(updatedAt)}</td>
                        </tr>
                    </tbody>
                </table>
            </Popup>
        )
    }

    render() {
        return this.state.popup ? this.getPopup() : null
    }

    async onEntityClick(evt) {
        const { feature, coordinates } = evt

        const data = await fetchTEI(
            feature.properties.id,
            'updatedAt,attributes[displayName~rename(name),value],relationships',
            this.props.baseUrl
        )

        this.setState({ popup: { feature, coordinates, data } })
    }
}

const TrackedEntityLayerWithBaseUrl = (props) => (
    <BaseUrlShim>
        {({ baseUrl }) => <TrackedEntityLayer baseUrl={baseUrl} {...props} />}
    </BaseUrlShim>
)

export default TrackedEntityLayerWithBaseUrl
