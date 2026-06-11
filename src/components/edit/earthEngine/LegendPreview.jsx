import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { createLegend } from '../../../loaders/earthEngineLoader.js'
import { useCachedData } from '../../cachedDataProvider/CachedDataProvider.jsx'
import Legend from '../../legend/Legend.jsx'
import styles from '../styles/LayerDialog.module.css'

const styleIsValid = ({ min, max }) =>
    !Number.isNaN(min) && !Number.isNaN(max) && max > min

const LegendPreview = ({ style, showBelowMin }) => {
    const {
        systemSettings: { keyAnalysisDigitGroupSeparator },
    } = useCachedData()
    const legend =
        styleIsValid(style) &&
        createLegend(style, showBelowMin, keyAnalysisDigitGroupSeparator)

    return legend ? (
        <div className={styles.flexColumn}>
            <div className={styles.legendTitle}>{i18n.t('Legend preview')}</div>
            <Legend items={legend} />
        </div>
    ) : null
}

LegendPreview.propTypes = {
    showBelowMin: PropTypes.bool,
    style: PropTypes.shape({
        max: PropTypes.number.isRequired,
        min: PropTypes.number.isRequired,
        palette: PropTypes.array.isRequired,
    }),
}

export default LegendPreview
