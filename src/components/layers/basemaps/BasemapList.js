import React from 'react';
import PropTypes from 'prop-types';
import Basemap from './Basemap';
import { layerTypes } from '../../map/MapApi';
import styles from './styles/BasemapList.module.css';

const BasemapList = ({ selectedID, basemaps, selectBasemap }) => (
    <div className={styles.basemapList} data-test="basemaplist">
        {basemaps
            .filter(basemap => layerTypes.includes(basemap.config.type))
            .map((basemap, index) => (
                <Basemap
                    key={`basemap-${index}`}
                    onClick={selectBasemap}
                    isSelected={basemap.id === selectedID}
                    {...basemap}
                />
            ))}
    </div>
);

BasemapList.propTypes = {
    selectedID: PropTypes.string.isRequired,
    basemaps: PropTypes.array.isRequired,
    selectBasemap: PropTypes.func.isRequired,
};

export default BasemapList;
