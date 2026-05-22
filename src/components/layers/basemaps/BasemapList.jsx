import PropTypes from 'prop-types'
import React from 'react'
import { useCachedData } from '../../cachedDataProvider/CachedDataProvider.jsx'
import { useFavorites } from '../../layerSources/mockFavoritesStore.js'
import Basemap from './Basemap.jsx'
import styles from './styles/BasemapList.module.css'

const BasemapList = ({ selectedID, selectBasemap }) => {
    const { basemaps } = useCachedData()
    const [favorites] = useFavorites()

    const visible =
        favorites.size > 0
            ? basemaps.filter((b) => favorites.has(b.id))
            : basemaps

    return (
        <div className={styles.basemapList} data-test="basemaplist">
            {visible.map((basemap, index) => (
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
