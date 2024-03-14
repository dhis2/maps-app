import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useMemo, useEffect } from 'react'
import { Checkbox, ColorPicker, NumberField } from '../../core/index.js'
import styles from '../styles/LayerDialog.module.css'

const FILL = 'color'
const STROKE_COLOR = 'strokeColor'
const STROKE_WIDTH = 'weight'
const POINT_SIZE = 'pointSize'

const FILL_TRANSPARENT = 'transparent'
const FIELD_TYPE_COLOR = 'color'
const FIELD_TYPE_NUMBER = 'number'

const defaultNoTransparentFillColor = '#EEEEEE'

// Wrapped in a function to make sure i18n is applied
const getFields = () => [
    {
        id: FILL,
        label: i18n.t('Fill color'),
        type: FIELD_TYPE_COLOR,
        defaultValue: 'transparent',
        allowTransparent: true,
    },
    {
        id: STROKE_COLOR,
        label: i18n.t('Line/stroke color'),
        type: FIELD_TYPE_COLOR,
        defaultValue: '#333333',
    },
    {
        id: STROKE_WIDTH,
        label: i18n.t('Line/stroke width'),
        type: FIELD_TYPE_NUMBER,
        defaultValue: 1,
        min: 0,
        max: 10,
        helpText: i18n.t('Line/stroke width must be between 0-10.'),
    },
    {
        id: POINT_SIZE,
        label: i18n.t('Point radius'),
        type: FIELD_TYPE_NUMBER,
        defaultValue: 5,
        min: 1,
    },
]

const FeatureStyle = ({ style, onChange }) => {
    const fields = useMemo(() => getFields(), [])

    useEffect(() => {
        if (!style) {
            onChange({
                [FILL]: FILL_TRANSPARENT,
                [STROKE_COLOR]: '#333333',
                [STROKE_WIDTH]: 1,
                [POINT_SIZE]: 5,
            })
        }
    }, [style, onChange])

    if (!style) {
        return null
    }

    return (
        <>
            {fields.map(
                ({
                    id,
                    label,
                    type,
                    allowTransparent,
                    min,
                    max,
                    defaultValue,
                    helpText,
                }) =>
                    type === FIELD_TYPE_COLOR ? (
                        <div key={id}>
                            {allowTransparent && (
                                <Checkbox
                                    label={label}
                                    checked={style[id] !== FILL_TRANSPARENT}
                                    onChange={(isChecked) =>
                                        onChange({
                                            [id]: isChecked
                                                ? defaultNoTransparentFillColor
                                                : FILL_TRANSPARENT,
                                        })
                                    }
                                />
                            )}
                            {style[id] !== FILL_TRANSPARENT && (
                                <ColorPicker
                                    label={allowTransparent ? '' : label}
                                    color={style[id]}
                                    onChange={(color) =>
                                        onChange({ [id]: color })
                                    }
                                    className={styles.narrowField}
                                />
                            )}
                        </div>
                    ) : (
                        <NumberField
                            key={id}
                            label={label}
                            value={style[id]}
                            onChange={(value) => {
                                let val = parseInt(value)
                                if (min || max) {
                                    if (val < min || Number.isNaN(val)) {
                                        val = min
                                    }
                                    if (val > max) {
                                        val = max
                                    }
                                }
                                if (Number.isNaN(val)) {
                                    val = defaultValue
                                }
                                onChange({ [id]: parseInt(val) })
                            }}
                            inputWidth={'120px'}
                            min={min}
                            max={max}
                            helpText={helpText}
                        />
                    )
            )}
        </>
    )
}

FeatureStyle.propTypes = {
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
}

export default FeatureStyle
