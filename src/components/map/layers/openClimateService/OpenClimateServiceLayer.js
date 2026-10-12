import Layer from '../Layer.js'
import ZarrLayer from './ZarrLayer.js'

export default class OpenClimateServiceLayer extends Layer {
    createLayer() {
        const { id, index, opacity, isVisible, render } = this.props
        const { map } = this.context

        // Not loaded, or the dataset is not available
        if (!render) {
            return
        }

        this.layer = new ZarrLayer({
            id,
            index,
            opacity,
            isVisible,
            render,
            onError: this.onError.bind(this),
        })

        map.addLayer(this.layer)

        this.fitBoundsOnce()
    }

    setLayerVisibility() {
        this.layer?.setVisibility(this.props.isVisible)
    }

    setLayerOpacity() {
        this.layer?.setOpacity(this.props.opacity)
    }
}
