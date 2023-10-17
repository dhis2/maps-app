import i18n from '@dhis2/d2-i18n'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/NorthArrowPosition.module.css'

const northArrowPositions = ['topleft', 'topright', 'bottomleft', 'bottomright']

const NorthArrowPosition = ({ position, onChange }) => (
    <div className={styles.root}>
        <label className={styles.label}>{i18n.t('Position:')}</label>
        {northArrowPositions.map((pos) => (
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

NorthArrowPosition.propTypes = {
    position: PropTypes.oneOf(northArrowPositions).isRequired,
    onChange: PropTypes.func.isRequired,
}

export default NorthArrowPosition
