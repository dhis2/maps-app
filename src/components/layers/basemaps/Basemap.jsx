import i18n from '@dhis2/d2-i18n'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/Basemap.module.css'

// TODO: Use ImageSelect.js component for selectable image
const Basemap = ({ id, img, name, config, isSelected, onClick }) => {
    return (
        <div
            className={styles.container}
            title={name}
            onClick={() => onClick({ id, config })}
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
    )
}

Basemap.propTypes = {
    config: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    isSelected: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    img: PropTypes.string,
}

export default Basemap
