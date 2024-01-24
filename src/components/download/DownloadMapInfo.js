import cx from 'classnames'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useWindowDimensions } from '../WindowDimensionsProvider.js'
import DownloadLegend from './DownloadLegend.js'
import OverviewMap from './OverviewMap.js'
import styles from './styles/DownloadMapInfo.module.css'

const DownloadMapInfo = ({ map, isSplitView }) => {
    const [resizeCount, setResizeCount] = useState(0)
    const { height } = useWindowDimensions()

    const {
        showName,
        showDescription,
        showLegend,
        showInLegend,
        showOverviewMap,
    } = useSelector((state) => state.download)

    const { mapViews, name, description } = useSelector((state) => state.map)

    useEffect(() => {
        setResizeCount((count) => count + 1)
    }, [showName, showDescription, showInLegend, height])

    return (
        <div
            className={cx(styles.downloadMapInfo)}
            data-test="download-map-info"
        >
            <div>
                {showName && name && <h1>{name}</h1>}
                {showDescription && description && <p>{description}</p>}
                {showLegend && (
                    <DownloadLegend
                        layers={mapViews.filter((l) =>
                            showInLegend.includes(l.id)
                        )}
                    />
                )}
            </div>
            {showOverviewMap && (
                <OverviewMap
                    mainMap={map}
                    isSplitView={isSplitView}
                    resizeCount={resizeCount}
                />
            )}
        </div>
    )
}

DownloadMapInfo.propTypes = {
    map: PropTypes.object.isRequired,
    isSplitView: PropTypes.bool,
}

export default DownloadMapInfo
