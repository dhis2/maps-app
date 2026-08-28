import i18n from '@dhis2/d2-i18n'
import { Tooltip } from '@dhis2/ui'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { getLayerSourceDescription } from '../../../util/layerSources.js'
import PinIcon from './PinIcon.jsx'
import styles from './styles/Layer.module.css'

const Layer = ({ layer, onClick, isPinned, onTogglePin }) => {
    const { img, type, name } = layer
    const label = name || i18n.t(type)
    const description = getLayerSourceDescription(layer)
    const dataTest = `addlayeritem-${label
        .toLowerCase()
        .replaceAll(/\s/g, '_')}`

    return (
        <div
            className={styles.container}
            onClick={() => onClick(layer)}
            data-test={dataTest}
        >
            {onTogglePin && (
                <button
                    type="button"
                    className={cx(styles.pin, { [styles.isPinned]: isPinned })}
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
            <Tooltip
                placement="bottom"
                content={description || label}
                openDelay={1000}
                closeDelay={100}
            >
                <div>
                    {img ? (
                        <img src={img} className={styles.image} alt="" />
                    ) : (
                        <div className={styles.noImage}>
                            {i18n.t('External layer')}
                        </div>
                    )}
                    <div className={styles.name}>{label}</div>
                </div>
            </Tooltip>
        </div>
    )
}

Layer.propTypes = {
    layer: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    isPinned: PropTypes.bool,
    onTogglePin: PropTypes.func,
}

export default Layer
