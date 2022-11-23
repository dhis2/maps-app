import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import Legend from '../legend/Legend.js'
import { legendPositions } from './LegendPosition.js'
import styles from './styles/DownloadLegend.module.css'

export const DownloadLegend = ({ position, layers, showName }) => {
    const legends = layers
        .filter((layer) => layer.legend)
        .map((layer) => layer.legend)
        .reverse()

    return (
        <div
            className={cx(styles.downloadLegend, styles[position], {
                [styles.name]: showName && position.substring(0, 3) === 'top',
            })}
        >
            {legends.map((legend, index) => (
                <div key={index} className={styles.legend}>
                    <h2 className={styles.title}>
                        {legend.title}
                        <span className={styles.period}>{legend.period}</span>
                    </h2>
                    <Legend {...legend} />
                </div>
            ))}
        </div>
    )
}

DownloadLegend.propTypes = {
    layers: PropTypes.array.isRequired,
    position: PropTypes.oneOf(legendPositions).isRequired,
    showName: PropTypes.bool.isRequired,
}

export default DownloadLegend
