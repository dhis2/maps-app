import PropTypes from 'prop-types'
import React from 'react'
import { useSelector } from 'react-redux'
import DownloadLegend from './DownloadLegend.js'
import InsetMap from './InsetMap.js'
import styles from './styles/DownloadPanel.module.css'

const DownloadPanel = ({ map }) => {
    const { showName, showDescription, showLegend, showInsetMap } = useSelector(
        (state) => state.download
    )
    const { mapViews, name, description } = useSelector((state) => state.map)

    return (
        <div className={styles.downloadPanel}>
            {showName && name && <h1>{name}</h1>}
            {showDescription && description && <p>{description}</p>}
            {showLegend && <DownloadLegend layers={mapViews} />}
            {showInsetMap && <InsetMap map={map} />}
        </div>
    )
}

DownloadPanel.propTypes = {
    map: PropTypes.object.isRequired,
}

export default DownloadPanel
