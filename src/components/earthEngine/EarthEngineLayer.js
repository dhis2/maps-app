import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { Checkbox } from '../core/index.js'
import styles from './styles/EarthEngineLayer.module.css'

const EarthEngineLayer = ({ layer, isAdded, onShow, onHide }) => {
    const { layerId, name, img, description, source } = layer

    return (
        <div
            className={styles.layer}
            onClick={() => (isAdded ? onHide(layerId) : onShow(layerId))}
        >
            <Checkbox
                dataTest="earthenginelayer-checkbox"
                checked={isAdded}
                dense={false}
                onChange={() => {}}
            />
            <img src={img} className={styles.image} />
            <div className={styles.layerInfo}>
                <h2>{name}</h2>
                <p>{description}</p>
                <div className={styles.source}>
                    {i18n.t('Source')}: {source}
                </div>
            </div>
        </div>
    )
}

EarthEngineLayer.propTypes = {
    isAdded: PropTypes.bool.isRequired,
    layer: PropTypes.object.isRequired,
    onHide: PropTypes.func.isRequired,
    onShow: PropTypes.func.isRequired,
}

export default EarthEngineLayer
