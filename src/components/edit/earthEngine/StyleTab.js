import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { EE_BUFFER } from '../../../constants/layers.js'
import BufferRadius from '../shared/BufferRadius.js'
import styles from '../styles/LayerDialog.module.css'
import LegendPreview from './LegendPreview.js'
import StyleSelect from './StyleSelect.js'

const StyleTab = ({
    unit,
    style,
    showBelowMin,
    precision,
    hasOrgUnitField,
}) => {
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
                />
            </div>
            {isClassStyle && (
                <LegendPreview
                    style={style}
                    showBelowMin={showBelowMin}
                    precision={precision}
                />
            )}
        </div>
    )
}

StyleTab.propTypes = {
    hasOrgUnitField: PropTypes.bool.isRequired,
    precision: PropTypes.number,
    showBelowMin: PropTypes.bool,
    style: PropTypes.shape({
        color: PropTypes.string,
        max: PropTypes.number,
        min: PropTypes.number,
        palette: PropTypes.array,
        strokeWidth: PropTypes.number,
    }),
    unit: PropTypes.string,
}

export default StyleTab
