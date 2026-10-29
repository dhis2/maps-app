import { GEOJSON_LAYER } from '../../../constants/layers.js'
import { filterData } from '../../../util/filter.js'
import { getGeojsonFeatureProfile } from '../../../util/geojson.js'
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
            error,
        } = this.props

        const { map, isPlugin } = this.context

        if (error) {
            return
        }

        const filteredData = filterData(data, dataFilters)

        const style =
            Object.keys(featureStyle).length > 0
                ? { ...featureStyle, radius: featureStyle.pointSize }
                : {
                      ...config.featureStyle,
                      radius: config.featureStyle?.pointSize,
                  }

        this.layer = map.createLayer({
            type: GEOJSON_LAYER,
            id,
            index,
            opacity,
            isVisible,
            data: filteredData,
            style,
            onClick: isPlugin
                ? Function.prototype
                : this.onFeatureClick.bind(this),
            onRightClick: isPlugin
                ? undefined
                : this.onFeatureRightClick.bind(this),
            onMouseEnter: isPlugin
                ? undefined
                : this.onFeatureMouseEnter.bind(this),
            onMouseLeave: isPlugin
                ? undefined
                : this.onFeatureMouseLeave.bind(this),
        })

        map.addLayer(this.layer)
        this.setLayerVisibility()

        // Fit map to layer bounds once (when first created)
        this.fitBoundsOnce()
    }

    onFeatureClick(evt) {
        const { name, keyAnalysisDigitGroupSeparator } = this.props

        this.onFeatureLeftClick(evt)

        if (this.isMultiSelectClick(evt)) {
            return
        }

        const feature = this.props.data.find(
            (d) => d.properties.id === evt.feature.properties.id
        )

        this.props.setFeatureProfile(
            getGeojsonFeatureProfile(
                feature,
                name,
                keyAnalysisDigitGroupSeparator
            )
        )
    }
}

export default GeoJsonLayer
