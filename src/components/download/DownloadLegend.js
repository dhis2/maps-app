import PropTypes from 'prop-types'
import React from 'react'
import { useSelector } from 'react-redux'
import Legend from '../legend/Legend.js'
import InsetMap from './InsetMap.js'
import styles from './styles/DownloadLegend.module.css'

const DownloadLegend = ({ map }) => {
    const { showName, showDescription, showLegend, showInsetMap } = useSelector(
        (state) => state.download
    )
    const { mapViews, name, description } = useSelector((state) => state.map)

    return (
        <div className={styles.downloadLegend}>
            {showName && name && <h1>{name}</h1>}
            {showDescription && description && <p>{description}</p>}

            {showLegend &&
                mapViews
                    .filter((layer) => layer.legend)
                    .map((layer) => layer.legend)
                    .reverse()
                    .map((legend, index) => (
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
            {showInsetMap && <InsetMap map={map} />}
        </div>
    )
}

DownloadLegend.propTypes = {
    map: PropTypes.object.isRequired,
}

export default DownloadLegend
