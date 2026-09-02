import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { useSelector } from 'react-redux'
import { useMapDirty } from '../../hooks/useMapDirty.js'
import styles from './styles/MapName.module.css'

const MapName = () => {
    const name = useSelector((state) => state.map.displayName)
    const downloadMode = useSelector((state) => state.ui.downloadMode)
    const dirty = useMapDirty()

    return !downloadMode && name ? (
        <div className={styles.mapName} data-test="map-name">
            <div className={`${styles.name} dhis2-maps-title`}>
                {name}
                {dirty && (
                    <span className={styles.edited} data-test="map-name-edited">
                        {` - ${i18n.t('Edited')}`}
                    </span>
                )}
            </div>
        </div>
    ) : null
}

export default MapName
