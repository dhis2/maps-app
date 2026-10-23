import { addProtocol } from 'maplibre-gl'
import { Protocol } from 'pmtiles'

// The opacity paint properties of each layer type
const OPACITY_PROPERTIES = {
    fill: ['fill-opacity'],
    line: ['line-opacity'],
    circle: ['circle-opacity', 'circle-stroke-opacity'],
}

let isProtocolAdded = false

// MapLibre reads PMTiles archives through the pmtiles:// protocol, registered once
const addPmtilesProtocol = () => {
    if (!isProtocolAdded) {
        addProtocol('pmtiles', new Protocol().tile)
        isProtocolAdded = true
    }
}

// Draws an Open Climate Service vector collection from its PMTiles archive, with
// the MapLibre style OCS publishes for it. Implements the layer interface that
// the maps-gl map expects (addTo, removeFrom, move, setIndex, ...), as maps-gl
// does not have a vector tile overlay type.
// It could move to maps-gl as a layer type.
class VectorTileLayer {
    constructor(options) {
        const { id, render } = options
        const [sourceName, source] = Object.entries(render.style.sources)[0]

        this.options = options
        this._id = id
        this._isVisible = options.isVisible !== false
        this._source = source
        // Layer and source ids are prefixed, so two OCS layers never collide
        this._layers = render.style.layers
            .filter((layer) => layer.source === sourceName)
            .map((layer) => ({ ...layer, id: `${id}-${layer.id}`, source: id }))
    }

    addTo(map) {
        const mapgl = map.getMapGL()
        this._map = map

        addPmtilesProtocol()

        if (!map.styleIsLoaded()) {
            return
        }
        if (!mapgl.getSource(this._id)) {
            mapgl.addSource(this._id, this._source)
        }
        this._layers.forEach((layer) => {
            if (!mapgl.getLayer(layer.id)) {
                mapgl.addLayer(layer, map.getBeforeLayerId())
            }
        })
        this.setVisibility(this._isVisible)
        this.setOpacity(this.options.opacity ?? 1)
    }

    removeFrom(map) {
        const mapgl = map.getMapGL()

        if (mapgl) {
            this._layers.forEach(({ id }) => {
                if (mapgl.getLayer(id)) {
                    mapgl.removeLayer(id)
                }
            })
            if (mapgl.getSource(this._id)) {
                mapgl.removeSource(this._id)
            }
        }
        this._map = null
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
            mapgl &&
                this._map.styleIsLoaded() &&
                mapgl.getLayer(this._layers[0]?.id)
        )
    }

    hasLayerId(id) {
        return this._layers.some((layer) => layer.id === id)
    }

    isInteractive() {
        return true
    }

    getInteractiveIds() {
        return this.isOnMap() ? this._layers.map(({ id }) => id) : []
    }

    // Hover highlighting needs feature ids in the tiles, which they do not carry
    getFeaturesById() {
        return []
    }

    move() {
        const mapgl = this.getMapGL()
        const beforeId = this._map.getBeforeLayerId()
        this._layers.forEach(({ id }) => mapgl.moveLayer(id, beforeId))
    }

    setIndex(index = 0) {
        this.options.index = index
        this._map?.orderOverlays()
    }

    getIndex() {
        return this.options.index || 0
    }

    setVisibility(isVisible) {
        this._isVisible = isVisible
        const mapgl = this.getMapGL()
        if (this.isOnMap()) {
            const visibility = isVisible ? 'visible' : 'none'
            this._layers.forEach(({ id }) =>
                mapgl.setLayoutProperty(id, 'visibility', visibility)
            )
        }
    }

    isVisible() {
        return this._isVisible
    }

    // Scales each layer's own opacity, so the style's translucent fill stays translucent
    setOpacity(opacity) {
        this.options.opacity = opacity
        const mapgl = this.getMapGL()
        if (!this.isOnMap()) {
            return
        }
        this._layers.forEach(({ id, type, paint = {} }) => {
            ;(OPACITY_PROPERTIES[type] || []).forEach((property) => {
                const base =
                    typeof paint[property] === 'number' ? paint[property] : 1
                mapgl.setPaintProperty(id, property, base * opacity)
            })
        })
    }

    getBounds() {
        return this.options.render.bounds
    }

    // The name of the feature under the pointer, as a label
    onMouseMove(evt, feature) {
        const name = feature?.properties?.name
        if (name) {
            this._map.showLabel(name, evt.lngLat)
        } else {
            this._map.hideLabel()
        }
    }

    onClick(evt) {
        this.options.onClick?.(evt)
    }

    // Right-click menus are not supported for this layer
    on() {
        return this
    }

    off() {
        return this
    }

    fire() {
        return this
    }
}

export default VectorTileLayer
