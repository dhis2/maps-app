import { connect } from 'react-redux' // TODO: not available in plugin
import { setFeatureProfile } from '../../../actions/feature.js' // TODO: not available in plugin
import { GEOJSON_LAYER } from '../../../constants/layers.js'
import { filterData } from '../../../util/filter.js'
import { getFeatureTypeAndRounding } from '../../../util/geojson.js'
import Layer from './Layer.js'

class GeoJsonLayer extends Layer {
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

        const data = getFeatureTypeAndRounding(
            featureProperties,
            this.props.data.map((d) => d.properties)
        ).reduce((acc, { name, value }) => {
            acc[name] = value
            return acc
        }, {})

        this.props.setFeatureProfile({
            name: this.props.name,
            data,
        })
    }
}

export default connect(null, {
    setFeatureProfile,
})(GeoJsonLayer)
