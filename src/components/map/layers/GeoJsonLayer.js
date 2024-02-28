import React from 'react'
import { GEOJSON_LAYER } from '../../../constants/layers.js'
import { filterData } from '../../../util/filter.js'
import { getFeatureTypeAndRounding } from '../../../util/geojson.js'
import Popup from '../Popup.js'
import Layer from './Layer.js'

class GeoJsonLayer extends Layer {
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
            dataFilters,
            featureStyle,
            config,
        } = this.props

        const { map } = this.context

        const filteredData = filterData(data, dataFilters)

        const style =
            Object.keys(featureStyle).length > 0
                ? featureStyle
                : config.featureStyle

        this.layer = map.createLayer({
            type: GEOJSON_LAYER,
            id,
            index,
            opacity,
            isVisible,
            data: filteredData,
            style,
            onClick: this.onFeatureClick.bind(this),
        })

        map.addLayer(this.layer)

        // Fit map to layer bounds once (when first created)
        this.fitBoundsOnce()
    }

    onFeatureClick(evt) {
        const featureProperties = this.props.data.find(
            (d) => d.id === evt.feature.id
        )?.properties

        const feature = getFeatureTypeAndRounding(
            featureProperties,
            this.props.data.map((d) => d.properties)
        ).reduce((acc, { name, value }) => {
            acc[name] = value
            return acc
        }, {})

        this.setState({
            popup: {
                coordinates: evt.coordinates,
                feature,
            },
        })
    }

    getPopup() {
        const { coordinates, feature } = this.state.popup

        // get the id property and 3 other properties from the feature object
        const { id, ...rest } = feature
        const firstThreeKeys = Object.keys(rest).slice(0, 3)
        const firstThreeProperties = firstThreeKeys.reduce((obj, key) => {
            obj[key] = rest[key]
            return obj
        }, {})
        const viewProperties = { id, ...firstThreeProperties }

        return (
            <Popup
                coordinates={coordinates}
                onClose={this.onPopupClose}
                className="dhis2-map-popup-geojson"
                data={feature}
                name={this.props.name}
            >
                <em>{this.props.name}</em>
                {Object.entries(viewProperties).map(([key, value]) => (
                    <div key={key}>
                        {key}: {value}
                    </div>
                ))}
            </Popup>
        )
    }

    render() {
        return this.state.popup ? this.getPopup() : null
    }
}

export default GeoJsonLayer
