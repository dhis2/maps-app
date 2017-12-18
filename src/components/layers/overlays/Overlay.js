import React from 'react';
import PropTypes from 'prop-types';
import './Overlay.css';

const Overlay = ({ overlay, onClick }) => {
    const { img, title } = overlay;

    return (
        <div className='Overlay' onClick={() => onClick(overlay)}>
            {img ? <img src={img} className='Overlay-image' /> : <div className='Overlay-no-image'>External layer</div>}
            <div className='Overlay-title'>{title}</div>
        </div>
    );
};

Overlay.propTypes = {
    overlay: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default Overlay;
