import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useRef } from 'react'
import { Checkbox, ColorPicker, TextField } from '../../core/index.js'
import styles from '../styles/LayerDialog.module.css'

const OptionalLegendItem = ({
    value,
    onChange,
    label,
    placeholder,
    defaultColor,
}) => {
    const lastValue = useRef(null)

    const onCheck = (checked) => {
        if (checked) {
            onChange(lastValue.current ?? { color: defaultColor })
        } else {
            lastValue.current = value
            onChange(undefined)
        }
    }

    return (
        <div>
            <Checkbox label={label} checked={!!value} onChange={onCheck} />
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
                        placeholder={placeholder}
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

OptionalLegendItem.propTypes = {
    defaultColor: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.shape({
        color: PropTypes.string.isRequired,
        name: PropTypes.string,
    }),
}

export default OptionalLegendItem
