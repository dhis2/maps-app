import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useState, useRef, useCallback, useEffect } from 'react'
import BasemapLayer from './layers/BasemapLayer.js'
import ThematicLayer from './layers/ThematicLayer.js'
import MapItem from './MapItem.js'
import PeriodName from './PeriodName.js'
import styles from './styles/SplitView.module.css'

const SplitView = ({
    isPlugin,
    basemap,
    layer,
    feature,
    controls,
    openContextMenu,
    isFullscreen,
    interpretationModalOpen,
    setMapObject,
}) => {
    const [showFullscreen, setShowFullscreen] = useState()
    const [map, setMap] = useState() // Called from map child
    const containerRef = useRef()

    // From built-in fullscreen control
    const onFullscreenChange = useCallback(
        ({ isFullscreen }) => setShowFullscreen(isFullscreen),
        []
    )

    useEffect(() => {
        if (map && controls && containerRef.current) {
            controls.forEach((control) => {
                map.addControl(control)
                containerRef.current.append(
                    map.getControlContainer(control.type)
                )
            })

            setMapObject(map)
        }
    }, [map, controls, containerRef, setMapObject])

    useEffect(() => {
        if (map && isPlugin) {
            map.on('fullscreenchange', onFullscreenChange)
        }
        return () => {
            if (map && isPlugin) {
                map.off('fullscreenchange', onFullscreenChange)
            }
        }
    }, [map, isPlugin, onFullscreenChange])

    useEffect(() => {
        // From map plugin resize method
        setShowFullscreen(isFullscreen)
    }, [isFullscreen])

    const { id, periods = [] } = layer

    return !interpretationModalOpen ? (
        <div
            ref={containerRef}
            className={cx('dhis2-map-split-view', styles.splitView)}
        >
            {periods.map((period, index) => (
                <MapItem
                    key={period.id}
                    index={index}
                    count={periods.length}
                    layerId={id}
                    setMapControls={setMap}
                    isPlugin={isPlugin}
                    isFullscreen={showFullscreen}
                >
                    <BasemapLayer {...basemap} />
                    <ThematicLayer
                        index={1}
                        period={period}
                        feature={feature}
                        {...layer}
                        openContextMenu={openContextMenu}
                    />
                    <PeriodName period={period.name} />
                </MapItem>
            ))}
        </div>
    ) : null
}

SplitView.propTypes = {
    layer: PropTypes.object.isRequired,
    openContextMenu: PropTypes.func.isRequired,
    setMapObject: PropTypes.func.isRequired,
    basemap: PropTypes.object,
    controls: PropTypes.array,
    feature: PropTypes.object,
    interpretationModalOpen: PropTypes.bool,
    isFullscreen: PropTypes.bool,
    isPlugin: PropTypes.bool,
}

SplitView.defaultProps = {
    openContextMenu: () => {},
}

export default SplitView
