import { useCachedDataQuery } from '@dhis2/analytics'
import PropTypes from 'prop-types'
import React from 'react'
import { useFilteredMSLayers } from '../../../hooks/useCheckKey.js'
import Basemap from './Basemap.js'
import styles from './styles/BasemapList.module.css'

const BasemapList = ({ selectedID, selectBasemap }) => {
    const { basemaps } = useCachedDataQuery()
    const filteredMSLayers = useFilteredMSLayers()
    return (
        <div className={styles.basemapList} data-test="basemaplist">
            {basemaps
                .filter(
                    (basemap) => !filteredMSLayers.includes(basemap.config.type)
                )
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
}

BasemapList.propTypes = {
    selectBasemap: PropTypes.func.isRequired,
    selectedID: PropTypes.string.isRequired,
}

export default BasemapList
