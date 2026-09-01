import i18n from '@dhis2/d2-i18n'
import { IconInfo16 } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import {
    getLayerSourceLabel,
    getLayerSourceDescription,
    getLayerSourceDataTest,
} from '../../../util/layerSources.js'
import PinIcon from './PinIcon.jsx'
import styles from './styles/LayerSourceRow.module.css'

const LayerSourceRow = ({
    layer,
    onClick,
    isPinned,
    onTogglePin,
    onShowInfo,
    isInfoOpen,
}) => {
    const label = getLayerSourceLabel(layer)
    const description = getLayerSourceDescription(layer)

    return (
        <div
            className={styles.row}
            onClick={() => onClick(layer)}
            data-test={getLayerSourceDataTest(label)}
        >
            {layer.img ? (
                <img src={layer.img} className={styles.thumb} alt="" />
            ) : (
                <div className={styles.noThumb} />
            )}
            <div className={styles.text}>
                <div className={styles.label}>{label}</div>
                {description && (
                    <div className={styles.description}>{description}</div>
                )}
            </div>
            <div className={styles.actions}>
                {onShowInfo && (
                    <button
                        type="button"
                        className={cx(styles.info, {
                            [styles.isInfoOpen]: isInfoOpen,
                        })}
                        title={i18n.t('About this layer')}
                        onClick={(event) => {
                            event.stopPropagation()
                            onShowInfo(layer, event)
                        }}
                        data-test="addlayeritem-info"
                    >
                        <IconInfo16 />
                    </button>
                )}
                {onTogglePin && (
                    <button
                        type="button"
                        className={cx(styles.pin, {
                            [styles.isPinned]: isPinned,
                        })}
                        title={isPinned ? i18n.t('Unpin') : i18n.t('Pin')}
                        onClick={(event) => {
                            event.stopPropagation()
                            onTogglePin(layer)
                        }}
                        data-test="addlayeritem-pin"
                    >
                        <PinIcon filled={isPinned} />
                    </button>
                )}
            </div>
        </div>
    )
}

LayerSourceRow.propTypes = {
    layer: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    isInfoOpen: PropTypes.bool,
    isPinned: PropTypes.bool,
    onShowInfo: PropTypes.func,
    onTogglePin: PropTypes.func,
}

export default LayerSourceRow
