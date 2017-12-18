import React from 'react';
import PropTypes from 'prop-types';
import './ImageSelect.css';

const ImageSelect = ({ id, img, title, isSelected, onClick, style }) => {
    const borderStyle = {
        outline: isSelected ? '3px solid orange' : '1px solid #999',
    };

    return (
        <div className='ImageSelect' title={title} onClick={() => onClick(id)} style={style}>
            <div className='ImageSelect-image-container' style={borderStyle}>
                {img ? <img src={img} className='ImageSelect-image' /> : <div className='ImageSelect-no-image'></div>}
            </div>
            {title ? <div className='ImageSelect-title'>{title}</div> : null}
        </div>
    );
};

ImageSelect.propTypes = {
    id: PropTypes.string.isRequired,
    img: PropTypes.string,
    title: PropTypes.string,
    isSelected: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
};

export default ImageSelect;
