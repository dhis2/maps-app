import PropTypes from 'prop-types'
import React from 'react'
import { EE_BUFFER } from '../../../constants/layers.js'
import BufferRadius from '../shared/BufferRadius.js'
import styles from '../styles/LayerDialog.module.css'
import LegendPreview from './LegendPreview.js'
import StyleSelect from './StyleSelect.js'

const StyleTab = ({ unit, params, hasOrgUnitField }) => (
    <div className={styles.flexColumnFlow}>
        <div className={styles.flexColumn}>
            {params && <StyleSelect unit={unit} params={params} />}
            <BufferRadius
                defaultRadius={EE_BUFFER}
                hasOrgUnitField={hasOrgUnitField}
            />
        </div>
        {params && <LegendPreview params={params} />}
    </div>
)

StyleTab.propTypes = {
    hasOrgUnitField: PropTypes.bool.isRequired,
    unit: PropTypes.string,
    params: PropTypes.shape({
        max: PropTypes.number.isRequired,
        min: PropTypes.number.isRequired,
        palette: PropTypes.string.isRequired,
    }),
}

export default StyleTab
