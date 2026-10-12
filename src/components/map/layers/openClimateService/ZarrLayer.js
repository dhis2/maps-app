import { getColormap } from '../../../../util/openClimateService.js'

// Renders a GeoZarr store with @carbonplan/zarr-layer (a MapLibre custom layer).
// Implements the layer interface that the maps-gl map expects (addTo, removeFrom,
// move, setIndex, ...), as maps-gl does not have a Zarr layer type.
// TODO: Move to maps-gl as a layer type
class ZarrLayer {
    constructor(options) {
        this.options = options
        this._id = options.id
        this._isVisible = options.isVisible !== false
        this._isLoading = true
    }

    async addTo(map) {
        const { render, opacity = 1 } = this.options
        this._map = map

        // Load on demand, only needed when a map has a Zarr layer
        const { ZarrLayer: ZarrCustomLayer } = await import(
            '@carbonplan/zarr-layer'
        )

        // Removed while loading
        if (this._map !== map) {
            return
        }

        this._layer = new ZarrCustomLayer({
            id: this._id,
            source: render.source,
            variable: render.variable,
            clim: [render.min, render.max],
            colormap: getColormap(render.colormapName),
            opacity: this._isVisible ? opacity : 0,
            // Select a slice by index, not by coordinate value
            selector: Object.fromEntries(
                Object.entries(render.selector).map(([key, index]) => [
                    key,
                    { selected: index, type: 'index' },
                ])
            ),
            crs: render.crs,
            ...(render.zarrVersion !== null && {
                zarrVersion: render.zarrVersion,
            }),
            ...(render.fillValue !== null && { fillValue: render.fillValue }),
            ...(render.proj4 !== null && { proj4: render.proj4 }),
            onLoadingStateChange: this.onLoadingStateChange,
        })

        if (map.styleIsLoaded()) {
            map.getMapGL().addLayer(this._layer, map.getBeforeLayerId())
        }
    }

    removeFrom(map) {
        const mapgl = map.getMapGL()

        if (mapgl?.getLayer(this._id)) {
            mapgl.removeLayer(this._id)
        }

        this._layer = null
        this._map = null
    }

    // Keep the map from being marked as rendered while chunks are loading
    onLoadingStateChange = ({ loading, error }) => {
        this._isLoading = loading

        if (error && this.options.onError) {
            this.options.onError(error)
        }

        if (!loading) {
            this.getMapGL()?.triggerRepaint()
        }
    }

    getId() {
        return this._id
    }

    getMap() {
        return this._map
    }

    getMapGL() {
        return this._map?.getMapGL()
    }

    isOnMap() {
        const mapgl = this.getMapGL()
        return Boolean(
            mapgl && this._map.styleIsLoaded() && mapgl.getLayer(this._id)
        )
    }

    hasLayerId(id) {
        return id === this._id
    }

    isInteractive() {
        return false
    }

    getInteractiveIds() {
        return []
    }

    move() {
        this.getMapGL().moveLayer(this._id, this._map.getBeforeLayerId())
    }

    setIndex(index = 0) {
        this.options.index = index
        this._map?.orderOverlays()
    }

    getIndex() {
        return this.options.index || 0
    }

    // Custom layers have no layout properties, so visibility is opacity
    setVisibility(isVisible) {
        this._isVisible = isVisible
        this._layer?.setOpacity(isVisible ? this.options.opacity ?? 1 : 0)
    }

    isVisible() {
        return this._isVisible
    }

    setOpacity(opacity) {
        this.options.opacity = opacity
        if (this._isVisible) {
            this._layer?.setOpacity(opacity)
        }
    }

    getBounds() {
        return this.options.render.bounds
    }

    // Events are not supported, as the layer has no features
    on() {}

    off() {}

    fire() {}
}

export default ZarrLayer
