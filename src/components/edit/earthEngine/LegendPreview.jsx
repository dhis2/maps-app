import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React from 'react'
import { createLegend } from '../../../loaders/earthEngineLoader.js'
import LegendItem from '../../legend/LegendItem.jsx'
import styles from '../styles/LayerDialog.module.css'

const styleIsValid = ({ min, max }) =>
    !Number.isNaN(min) && !Number.isNaN(max) && max > min

const LegendPreview = ({ style, showBelowMin }) => {
    const legend = styleIsValid(style) && createLegend(style, showBelowMin)

    return legend ? (
        <div className={styles.flexColumn}>
            <div className={styles.legendTitle}>{i18n.t('Legend preview')}</div>
            <div className={styles.legend}>
                <table>
                    <tbody>
                        {legend.map((item, index) => (
                            <LegendItem {...item} key={`item-${index}`} />
                        ))}
                    </tbody>
                </table>
            </div>
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
