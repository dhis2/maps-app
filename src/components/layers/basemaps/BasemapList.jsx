import PropTypes from 'prop-types'
import React from 'react'
import { useCachedData } from '../../cachedDataProvider/CachedDataProvider.jsx'
import Basemap from './Basemap.jsx'
import styles from './styles/BasemapList.module.css'

const BasemapList = ({ selectedID, selectBasemap }) => {
    const { basemaps } = useCachedData()
    return (
        <div className={styles.basemapList} data-test="basemaplist">
            {basemaps.map((basemap, index) => (
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
