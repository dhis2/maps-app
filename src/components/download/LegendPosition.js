import i18n from '@dhis2/d2-i18n'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/LegendPosition.module.css'

export const legendPositions = [
    'topleft',
    'topright',
    'bottomleft',
    'bottomright',
]

export const LegendPosition = ({ position, onChange }) => (
    <div className={styles.root}>
        <label className={styles.label}>{i18n.t('Legend position')}</label>
        {legendPositions.map((pos) => (
            <div
                key={pos}
                className={cx(styles.position, {
                    [styles.selected]: pos === position,
                })}
                onClick={pos !== position ? () => onChange(pos) : null}
            >
                <div className={cx(styles.legend, styles[pos])} />
            </div>
        ))}
    </div>
)

LegendPosition.propTypes = {
    position: PropTypes.oneOf(legendPositions).isRequired,
    onChange: PropTypes.func.isRequired,
}

export default LegendPosition
