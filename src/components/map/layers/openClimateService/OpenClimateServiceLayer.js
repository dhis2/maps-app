import Layer from '../Layer.js'
import VectorTileLayer from './VectorTileLayer.js'
import ZarrLayer from './ZarrLayer.js'

export default class OpenClimateServiceLayer extends Layer {
    createLayer() {
        const { id, index, opacity, isVisible, render } = this.props
        const { map, isPlugin } = this.context

        // Not loaded, or the dataset is not available
        if (!render) {
            return
        }

        const options = { id, index, opacity, isVisible, render }

        this.layer =
            render.kind === 'vector'
                ? new VectorTileLayer({
                      ...options,
                      onClick: isPlugin
                          ? Function.prototype
                          : this.onFeatureClick.bind(this),
                  })
                : new ZarrLayer({
                      ...options,
                      onError: this.onError.bind(this),
                  })

        map.addLayer(this.layer)

        this.fitBoundsOnce()
    }

    // A clicked feature's attributes, in the side panel
    onFeatureClick(evt) {
        const { properties = {} } = evt.feature
        this.props.setFeatureProfile({
            name: properties.name || this.props.name,
            data: properties,
        })
    }

    setLayerVisibility() {
        this.layer?.setVisibility(this.props.isVisible)
    }

    setLayerOpacity() {
        this.layer?.setOpacity(this.props.opacity)
    }
}
