import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { onFullscreenChange } from '../../util/map.js'
import mapApi from './MapApi.js'
import styles from './styles/MapItem.module.css'

const getMapItemWidth = (count) => {
    if (count === 1) {
        return '100%'
    }
    if (count === 2 || count === 4) {
        return '50%'
    }
    return '33.3333%'
}

class MapItem extends PureComponent {
    static childContextTypes = {
        map: PropTypes.object.isRequired,
        isPlugin: PropTypes.bool.isRequired,
    }

    static propTypes = {
        baseUrl: PropTypes.string.isRequired,
        children: PropTypes.node.isRequired,
        count: PropTypes.number.isRequired,
        index: PropTypes.number.isRequired,
        layerId: PropTypes.string.isRequired,
        setMapControls: PropTypes.func.isRequired,
        isFullscreen: PropTypes.bool,
        isPlugin: PropTypes.bool,
        layersSorting: PropTypes.bool,
    }

    static defaultProps = {
        isPlugin: false,
    }

    state = {}

    constructor(props, context) {
        super(props, context)

        const { isPlugin, baseUrl } = props

        this.map = mapApi({
            attributionControl: false,
            scrollZoom: !isPlugin,
            baseUrl,
        })

        if (isPlugin) {
            this.map.toggleMultiTouch(true)
        }

        this.map.on('ready', this.onMapReady)
    }

    getChildContext() {
        return {
            map: this.map,
            isPlugin: this.props.isPlugin,
        }
    }

    componentDidMount() {
        const { layerId, index, setMapControls } = this.props
        const { map } = this

        this.node.appendChild(map.getContainer())
        this.fitLayerBounds()

        map.sync(layerId)

        // Add map controls if first map
        if (index == 0) {
            setMapControls(map)
        }
    }

    componentDidUpdate(prevProps) {
        const { count, isFullscreen, isPlugin, layersSorting } = this.props

        if (count !== prevProps.count) {
            this.fitLayerBounds()
        }

        if (layersSorting !== prevProps.layersSorting) {
            this.map.setMouseMoveEnabled(!layersSorting)
        }

        if (isPlugin && isFullscreen !== prevProps.isFullscreen) {
            onFullscreenChange(this.map, isFullscreen)
        }

        this.map.resize()
    }

    componentWillUnmount() {
        this.map.off('ready', this.onMapReady)
        this.map.unsync(this.props.layerId)
        this.map.remove()
        delete this.map
    }

    render() {
        const { count, children } = this.props
        const { map } = this.state

        return (
            <div
                ref={(node) => (this.node = node)}
                className={styles.mapItem}
                style={{
                    width: getMapItemWidth(count),
                }}
            >
                {map && children}
            </div>
        )
    }

    // Zoom to layers bounds on mount
    fitLayerBounds() {
        this.map.resize()

        const bounds = this.map.getLayersBounds()
        if (bounds) {
            this.map.fitBounds(bounds)
        } else {
            this.map.fitWorld()
        }
    }

    onMapReady = (map) => this.setState({ map })
}

export default MapItem
