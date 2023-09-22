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

    let warningText

    if (Number.isNaN(min)) {
        warningText = i18n.t('Min value is required')
    } else if (Number.isNaN(max)) {
        warningText = i18n.t('Max value is required')
    } else if (max <= min) {
        warningText = i18n.t('Max should be greater than min')
    } else if (steps < minSteps || steps > maxSteps) {
        warningText = i18n.t('Valid steps are {{minSteps}} to {{maxSteps}}', {
            minSteps,
            maxSteps,
        })
    }

    return (
        <div>
            <p>
                {i18n.t('Unit: {{ unit }}', {
                    unit,
                    nsSeparator: '|', // https://github.com/i18next/i18next/issues/361
                })}
            </p>
            <div key="minmax" className={styles.flexInnerColumnFlow}>
                <NumberField
                    label={i18n.t('Min')}
                    value={min}
                    onChange={(min) => setStyle({ min: parseInt(min) })}
                    className={styles.flexInnerColumn}
                />
                <NumberField
                    label={i18n.t('Max')}
                    value={max}
                    onChange={(max) => setStyle({ max: parseInt(max) })}
                    className={styles.flexInnerColumn}
                />
                <NumberField
                    label={i18n.t('Steps')}
                    value={steps}
                    min={minSteps}
                    max={maxSteps}
                    onChange={onStepsChange}
                    className={styles.flexInnerColumn}
                />
                {warningText && (
                    <div className={styles.eeError}>{warningText}</div>
                )}
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
