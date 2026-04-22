import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import { NO_DATA_COLOR } from '../../../constants/layers.js'
import { Checkbox, ColorPicker, TextField } from '../../core/index.js'
import styles from '../styles/LayerDialog.module.css'

const NoDataLegend = ({ value, onChange, label, placeholder }) => {
    const onCheck = useCallback(
        (checked) => onChange(checked ? { color: NO_DATA_COLOR } : undefined),
        [onChange]
    )

    return (
        <div>
            <Checkbox
                label={label ?? i18n.t('Include org units with no data')}
                checked={!!value}
                onChange={onCheck}
            />
            {value && (
                <div className={styles.colorNameRow}>
                    <ColorPicker
                        label={i18n.t('Color')}
                        color={value.color}
                        onChange={(color) => onChange({ ...value, color })}
                        width={50}
                        className={styles.colorNameField}
                    />
                    <TextField
                        label={i18n.t('Name')}
                        value={value.name || ''}
                        placeholder={placeholder ?? i18n.t('No data')}
                        onChange={(name) =>
                            onChange({ ...value, name: name || undefined })
                        }
                        className={styles.colorNameText}
                    />
                </div>
            )}
        </div>
    )
}

NoDataLegend.propTypes = {
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.shape({
        color: PropTypes.string.isRequired,
        name: PropTypes.string,
    }),
}

export default NoDataLegend
