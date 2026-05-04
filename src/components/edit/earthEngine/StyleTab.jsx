import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCountFeaturesWithoutCoordinates } from '../../../actions/layerEdit.js'
import { EE_BUFFER } from '../../../constants/layers.js'
import { Checkbox } from '../../core/index.js'
import BufferRadius from '../shared/BufferRadius.jsx'
import styles from '../styles/LayerDialog.module.css'
import LegendPreview from './LegendPreview.jsx'
import StyleSelect from './StyleSelect.jsx'

const StyleTab = ({ unit, style, showBelowMin, hasOrgUnitField }) => {
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

    return (
        <div className={styles.flexColumnFlow}>
            <div className={styles.flexColumn}>
                {isClassStyle && <StyleSelect unit={unit} style={style} />}
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
            {isClassStyle && (
                <LegendPreview style={style} showBelowMin={showBelowMin} />
            )}
        </div>
    )
}

StyleTab.propTypes = {
    hasOrgUnitField: PropTypes.bool.isRequired,
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
