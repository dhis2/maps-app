import { bbox } from '@turf/bbox'
import log from 'loglevel'
import PropTypes from 'prop-types'
import { PureComponent } from 'react'
import {
    RENDERING_STRATEGY_SPLIT_BY_PERIOD,
    PADDING_DEFAULT,
    DURATION_DEFAULT,
} from '../../../constants/layers.js'
import {
    SELECTION_FILTER_SELECTED,
    SELECTION_FILTER_NOT_SELECTED,
} from '../../../constants/selection.js'

export const idsEqual = (a, b) =>
    a.length === b.length && a.every((id, i) => id === b[i])

class Layer extends PureComponent {
    static contextTypes = {
        map: PropTypes.object,
        isPlugin: PropTypes.bool,
    }

    static propTypes = {
        id: PropTypes.string.isRequired,
        clickFeature: PropTypes.func,
        config: PropTypes.object,
        data: PropTypes.array,
        dataFilters: PropTypes.object,
        editCounter: PropTypes.number,
        externalPeriod: PropTypes.object, // eslint-disable-line react/no-unused-prop-types
        feature: PropTypes.object,
        highlightColor: PropTypes.string,
        highlightFeature: PropTypes.func,
        index: PropTypes.number,
        isVisible: PropTypes.bool,
        opacity: PropTypes.number,
        openContextMenu: PropTypes.func,
        selection: PropTypes.object,
        selectionFilter: PropTypes.array,
        toggleFeatureSelection: PropTypes.func,
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
        this.handleDataOrPeriodChange(prevProps, prevState)
        this.handleIndexChange(prevProps)
        this.handleOpacityChange(prevProps)
        this.handleVisibilityChange(prevProps)
        this.handleFeatureChange(prevProps)
        this.handleSelectionChange(prevProps)
        this.handleHighlightColorChange(prevProps)
        this.handleVisibleIdsChange(prevProps)
    }

    // Create new map if new id of editCounter is increased
    handleDataOrPeriodChange(prevProps, prevState = {}) {
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

    handleIndexChange(prevProps) {
        const { index } = this.props
        if (index !== undefined && index !== prevProps.index) {
            this.setLayerOrder()
        }
    }

    handleOpacityChange(prevProps) {
        if (this.props.opacity !== prevProps.opacity) {
            this.setLayerOpacity()
        }
    }

    handleVisibilityChange(prevProps) {
        if (this.props.isVisible !== prevProps.isVisible) {
            this.setLayerVisibility()
        }
    }

    handleFeatureChange(prevProps) {
        const { feature } = this.props
        if (feature === prevProps.feature) {
            return
        }

        this.handleFeatureUpdate(feature)

        if (this.getHoverId(prevProps.feature) !== this.getHoverId(feature)) {
            this.highlightFeature()
        }
    }

    handleSelectionChange(prevProps) {
        const { selection } = this.props
        if (
            selection !== prevProps.selection &&
            !idsEqual(
                this.getSelectedIds(prevProps.selection),
                this.getSelectedIds(selection)
            )
        ) {
            this.selectFeatures()
        }
    }

    handleHighlightColorChange(prevProps) {
        if (this.props.highlightColor === prevProps.highlightColor) {
            return
        }

        if (this.getHoverId()) {
            this.highlightFeature()
        }
        if (this.getSelectedIds().length) {
            this.selectFeatures()
        }
    }

    handleVisibleIdsChange(prevProps) {
        const { selection, selectionFilter } = this.props
        if (
            !idsEqual(
                this.getVisibleIds(
                    prevProps.selection,
                    prevProps.selectionFilter
                ) ?? [],
                this.getVisibleIds(selection, selectionFilter) ?? []
            )
        ) {
            this.updateVisibleIds()
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
        this.selectFeatures()
        this.updateVisibleIds()
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

    handleFeatureUpdate(feature) {
        if (feature?.zoom && feature?.layerId === this.props.id) {
            if (feature.ids?.length) {
                this.panToFeature(feature.ids)
            } else if (feature.id != null) {
                this.panToFeature(feature.id)
            } else {
                this.fitBounds()
            }
        }
    }

    getHoverId(feature = this.props.feature) {
        return feature?.layerId === this.props.id ? feature.id : null
    }

    getSelectedIds(selection = this.props.selection) {
        return selection?.layerId === this.props.id ? selection.ids : []
    }

    highlightFeature() {
        this.layer?.highlight?.(this.getHoverId(), this.props.highlightColor)
    }

    selectFeatures() {
        this.layer?.select?.(this.getSelectedIds(), this.props.highlightColor)
    }

    getVisibleIds(
        selection = this.props.selection,
        selectionFilter = this.props.selectionFilter
    ) {
        if (!selectionFilter?.length || selection?.layerId !== this.props.id) {
            return null
        }

        const wantSelected = selectionFilter.includes(SELECTION_FILTER_SELECTED)
        const wantNotSelected = selectionFilter.includes(
            SELECTION_FILTER_NOT_SELECTED
        )

        // Both (or neither, though that's already handled above) checked
        // means "show everything" - same as no filter at all.
        if (wantSelected === wantNotSelected) {
            return null
        }

        const selectedIds = this.getSelectedIds(selection)

        if (wantSelected) {
            return selectedIds
        }

        const selectedIdSet = new Set(selectedIds)
        return (this.props.data ?? [])
            .map((feature) => feature.properties?.id ?? feature.id)
            .filter((id) => id != null && !selectedIdSet.has(id))
    }

    updateVisibleIds() {
        this.layer?.setVisibleIds?.(this.getVisibleIds())
    }

    onFeatureLeftClick(evt) {
        const id = evt.feature?.properties?.id

        if (!id) {
            return
        }

        this.props.clickFeature?.({ id, layerId: this.props.id })

        if (this.isMultiSelectClick(evt)) {
            this.props.toggleFeatureSelection?.(id, this.props.id)
        }
    }

    isMultiSelectClick(evt) {
        return Boolean(evt.ctrlKey || evt.metaKey)
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

    panToFeature(featureIds) {
        if (!this.layer?.getFeaturesById) {
            return
        }
        const ids = Array.isArray(featureIds) ? featureIds : [featureIds]
        const features = ids
            .flatMap((id) => this.layer.getFeaturesById(id) ?? [])
            .filter((f) => f.geometry)
        if (!features.length) {
            return
        }

        const [minLng, minLat, maxLng, maxLat] = bbox({
            type: 'FeatureCollection',
            features,
        })

        if (!Number.isFinite(minLng)) {
            return
        }

        const { map } = this.context
        map.fitBounds(
            [
                [minLng, minLat],
                [maxLng, maxLat],
            ],
            {
                padding: PADDING_DEFAULT,
                duration: DURATION_DEFAULT,
                essential: true,
                maxZoom: 17,
            }
        )
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
        const id = evt.feature?.properties?.id

        if (id) {
            this.props.clickFeature?.({ id, layerId: this.props.id })
        }

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
