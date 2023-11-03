import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { EE_BUFFER } from '../../../constants/layers.js'
import BufferRadius from '../shared/BufferRadius.js'
import styles from '../styles/LayerDialog.module.css'
import LegendPreview from './LegendPreview.js'
import StyleSelect from './StyleSelect.js'

const StyleTab = ({ unit, style, hasOrgUnitField }) => {
    const { min, max, palette } = style
    const isClassStyle =
        min !== undefined && max !== undefined && palette !== undefined

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
            {isClassStyle && <LegendPreview style={style} />}
        </div>
    )
}

StyleTab.propTypes = {
    hasOrgUnitField: PropTypes.bool.isRequired,
    unit: PropTypes.string,
    style: PropTypes.shape({
        max: PropTypes.number,
        min: PropTypes.number,
        palette: PropTypes.array,
        color: PropTypes.string,
        strokeWidth: PropTypes.number,
    }),
}

export default StyleTab
