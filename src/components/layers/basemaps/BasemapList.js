import React from 'react';
import PropTypes from 'prop-types';
import Basemap from './Basemap';
import './BasemapList.css';

const BasemapList = ({ id, basemaps, selectBasemap }) => (
    <div className='BasemapList'>
        {basemaps.map((basemap, index) => (
            <Basemap
                key={`basemap-${index}`}
                onClick={selectBasemap}
                isSelected={basemap.id === id}
                {...basemap}
            />
        ))}
    </div>
);

BasemapList.propTypes = {
    id: PropTypes.string.isRequired,
    basemaps: PropTypes.array.isRequired,
    selectBasemap: PropTypes.func.isRequired,
};

export default BasemapList;
