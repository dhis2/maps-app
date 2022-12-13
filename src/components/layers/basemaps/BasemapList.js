import PropTypes from 'prop-types'
import React from 'react'
import { layerTypes } from '../../map/MapApi.js'
import Basemap from './Basemap.js'
import styles from './styles/BasemapList.module.css'

const BasemapList = ({ selectedID, basemaps, selectBasemap }) => (
    <div className={styles.basemapList} data-test="basemaplist">
        {basemaps
            .filter((basemap) => layerTypes.includes(basemap.config.type))
            .map((basemap, index) => (
                <Basemap
                    key={`basemap-${index}`}
                    onClick={selectBasemap}
                    isSelected={basemap.id === selectedID}
                    {...basemap}
                />
            ))}
    </div>
)

BasemapList.propTypes = {
    basemaps: PropTypes.array.isRequired,
    selectBasemap: PropTypes.func.isRequired,
    selectedID: PropTypes.string.isRequired,
}

export default BasemapList
