import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useState, useCallback } from 'react'
import { connect } from 'react-redux'
import { setStyle } from '../../../actions/layerEdit.js'
import { getColorScale, getColorPalette } from '../../../util/colors.js'
import { NumberField, ColorScaleSelect } from '../../core/index.js'
import styles from '../styles/LayerDialog.module.css'

const minSteps = 3
const maxSteps = 9

export const getStyleSelectError = ({ min, max, steps, palette, ranges }) => {
    steps = steps ?? palette?.length
    if (Number.isNaN(min)) {
        return i18n.t('Min value is required')
    }
    if (Number.isNaN(max)) {
        return i18n.t('Max value is required')
    }
    if (max <= min) {
        return i18n.t('Max should be greater than min')
    }
    if (!ranges && steps && (steps < minSteps || steps > maxSteps)) {
        return i18n.t('Valid steps are {{minSteps}} to {{maxSteps}}', {
            minSteps,
            maxSteps,
        })
    }
    return undefined
}

const StyleSelect = ({ unit, style, setStyle }) => {
    const { min, max, palette } = style
    const [steps, setSteps] = useState(palette.length)

    const onStepsChange = useCallback(
        (steps) => {
            if (steps >= minSteps && steps <= maxSteps) {
                const scale = getColorScale(palette)
                const newPalette = getColorPalette(scale, steps)

                if (newPalette) {
                    setStyle({ palette: newPalette })
                }
            }

            setSteps(steps)
        },
        [palette, setStyle]
    )

    const errorText = getStyleSelectError({
        min,
        max,
        steps,
    })

    return (
        <div>
            <p>
                {i18n.t('Unit')}: {unit}
            </p>
            <div key="minmax" className={styles.flexInnerColumnFlow}>
                <NumberField
                    label={i18n.t('Min')}
                    value={min}
                    onChange={(min) => setStyle({ min })}
                    className={styles.flexInnerColumn}
                />
                <NumberField
                    label={i18n.t('Max')}
                    value={max}
                    onChange={(max) => setStyle({ max })}
                    className={styles.flexInnerColumn}
                />
                <NumberField
                    label={i18n.t('Steps')}
                    value={steps}
                    min={minSteps}
                    max={maxSteps}
                    onChange={onStepsChange}
                    className={styles.stepField}
                />
                {errorText && <div className={styles.eeError}>{errorText}</div>}
                <div className={styles.scale}>
                    <ColorScaleSelect
                        palette={style.palette}
                        onChange={(palette) => setStyle({ palette })}
                        width={260}
                    />
                </div>
            </div>
        </div>
    )
}

StyleSelect.propTypes = {
    setStyle: PropTypes.func.isRequired,
    unit: PropTypes.string.isRequired,
    style: PropTypes.shape({
        max: PropTypes.number.isRequired,
        min: PropTypes.number.isRequired,
        palette: PropTypes.array.isRequired,
    }),
}

export default connect(null, {
    setStyle,
})(StyleSelect)
