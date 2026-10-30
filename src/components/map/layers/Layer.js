import log from 'loglevel'
import PropTypes from 'prop-types'
import { PureComponent } from 'react'
import {
    RENDERING_STRATEGY_SPLIT_BY_PERIOD,
    PADDING_DEFAULT,
    DURATION_DEFAULT,
} from '../../../constants/layers.js'
import { getFeaturesBounds, getZoomTarget } from '../../../util/zoom.js'

class Layer extends PureComponent {
    static contextTypes = {
        map: PropTypes.object,
        isPlugin: PropTypes.bool,
    }

    static propTypes = {
        id: PropTypes.string.isRequired,
        config: PropTypes.object,
        data: PropTypes.array,
        dataFilters: PropTypes.object,
        editCounter: PropTypes.number,
        externalPeriod: PropTypes.object, // eslint-disable-line react/no-unused-prop-types
        feature: PropTypes.object,
        highlightFeature: PropTypes.func,
        index: PropTypes.number,
        isVisible: PropTypes.bool,
        opacity: PropTypes.number,
        openContextMenu: PropTypes.func,
    }

    static defaultProps = {
        opacity: 1,
        isVisible: true,
    }

    state = {}

    constructor(...args) {
        super(...args)
        this.setPeriod()
        this.createLayer()
    }

    componentDidUpdate(prevProps, prevState = {}) {
        this.syncDefinition(prevProps, prevState)
        this.syncOrder(prevProps)
        this.syncOpacity(prevProps)
        this.syncVisibility(prevProps)
        this.syncFocusedFeature(prevProps)
    }

    syncDefinition(prevProps, prevState = {}) {
        const { id, data, dataFilters, editCounter } = this.props
        const { period } = this.state
        const { period: prevPeriod } = prevState || {}
        const isEdited = editCounter !== prevProps.editCounter

        if (
            id === prevProps.id &&
            data === prevProps.data &&
            period?.id === prevPeriod?.id &&
            dataFilters === prevProps.dataFilters &&
            !isEdited
        ) {
            return
        }

        // Reset period if edited
        if (isEdited) {
            this.setPeriod(this.updateLayer.bind(this))
        } else {
            this.updateLayer(dataFilters !== prevProps.dataFilters)
        }
    }

    syncOrder(prevProps) {
        const { index } = this.props
        if (index !== undefined && index !== prevProps.index) {
            this.setLayerOrder()
        }
    }

    syncOpacity(prevProps) {
        if (this.props.opacity !== prevProps.opacity) {
            this.setLayerOpacity()
        }
    }

    syncVisibility(prevProps) {
        if (this.props.isVisible !== prevProps.isVisible) {
            this.setLayerVisibility()
        }
    }

    syncFocusedFeature(prevProps) {
        const { feature } = this.props
        if (feature === prevProps.feature) {
            return
        }

        this.zoomToFocusedFeature(feature)

        if (this.getHoverId(prevProps.feature) !== this.getHoverId(feature)) {
            this.highlightFeature()
        }
    }

    componentWillUnmount() {
        this.removeLayer()
    }

    // Create new layer from config object (override in subclasses)
    async createLayer() {
        const { id, index = 0, config, opacity, isVisible } = this.props
        const { map } = this.context

        this.layer = map.createLayer({
            ...config,
            id,
            index,
            opacity,
            isVisible,
        })

        await map.addLayer(this.layer)
        this.setLayerVisibility()
    }

    async updateLayer() {
        await this.removeLayer()
        await this.createLayer(true)
        this.setLayerOrder()
        this.setLayerVisibility()
        this.highlightFeature()
    }

    // Override in subclass if needed
    setPeriod(callback) {
        if (callback) {
            callback()
        }
    }

    setLayerVisibility() {
        this.layer.setVisibility(this.props.isVisible)
    }

    setLayerOpacity() {
        this.layer.setOpacity(this.props.opacity)
    }

    setLayerOrder() {
        if (this.layer) {
            this.layer.setIndex(this.props.index)
        }
    }

    // Fit map to layer bounds
    fitBounds(options = {}) {
        const { map } = this.context
        const {
            fitToAllLayers = false,
            padding = {},
            duration = DURATION_DEFAULT,
        } = options

        if (this.layer.getBounds) {
            map.fitBounds(
                fitToAllLayers ? map.getLayersBounds() : this.layer.getBounds(),
                {
                    padding: { ...PADDING_DEFAULT, ...padding },
                    duration: duration,
                    essential: true,
                    bearing: map.getMapGL().getBearing(),
                }
            )
        }
    }

    // Fit map to layer bounds once (when first created)
    fitBoundsOnce(options) {
        if (!this.isZoomed || this.context.map.getZoom() === undefined) {
            this.fitBounds({
                ...options,
                fitToAllLayers: !this.props.editCounter,
            })
            this.isZoomed = true
        }
    }

    async removeLayer() {
        if (this.layer) {
            const { map } = this.context

            this.layer.off('contextmenu', this.onFeatureRightClick, this)

            await map.removeLayer(this.layer)

            delete this.layer
        }
    }

    zoomToFocusedFeature(feature) {
        const target = getZoomTarget(feature, this.props.id)
        if (target?.layer) {
            this.fitBounds()
        } else if (target) {
            this.panToFeature(target.ids)
        }
    }

    getHoverId(feature = this.props.feature) {
        return feature?.layerId === this.props.id ? feature.id : null
    }

    highlightFeature() {
        this.layer?.highlight?.(this.getHoverId())
    }

    onFeatureMouseEnter(evt) {
        const id = evt.feature?.properties?.id

        if (id) {
            this.props.highlightFeature?.({
                id,
                layerId: this.props.id,
                origin: 'map',
            })
        }
    }

    onFeatureMouseLeave() {
        this.props.highlightFeature?.(null)
    }

    panToFeature(ids) {
        if (!this.layer?.getFeaturesById) {
            return
        }
        const bounds = getFeaturesBounds(
            ids.flatMap((id) => this.layer.getFeaturesById(id) ?? [])
        )
        if (!bounds) {
            return
        }

        this.context.map.fitBounds(bounds, {
            padding: PADDING_DEFAULT,
            duration: DURATION_DEFAULT,
            essential: true,
            maxZoom: 17,
        })
    }

    render() {
        return null
    }

    onFeatureRightClick(evt) {
        const [x, y] = evt.position
        const layerConfig = { ...this.props }
        const { id: layerId, layer: layerType, renderingStrategy } = layerConfig
        const { map } = this.context
        const container = map.getContainer()
        const { left, top } = container.getBoundingClientRect()
        const isSplitView =
            renderingStrategy === RENDERING_STRATEGY_SPLIT_BY_PERIOD

        this.props.openContextMenu({
            ...evt,
            position: [x, y],
            offset: [left, top],
            layerConfig,
            layerId,
            layerType,
            isSplitView,
            map,
            container: isSplitView
                ? container.parentNode.parentNode
                : container,
        })

        this.setState({ popup: null })
    }

    // Called when a map popup is closed
    onPopupClose = () => {
        this.setState({ popup: null })
    }

    onError(error) {
        const message = error.message || error

        if (!this.context.isPlugin) {
            this.setState({ error: message })
        } else {
            log.error(message)
        }
    }

    onErrorHidden() {
        this.setState({ error: null })
    }
}

export default Layer
