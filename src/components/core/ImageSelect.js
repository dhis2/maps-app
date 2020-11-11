import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import styles from './styles/ImageSelect.module.css';

const ImageSelect = ({ id, img, title, isSelected, onClick, className }) => (
    <div
        className={cx(styles.imageSelect, className)}
        title={title}
        onClick={() => onClick(id)}
    >
        <div
            className={`${styles.imageContainer} ${
                isSelected ? styles.imageContainerSelected : ''
            }`}
        >
            {img ? (
                <img src={img} className={styles.image} />
            ) : (
                <div className={styles.noImage} />
            )}
        </div>
        {title ? <div className={styles.title}>{title}</div> : null}
    </div>
);

ImageSelect.propTypes = {
    id: PropTypes.string.isRequired,
    img: PropTypes.string,
    title: PropTypes.string,
    isSelected: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string,
};

export default ImageSelect;
