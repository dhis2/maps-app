import React from 'react';
import PropTypes from 'prop-types';
import Layer from './Layer';

const LayerList = ({ layers, onLayerSelect }) => (
    <div className='LayerList'>
        {layers.map((layer, index) => (
            <Layer
                key={`overlay-${index}`}
                onClick={onLayerSelect}
                layer={config}
            />
        ))}
    </div>
);

LayerList.propTypes = {
    layers: PropTypes.array.isRequired,
    onLayerSelect: PropTypes.func.isRequired,
};

export default LayerList;
