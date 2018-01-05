import React from 'react';
import PropTypes from 'prop-types';
import './Layer.css';

const Layer = ({ layer, onClick }) => {
    const { img, title } = layer;

    return (
        <div className='Layer' onClick={() => onClick(layer)}>
            {img ? <img src={img} className='Layer-image' /> : <div className='Layer-no-image'>External layer</div>}
            <div className='Layer-title'>{title}</div>
        </div>
    );
};

Layer.propTypes = {
    layer: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default Layer;
