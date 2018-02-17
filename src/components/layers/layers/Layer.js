import React from 'react';
import PropTypes from 'prop-types';
import './Layer.css';

const Layer = ({ layer, onClick }) => {
    const { img, type, name } = layer;

    return (
        <div className='Layer' onClick={() => onClick(layer)}>
            {img ? <img src={img} className='Layer-image' /> : <div className='Layer-no-image'>External layer</div>}
            <div className='Layer-name'>{name || type}</div>
        </div>
    );
};

Layer.propTypes = {
    layer: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default Layer;
