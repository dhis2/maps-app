import PropTypes from 'prop-types'
import React from 'react'
import Drawer from '../core/Drawer.js'
import Legend from '../legend/Legend.js'
import styles from './styles/DownloadLegend.module.css'

const DownloadLegend = ({ layers, showName }) => {
    const legends = layers
        .filter((layer) => layer.legend)
        .map((layer) => layer.legend)
        .reverse()

    return (
        <Drawer>
            <div className={styles.downloadLegend}>
                {legends.map((legend, index) => (
                    <div key={index} className={styles.legend}>
                        <h2 className={styles.title}>
                            {legend.title}
                            <span className={styles.period}>
                                {legend.period}
                            </span>
                        </h2>
                        <Legend {...legend} />
                    </div>
                ))}
            </div>
        </Drawer>
    )
}

DownloadLegend.propTypes = {
    layers: PropTypes.array.isRequired,
    showName: PropTypes.bool.isRequired,
}

export default DownloadLegend
