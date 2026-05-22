import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { Checkbox } from '../core/index.js'
import styles from './styles/LayerSource.module.css'

const LayerSource = ({ layerSource, isAdded, onShow, onHide }) => {
    const { layerId, name, img, description, descriptionComplement, source } =
        layerSource

    return (
        <div
            className={styles.layerSource}
            // Is current layer already in list? y > trigger hide, n > trigger show
            onClick={() => (isAdded ? onHide(layerId) : onShow(layerId))}
        >
            <Checkbox
                dataTest="layersource-checkbox"
                checked={isAdded}
                dense={false}
                onChange={() => {}}
            />
            <img src={img} className={styles.image} />
            <div className={styles.layerSourceInfo}>
                <h2>{name}</h2>
                <p>{description}</p>
                <p>{descriptionComplement}</p>
                <div className={styles.source}>
                    {i18n.t('Source')}: {source}
                </div>
            </div>
        </div>
    )
}

LayerSource.propTypes = {
    isAdded: PropTypes.bool.isRequired,
    layerSource: PropTypes.object.isRequired,
    onHide: PropTypes.func.isRequired,
    onShow: PropTypes.func.isRequired,
}

export default LayerSource
