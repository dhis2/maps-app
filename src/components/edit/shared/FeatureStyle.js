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
        default: 'transparent',
        allowTransparent: true,
    },
    {
        id: STROKE_COLOR,
        label: i18n.t('Line/stroke color'),
        type: FIELD_TYPE_COLOR,
        default: '#333333',
    },
    {
        id: STROKE_WIDTH,
        label: i18n.t('Line/stroke width'),
        type: FIELD_TYPE_NUMBER,
        default: 1,
    },
    {
        id: POINT_SIZE,
        label: i18n.t('Point size'),
        type: FIELD_TYPE_NUMBER,
        default: 5,
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
            {fields.map(({ id, label, type, allowTransparent }) =>
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
                                onChange={(color) => onChange({ [id]: color })}
                                className={styles.narrowField}
                            />
                        )}
                    </div>
                ) : (
                    <NumberField
                        key={id}
                        label={label}
                        value={style[id]}
                        onChange={(value) =>
                            onChange({ [id]: parseInt(value) })
                        }
                        className={styles.narrowField}
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
