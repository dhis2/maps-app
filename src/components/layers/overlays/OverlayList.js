import React from 'react';
import PropTypes from 'prop-types';
import Overlay from './Overlay';
import './OverlayList.css';

const OverlayList = ({ overlays, onLayerSelect }) => (
    <div className='OverlayList'>
        {overlays.map((overlay, index) => (
            <Overlay
                key={`overlay-${index}`}
                onClick={onLayerSelect}
                overlay={overlay}
            />
        ))}
    </div>
);

OverlayList.propTypes = {
    overlays: PropTypes.array.isRequired,
    onLayerSelect: PropTypes.func.isRequired,
};

export default OverlayList;
