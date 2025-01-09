import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { onFullscreenChange } from '../../util/map.js'
import BasemapLayer from './layers/BasemapLayer.js'
import EarthEngineLayer from './layers/earthEngine/EarthEngineLayer.js'
import EventLayer from './layers/EventLayer.js'
import ExternalLayer from './layers/ExternalLayer.js'
import FacilityLayer from './layers/FacilityLayer.js'
import GeoJsonLayer from './layers/GeoJsonLayer.js'
import Layer from './layers/Layer.js'
import OrgUnitLayer from './layers/OrgUnitLayer.js'
import ThematicLayer from './layers/ThematicLayer.js'
import TrackedEntityLayer from './layers/TrackedEntityLayer.js'
import mapApi, { controlTypes } from './MapApi.js'
import Popup from './Popup.js'
import styles from './styles/Map.module.css'

const layerType = {
    event: EventLayer,
    trackedEntity: TrackedEntityLayer,
    facility: FacilityLayer,
    thematic: ThematicLayer,
    orgUnit: OrgUnitLayer,
    earthEngine: EarthEngineLayer,
    external: ExternalLayer,
    geoJsonUrl: GeoJsonLayer,
}

class Map extends Component {
    static propTypes = {
        baseUrl: PropTypes.string.isRequired,
        openContextMenu: PropTypes.func.isRequired,
        basemap: PropTypes.object,
        bounds: PropTypes.array,
        closeCoordinatePopup: PropTypes.func,
        controls: PropTypes.array,
        coordinatePopup: PropTypes.array,
        engine: PropTypes.object,
        feature: PropTypes.object,
        isFullscreen: PropTypes.bool,
        isPlugin: PropTypes.bool,
        latitude: PropTypes.number,
        layers: PropTypes.array,
        longitude: PropTypes.number,
        nameProperty: PropTypes.string,
        resizeCount: PropTypes.number,
        setAggregations: PropTypes.func,
        setFeatureProfile: PropTypes.func,
        setMapObject: PropTypes.func,
        zoom: PropTypes.number,
    }

    static defaultProps = {
        isPlugin: false,
    }

    static childContextTypes = {
        map: PropTypes.object.isRequired,
        isPlugin: PropTypes.bool.isRequired,
    }

    state = {}

    constructor(props, context) {
        super(props, context)
        const { isPlugin, baseUrl } = props

        const map = mapApi({
            scrollZoom: !isPlugin,
            baseUrl,
        })

        if (isPlugin) {
            map.toggleMultiTouch(true)
            map.on('fullscreenchange', this.onFullscreenChange)
            window.addEventListener('resize', () => {
                this.onFullscreenChange(map, { isFullscreen: true })
            })
        } else {
            map.on('contextmenu', this.onRightClick, this)
        }

        this.map = map

        map.on('ready', this.onMapReady)
    }

    getChildContext() {
        return {
            map: this.map,
            isPlugin: this.props.isPlugin,
        }
    }

    componentDidMount() {
        const { controls, bounds, latitude, longitude, zoom } = this.props
        const { map } = this

        // Append map container to DOM
        this.node.appendChild(map.getContainer())

        map.resize()

        // Add map controls
        if (controls) {
            controls
                .filter((control) => controlTypes.includes(control.type))
                .forEach((control) => map.addControl(control))
        }

        const layerBounds = map.getLayersBounds()

        if (Array.isArray(layerBounds)) {
            map.fitBounds(layerBounds)
        } else if (bounds) {
            map.fitBounds(bounds)
        } else if (latitude && longitude && zoom) {
            map.setView([longitude, latitude], zoom)
        } else {
            map.fitWorld()
        }
    }

    componentDidUpdate(prevProps) {
        const { resizeCount, isFullscreen, isPlugin } = this.props

        if (resizeCount !== prevProps.resizeCount) {
            this.map.resize()
        }

        // From map plugin resize method
        if (isPlugin && isFullscreen !== prevProps.isFullscreen) {
            onFullscreenChange(this.map, isFullscreen)
        }
    }

    // Remove map
    componentWillUnmount() {
        if (this.map) {
            this.map.off('ready', this.onMapReady)
            this.map.remove()
            delete this.map
        }
    }

    render() {
        const {
            basemap,
            engine,
            nameProperty,
            layers,
            feature,
            coordinatePopup: coordinates,
            closeCoordinatePopup,
            openContextMenu,
            setAggregations,
            setFeatureProfile,
        } = this.props
        const { map } = this.state

        const overlays = layers.filter((layer) => layer.isLoaded)

        return (
            <div ref={(node) => (this.node = node)} className={styles.map}>
                {map && (
                    <Fragment>
                        {overlays.map((config, index) => {
                            const Overlay = layerType[config.layer] || Layer
                            const highlight =
                                feature && feature.layerId === config.id
                                    ? feature
                                    : null

                            return (
                                <Overlay
                                    key={config.id}
                                    index={overlays.length - index}
                                    feature={highlight}
                                    openContextMenu={openContextMenu}
                                    setAggregations={setAggregations}
                                    setFeatureProfile={setFeatureProfile}
                                    engine={engine}
                                    nameProperty={nameProperty}
                                    {...config}
                                />
                            )
                        })}
                        <BasemapLayer {...basemap} />
                        {coordinates && (
                            <Popup
                                coordinates={coordinates}
                                onClose={closeCoordinatePopup}
                            >
                                {i18n.t('Longitude')}:{' '}
                                {coordinates[0].toFixed(6)}
                                <br />
                                {i18n.t('Latitude')}:{' '}
                                {coordinates[1].toFixed(6)}
                            </Popup>
                        )}
                    </Fragment>
                )}
            </div>
        )
    }

    onRightClick = (evt) => {
        const [x, y] = evt.position
        const { left, top } = this.map.getContainer().getBoundingClientRect()

        this.props.openContextMenu({
            ...evt,
            position: [x, y],
            offset: [left, top],
        })
    }

    onMapReady = (map) => {
        this.setState({ map })

        const { setMapObject } = this.props

        if (setMapObject) {
            setMapObject(this.map)
        }
    }

    // From built-in fullscreen control
    onFullscreenChange = ({ isFullscreen }) => {
        onFullscreenChange(this.map, isFullscreen)
    }
}

export default Map
