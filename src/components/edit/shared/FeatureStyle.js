import i18n from '@dhis2/d2-i18n'
import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { Checkbox, ColorPicker, NumberField } from '../../core'
import styles from '../styles/LayerDialog.module.css'
import { useEffect } from 'react'

const FILL = 'color'
const STROKE_COLOR = 'strokeColor'
const STROKE_WIDTH = 'weight'
const POINT_SIZE = 'pointSize'

const defaultNoTransparentFillColor = '#EEEEEE'

// Wrapped in a function to make sure i18n is applied
const getFields = () => [
    {
        id: FILL,
        label: i18n.t('Fill color'),
        type: 'color',
        default: 'transparent',
        allowTransparent: true,
    },
    {
        id: STROKE_COLOR,
        label: i18n.t('Line/stroke color'),
        type: 'color',
        default: '#333333',
    },
    {
        id: STROKE_WIDTH,
        label: i18n.t('Line/stroke width'),
        type: 'number',
        default: 1,
    },
    {
        id: POINT_SIZE,
        label: i18n.t('Point size'),
        type: 'number',
        default: 5,
    },
]

const FeatureStyle = ({ style, onChange }) => {
    const fields = useMemo(() => getFields(), [])

    useEffect(() => {
        if (!style) {
            onChange({
                [FILL]: 'transparent',
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
                type === 'color' ? (
                    <div key={id}>
                        {allowTransparent && (
                            <Checkbox
                                label={label}
                                checked={style[id] !== 'transparent'}
                                onChange={(isChecked) =>
                                    onChange({
                                        [id]: isChecked
                                            ? defaultNoTransparentFillColor
                                            : 'transparent',
                                    })
                                }
                            />
                        )}
                        {style[id] !== 'transparent' && (
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
                        onChange={(value) => onChange({ [id]: value })}
                        className={styles.narrowField}
                    />
                )
            )}
        </>
    )
}

FeatureStyle.propTypes = {
    fields: PropTypes.array,
    style: PropTypes.object,
    onChange: PropTypes.func.isRequired,
}

export default FeatureStyle
