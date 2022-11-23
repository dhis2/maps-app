import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import { NO_DATA_COLOR } from '../../../constants/layers.js'
import { Checkbox, ColorPicker } from '../../core/index.js'
import styles from './styles/NoDataColor.module.css'

const NoDataColor = ({ value, onChange, className }) => {
    const onCheck = useCallback(
        (val) => onChange(val ? NO_DATA_COLOR : undefined),
        []
    )

    return (
        <div className={className}>
            <Checkbox
                label={i18n.t('Show no data')}
                checked={!!value}
                onChange={onCheck}
                className={styles.checkbox}
            />
            {value && (
                <ColorPicker
                    label={i18n.t('Color')}
                    color={value}
                    onChange={onChange}
                    width={50}
                    className={styles.colorPicker}
                />
            )}
        </div>
    )
}

NoDataColor.propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    value: PropTypes.string,
}

export default NoDataColor
