import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { RENDERING_STRATEGY_TIMELINE } from '../../constants/layers.js'
import { onFullscreenChange } from '../../util/map.js'
import {
    sortPeriodsByLevelAndStartDate,
    addPeriodsDetails,
} from '../../util/periods.js'
import Timeline from '../periods/Timeline.jsx'
import BasemapLayer from './layers/BasemapLayer.js'
import EarthEngineLayer from './layers/earthEngine/EarthEngineLayer.jsx'
import EventLayer from './layers/EventLayer.jsx'
import ExternalLayer from './layers/ExternalLayer.js'
import FacilityLayer from './layers/FacilityLayer.jsx'
import GeoJsonLayer from './layers/GeoJsonLayer.js'
import Layer from './layers/Layer.js'
import OrgUnitLayer from './layers/OrgUnitLayer.jsx'
import ThematicLayer from './layers/ThematicLayer.jsx'
import TrackedEntityLayer from './layers/TrackedEntityLayer.jsx'
import mapApi, { controlTypes } from './MapApi.js'
import PeriodName from './PeriodName.jsx'
import Popup from './Popup.jsx'
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
        layersSorting: PropTypes.bool,
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

    state = {
        map: null,
        period: null,
    }

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
                this.onFullscreenChange({ isFullscreen: false })
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
        const { resizeCount, isFullscreen, isPlugin, layers, layersSorting } =
            this.props

        if (resizeCount !== prevProps.resizeCount) {
            this.map.resize()
        }

        if (layersSorting !== prevProps.layersSorting) {
            this.map.setMouseMoveEnabled(!layersSorting)
        }

        // From map plugin resize method
        if (isPlugin && isFullscreen !== prevProps.isFullscreen) {
            onFullscreenChange(this.map, isFullscreen)
        }

        const overlays = this.getLoadedLayers(layers)
        const timelineOverlay = this.getTimelineOverlay(overlays)
        this.initializeTimelinePeriod(timelineOverlay)
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
            resizeCount,
        } = this.props

        const { map, period } = this.state

        const overlays = this.getLoadedLayers(layers)
        const timelineOverlay = this.getTimelineOverlay(overlays)

        return (
            <div ref={(node) => (this.node = node)} className={styles.map}>
                {map && (
                    <Fragment>
                        {!!timelineOverlay && period && (
                            <Fragment>
                                <PeriodName
                                    period={period.name}
                                    isTimeline={true}
                                />
                                <Timeline
                                    periodId={period.id}
                                    period={period}
                                    periods={timelineOverlay?.periods}
                                    onChange={(period) =>
                                        this.setState({ period })
                                    }
                                    resizeCount={resizeCount}
                                />
                            </Fragment>
                        )}
                        {overlays.map((config, index) => {
                            const Overlay = layerType[config.layer] || Layer
                            const highlight =
                                feature && feature.layerId === config.id
                                    ? feature
                                    : null

                            return (
                                <Overlay
                                    key={config.id}
                                    index={layers.length - index}
                                    feature={highlight}
                                    openContextMenu={openContextMenu}
                                    setAggregations={setAggregations}
                                    setFeatureProfile={setFeatureProfile}
                                    engine={engine}
                                    nameProperty={nameProperty}
                                    externalPeriod={period}
                                    resizeCount={resizeCount}
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

    getLoadedLayers = (layers = []) => layers.filter((layer) => layer.isLoaded)

    getTimelineOverlay = (layers) =>
        layers.find(
            (layer) => layer.renderingStrategy === RENDERING_STRATEGY_TIMELINE
        )

    initializeTimelinePeriod = (timelineOverlay) => {
        if (!timelineOverlay || this.state.period) {
            return
        }

        const { periodsWithTypeLevelAndRank } = addPeriodsDetails(
            timelineOverlay.periods
        )

        const [initialPeriod] = sortPeriodsByLevelAndStartDate(
            periodsWithTypeLevelAndRank
        )

        if (initialPeriod) {
            this.setState({ period: initialPeriod })
        }
    }
}

export default Map
