import PropTypes from 'prop-types'
import React from 'react'
import { EE_BUFFER } from '../../../constants/layers.js'
import BufferRadius from '../shared/BufferRadius.js'
import styles from '../styles/LayerDialog.module.css'
import LegendPreview from './LegendPreview.js'
import StyleSelect from './StyleSelect.js'

const StyleTab = ({ unit, style, hasOrgUnitField }) => (
    <div className={styles.flexColumnFlow}>
        <div className={styles.flexColumn}>
            {style && <StyleSelect unit={unit} style={style} />}
            <BufferRadius
                defaultRadius={EE_BUFFER}
                hasOrgUnitField={hasOrgUnitField}
            />
        </div>
        {style && <LegendPreview style={style} />}
    </div>
)

StyleTab.propTypes = {
    hasOrgUnitField: PropTypes.bool.isRequired,
    unit: PropTypes.string,
    style: PropTypes.shape({
        max: PropTypes.number.isRequired,
        min: PropTypes.number.isRequired,
        palette: PropTypes.array.isRequired,
    }),
}

export default StyleTab
