import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    setCountFeaturesWithoutCoordinates,
    setStyle,
} from '../../../actions/layerEdit.js'
import { EE_BUFFER } from '../../../constants/layers.js'
import {
    getColorPalette,
    defaultColorScaleName,
    defaultClasses,
} from '../../../util/colors.js'
import { Checkbox } from '../../core/index.js'
import BufferRadius from '../shared/BufferRadius.jsx'
import styles from '../styles/LayerDialog.module.css'
import LegendPreview from './LegendPreview.jsx'
import StyleSelect from './StyleSelect.jsx'

const StyleTab = ({
    unit,
    style,
    defaultStyle,
    customColorScaleName,
    showBelowMin,
    hasOrgUnitField,
}) => {
    const dispatch = useDispatch()
    const countFeaturesWithoutCoordinates = useSelector(
        (state) => state.layerEdit.countFeaturesWithoutCoordinates
    )
    const { min, max, palette } = style
    const isClassStyle =
        min !== undefined &&
        max !== undefined &&
        palette !== undefined &&
        palette.length < 10

    const hasReferenceScale = !!defaultStyle?.ranges?.length
    const useCustomScale = hasReferenceScale && !style?.ranges?.length

    const handleScaleToggle = useCallback(
        (checked) => {
            if (checked) {
                const { min, max } = defaultStyle ?? {}
                dispatch(
                    setStyle({
                        min,
                        max,
                        palette: getColorPalette(
                            customColorScaleName ?? defaultColorScaleName,
                            defaultClasses
                        ),
                        ranges: null,
                    })
                )
            } else {
                dispatch(setStyle(defaultStyle))
            }
        },
        [customColorScaleName, defaultStyle, dispatch]
    )

    return (
        <div className={styles.flexColumnFlow}>
            <div className={styles.flexColumn}>
                {unit && (
                    <p>
                        {i18n.t('Unit')}: {unit}
                    </p>
                )}
                {hasReferenceScale && (
                    <Checkbox
                        label={i18n.t('Use custom legend')}
                        checked={useCustomScale}
                        onChange={handleScaleToggle}
                    />
                )}
                {isClassStyle && <StyleSelect style={style} />}
                <BufferRadius
                    label={i18n.t('Facility buffer')}
                    defaultRadius={EE_BUFFER}
                    hasOrgUnitField={hasOrgUnitField}
                    forceShowNumberField={true}
                />
                <Checkbox
                    label={i18n.t('Count org units without coordinates')}
                    checked={!!countFeaturesWithoutCoordinates}
                    onChange={(checked) =>
                        dispatch(setCountFeaturesWithoutCoordinates(checked))
                    }
                />
            </div>
            {(isClassStyle || (hasReferenceScale && !useCustomScale)) && (
                <LegendPreview style={style} showBelowMin={showBelowMin} />
            )}
        </div>
    )
}

StyleTab.propTypes = {
    hasOrgUnitField: PropTypes.bool.isRequired,
    customColorScaleName: PropTypes.string,
    defaultStyle: PropTypes.shape({
        max: PropTypes.number,
        min: PropTypes.number,
        palette: PropTypes.array,
        ranges: PropTypes.array,
    }),
    showBelowMin: PropTypes.bool,
    style: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.shape({
            color: PropTypes.string,
            max: PropTypes.number,
            min: PropTypes.number,
            palette: PropTypes.array,
            strokeWidth: PropTypes.number,
        }),
    ]),
    unit: PropTypes.string,
}

export default StyleTab
