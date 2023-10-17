import { connect } from 'react-redux' // TODO: not available in plugin
import Layer from './Layer'
import { filterData } from '../../../util/filter'
import { setFeatureProfile } from '../../../actions/feature' // TODO: not available in plugin
import { GEOJSON_LAYER } from '../../../constants/layers'

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
        } = this.props
        const { map } = this.context

        const filteredData = filterData(data, dataFilters)

        this.layer = map.createLayer({
            type: GEOJSON_LAYER,
            id,
            index,
            opacity,
            isVisible,
            data: filteredData,
            // style: featureStyle,
            style: {
                color: 'transparent',
                strokeColor: '#333',
            },
            onClick: this.onFeatureClick.bind(this),
        })

        map.addLayer(this.layer)

        // Fit map to layer bounds once (when first created)
        this.fitBoundsOnce()
    }

    onFeatureClick(evt) {
        const { name, fields } = this.props

        this.props.setFeatureProfile({
            // name,
            // fields,
            data: evt.feature.properties,
        })
    }
}

export default connect(null, {
    setFeatureProfile,
})(GeoJsonLayer)
