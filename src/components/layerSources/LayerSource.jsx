import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import {
    getLayerSourceLabel,
    getLayerSourceDescription,
    getLayerSourceMeta,
    getLayerSourcePlacementLabel,
    PLACEMENT_BASEMAP,
} from '../../util/layerSources.js'
import { Checkbox } from '../core/index.js'
import styles from './styles/LayerSource.module.css'

const LayerSource = ({
    layerSource,
    isAdded,
    onToggle,
    isNew,
    placement,
    isLocked,
    lockedReason,
}) => {
    const { img } = layerSource
    const label = getLayerSourceLabel(layerSource)
    const description = getLayerSourceDescription(layerSource)
    const meta = getLayerSourceMeta(layerSource)

    return (
        <div
            className={styles.layerSource}
            onClick={isLocked ? undefined : onToggle}
            title={isLocked ? lockedReason : undefined}
        >
            <Checkbox
                className={styles.checkbox}
                dataTest="layersource-checkbox"
                checked={isAdded}
                disabled={isLocked}
                dense
                onChange={() => {}}
            />
            {img ? (
                <img src={img} alt="" className={styles.image} />
            ) : (
                <div className={styles.noImage} />
            )}
            <div className={styles.info}>
                <div className={styles.name}>
                    {label}
                    {placement === PLACEMENT_BASEMAP && (
                        <span className={styles.placementPill}>
                            {getLayerSourcePlacementLabel(placement)}
                        </span>
                    )}
                    {isNew && (
                        <span className={styles.newPill}>
                            {i18n.t('Added in this session')}
                        </span>
                    )}
                </div>
                {description && (
                    <div className={styles.description}>{description}</div>
                )}
                {meta.length > 0 && (
                    <div className={styles.meta}>
                        {meta.map(({ label: metaLabel, value }) => (
                            <span key={metaLabel} className={styles.metaItem}>
                                <span className={styles.metaLabel}>
                                    {metaLabel}
                                </span>
                                {value}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

LayerSource.propTypes = {
    isAdded: PropTypes.bool.isRequired,
    layerSource: PropTypes.object.isRequired,
    onToggle: PropTypes.func.isRequired,
    isLocked: PropTypes.bool,
    isNew: PropTypes.bool,
    lockedReason: PropTypes.string,
    placement: PropTypes.string,
}

export default LayerSource
