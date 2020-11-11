import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@dhis2/d2-i18n';
import cx from 'classnames';
import styles from './styles/Basemap.module.css';

// TODO: Use ImageSelect.js component for selectable image
const Basemap = ({ id, img, name, isSelected, onClick }) => {
    return (
        <div
            className={styles.container}
            title={name}
            onClick={() => onClick(id)}
            data-test="basemaplistitem"
        >
            <div
                className={cx(styles.imageContainer, {
                    [styles.selected]: isSelected,
                })}
                data-test="basemaplistitem-img"
            >
                {img ? (
                    <img src={img} className={styles.image} />
                ) : (
                    <div className={styles.noImage}>
                        {i18n.t('External basemap')}
                    </div>
                )}
            </div>
            <div
                className={cx(styles.name, {
                    [styles.nameSelected]: isSelected,
                })}
                data-test="basemaplistitem-name"
            >
                {i18n.t(name)}
            </div>
        </div>
    );
};

Basemap.propTypes = {
    id: PropTypes.string.isRequired,
    img: PropTypes.string,
    name: PropTypes.string.isRequired,
    isSelected: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default Basemap;
