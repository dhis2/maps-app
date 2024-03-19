import PropTypes from 'prop-types'
import React from 'react'
import Legend from '../legend/Legend.js'
import styles from './styles/DownloadLegend.module.css'

const DownloadLegend = ({ layers }) =>
    layers
        .filter((layer) => layer.legend)
        .map((layer) => layer.legend)
        .reverse()
        .map((legend, index) => (
            <div key={index} className={styles.legend}>
                <h2 className={styles.title} data-test="download-legend-title">
                    {legend.title}
                    <span className={styles.period}>{legend.period}</span>
                </h2>
                <Legend {...legend} />
            </div>
        ))

DownloadLegend.propTypes = {
    layers: PropTypes.array.isRequired,
}

export default DownloadLegend
