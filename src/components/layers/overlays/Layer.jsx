import i18n from '@dhis2/d2-i18n'
import { Tooltip } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/Layer.module.css'

const Layer = ({ layer, onClick }) => {
    const { img, type, name } = layer
    const label = name || i18n.t(type)
    const dataTest = `addlayeritem-${label.toLowerCase().replace(/\s/g, '_')}`

    return (
        <div
            className={styles.container}
            onClick={() => onClick(layer)}
            data-test={dataTest}
        >
            <Tooltip
                placement="bottom"
                content={label}
                openDelay={300}
                closeDelay={100}
                className={styles.tooltip}
            >
                <div>
                    {img ? (
                        <img src={img} className={styles.image} />
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
}

export default Layer
