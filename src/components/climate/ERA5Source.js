import React from 'react'
import styles from './styles/DataSource.module.css'

const ERA5Source = () => (
    <div className={styles.source}>
        Data from{' '}
        <a href="https://www.ecmwf.int" target="_blank" rel="noreferrer">
            ECMWF
        </a>{' '}
        /{' '}
        <a
            href="https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_LAND_MONTHLY_AGGR"
            target="_blank"
            rel="noreferrer"
        >
            Google Earth Engine
        </a>
    </div>
)

export default ERA5Source
