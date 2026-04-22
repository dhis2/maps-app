import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import { NO_DATA_COLOR } from '../../../constants/layers.js'
import { Checkbox, ColorPicker, TextField } from '../../core/index.js'
import styles from '../styles/LayerDialog.module.css'

const UnclassifiedLegend = ({ value, onChange, label }) => {
    const onCheck = useCallback(
        (checked) => onChange(checked ? { color: NO_DATA_COLOR } : undefined),
        [onChange]
    )

    return (
        <div>
            <Checkbox
                label={label ?? i18n.t('Include unclassified org units')}
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
                        placeholder={i18n.t('Unclassified')}
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

UnclassifiedLegend.propTypes = {
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    value: PropTypes.shape({
        color: PropTypes.string.isRequired,
        name: PropTypes.string,
    }),
}

export default UnclassifiedLegend
