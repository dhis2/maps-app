import React from 'react'
import { useSelector } from 'react-redux'
import styles from './styles/MapName.module.css'

const MapName = () => {
    const name = useSelector((state) => state.map.displayName)
    const downloadMode = useSelector((state) => state.ui.downloadMode)

    return !downloadMode && name ? (
        <div className={styles.mapName} data-test="map-name">
            <div className={`${styles.name} dhis2-maps-title`}>{name}</div>
        </div>
    ) : null
}

export default MapName
