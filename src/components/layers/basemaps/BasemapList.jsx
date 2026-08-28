import PropTypes from 'prop-types'
import React from 'react'
import useCatalogBasemaps from '../../../hooks/useCatalogBasemaps.js'
import useLayerCatalogPrefs from '../../../hooks/useLayerCatalogPrefs.js'
import { getManagedLayerSourceId } from '../../../util/layerSources.js'
import Basemap from './Basemap.jsx'
import styles from './styles/BasemapList.module.css'

const BasemapList = ({ selectedID, selectBasemap }) => {
    const basemaps = useCatalogBasemaps()
    const { isDisabled } = useLayerCatalogPrefs()

    // PROTOTYPE ONLY - anything an admin switched off is dropped from the card
    const enabledBasemaps = basemaps.filter(
        (basemap) => !isDisabled(getManagedLayerSourceId(basemap))
    )

    return (
        <div className={styles.basemapList} data-test="basemaplist">
            {enabledBasemaps.map((basemap, index) => (
                <Basemap
                    key={`basemap-${index}`}
                    onClick={selectBasemap}
                    isSelected={basemap.id === selectedID}
                    {...basemap}
                />
            ))}
        </div>
    )
}

BasemapList.propTypes = {
    selectBasemap: PropTypes.func.isRequired,
    selectedID: PropTypes.string.isRequired,
}

export default BasemapList
